import {BIRTH_YEAR,yearNow,displayYear,shortYear,parseBirthInput,spiralYears,spiralPoint,spiralCell,spiralTextPath,spiralSlice,zodiacRoundEnd} from './spiral.mjs?v=55';
import {branches,phases,profiles,stemRing,sanheProfile,stemAtBranch,dayPillar,pillarShift,wrap,snap,snapStem,angleDelta,nextProfile,profilePeakBranch} from './core.mjs?v=55';
const $ = id => document.getElementById(id);
const svg = $('wheel');
let direction=1;
let mode='phases',birthYear=BIRTH_YEAR,era='BE',cycle=null,selectedYear=birthYear;
const currentYear=yearNow(new Date());
let profile='wood', offset=0, selected=0, practice=false, revealed=false, drag=null, selectedPhase=null;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const today=dayPillar(new Date());
// ตอนโหลด หมุนวง 12 วัฏจักรไปยังซาฮะของกิ่งดินวันนี้ ให้ลูกศรชี้ตี้วั่งของธาตุนั้น
profile=sanheProfile(today.branch);offset=profiles[profile].start;
let showStems=true,showPhases=true;try{showStems=localStorage.getItem('showStems')!=='0';showPhases=localStorage.getItem('showPhases')!=='0';}catch{}
// รัศมีวงปรับอัตโนมัติตามวงที่เปิด: ก้านฟ้าชิดวงถัดเข้าไป และ viewBox พอดีวงนอกสุด
const targetLayout=()=>{const stemIn=showPhases?349:204,extent=showStems?stemIn+49:showPhases?343:200;return {stemIn,extent,stemAlpha:showStems?1:0,phaseAlpha:showPhases?1:0};};
let layout=targetLayout(),layoutFrame=0;
function animateLayout(){
  cancelAnimationFrame(layoutFrame);
  const from={...layout},to=targetLayout(),duration=reducedMotion.matches?0:420;let began;
  const frame=time=>{
    if(began===undefined)began=time;
    const t=duration?Math.min(1,(time-began)/duration):1,e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    for(const key in to)layout[key]=from[key]+(to[key]-from[key])*e;
    renderWheel();
    layoutFrame=t<1?requestAnimationFrame(frame):0;
  };
  layoutFrame=requestAnimationFrame(frame);
}
let stemRotation=pillarShift(today)*30,stemDestination=stemRotation,stemFrame=0;
const stemColors={wood:'#bfd8b8',fire:'#eebda1',earth:'#e1cf9c',metal:'#d2d6da',water:'#b8d0e4',void:'#eeede8'};
// พื้นวงกิ่งดินเข้มกว่าสีฤดูของก้นหอยเล็กน้อย
const branchColors={spring:'#d2e3cf',summer:'#efd2bb',autumn:'#e3d6b4',winter:'#cfdee2'},branchSelectedColors={spring:'#c2d6bd',summer:'#e5c3a7',autumn:'#d6c79f',winter:'#bfd2d8'};
let rotation=offset*30, destination=rotation, motionFrame=0, dragFrame=0;
const colors={spring:'#dfecdd',summer:'#f6dfcc',autumn:'#ece2c6',winter:'#dce8eb'};
const selectedColors={spring:'#d0dfcc',summer:'#ecd0b7',autumn:'#ded2af',winter:'#cbdde2'};
// 長生, 帝旺 and 墓 share the element palette of the selected yang stem.
const phaseColors={wood:'#c9dfc0',fire:'#f1c0a5',metal:'#d3d7db',water:'#bed5eb'};
const highlightedPhases=new Set([0,4,8]);
const directionElements=['water','earth','wood','wood','fire','earth','metal','metal'];
const directionColors={wood:'#dfecdd',fire:'#f6dfcc',earth:'#ece2c6',metal:'#e1e4e7',water:'#dce8eb'};
const darken=(color,f)=>'#'+color.slice(1).match(/../g).map(channel=>Math.round(parseInt(channel,16)*f).toString(16).padStart(2,'0')).join('');
// ผสมสีเข้าหาพื้นหลังเพื่อให้จางลง (ใช้กับกิ่งดินที่ตก 空亡)
const fade=(color,f)=>'#'+color.slice(1).match(/../g).map((channel,i)=>Math.round(parseInt(channel,16)*(1-f)+[0xfb,0xfa,0xf6][i]*f).toString(16).padStart(2,'0')).join('');
// เน้นวันนี้ด้วยสีสดขึ้น: เพิ่มความอิ่มสี (saturation) และลดความสว่างเล็กน้อย ไม่ทำให้หม่นดำ
const vivid=color=>{
  let [r,g,b]=color.slice(1).match(/../g).map(c=>parseInt(c,16)/255);
  const max=Math.max(r,g,b),min=Math.min(r,g,b),l0=(max+min)/2,d=max-min;
  let h=0,s=d?d/(1-Math.abs(2*l0-1)):0;
  if(d)h=max===r?((g-b)/d+6)%6:max===g?(b-r)/d+2:(r-g)/d+4;
  s=Math.min(.66,s*1.8+.2);const l=Math.max(.6,l0-.14);
  const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs(h%2-1)),m=l-c/2;
  const [r1,g1,b1]=h<1?[c,x,0]:h<2?[x,c,0]:h<3?[0,c,x]:h<4?[0,x,c]:h<5?[x,0,c]:[c,0,x];
  return '#'+[r1,g1,b1].map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');
};
const shade=color=>'#'+color.slice(1).match(/../g).map(channel=>Math.round(parseInt(channel,16)*.92).toString(16).padStart(2,'0')).join('');
// Chinese compass orientation: south above, north below (午 top, 子 bottom).
const point=(radius,angle)=>[360+radius*Math.sin((direction*angle+180)*Math.PI/180),360-radius*Math.cos((direction*angle+180)*Math.PI/180)];
const sector=(inner,outer,angle,halfAngle=15)=>{
  const a=point(outer,angle-halfAngle),b=point(outer,angle+halfAngle),c=point(inner,angle+halfAngle),d=point(inner,angle-halfAngle);
  return `M ${a} A ${outer} ${outer} 0 0 ${direction===1?1:0} ${b} L ${c} A ${inner} ${inner} 0 0 ${direction===1?0:1} ${d} Z`;
};
const label=(radius,angle,text,size,color='#263b33',dy=0)=>{const [x,y]=point(radius,angle);return `<text x="${x}" y="${y+dy}" text-anchor="middle" dominant-baseline="middle" font-size="${size}" fill="${color}">${text}</text>`};
const phaseDescriptions=['เริ่มต้นชีวิต','ชำระและเรียนรู้','เติบโต รับผิดชอบ','ตั้งหลัก สร้างตัว','รุ่งเรืองสูงสุด','กำลังเริ่มลดลง','อ่อนแรง ต้องพัก','สิ้นสุดระยะเดิม','เก็บงำพลัง','พลังเก่าขาดสิ้น','ก่อตัวในครรภ์','ฟูมฟักก่อนเกิด'];
function arcLabel(radius,angle,text,size,color,id,centered=false,halfAngle=14){
  const screenAngle=((direction*angle+180)%360+360)%360;
  const reverse=screenAngle>90&&screenAngle<270;
  if(centered)radius+=(reverse?1:-1)*size*.35;
  const start=point(radius,angle+(reverse?halfAngle:-halfAngle)*direction);
  const end=point(radius,angle+(reverse?-halfAngle:halfAngle)*direction);
  return `<defs><path id="${id}" d="M ${start} A ${radius} ${radius} 0 0 ${reverse?0:1} ${end}"/></defs><text text-anchor="middle" font-size="${size}" fill="${color}"><textPath href="#${id}" startOffset="50%">${text}</textPath></text>`;
}
function renderWheel(){
  const p=profiles[profile];
  const {stemIn,extent,stemAlpha,phaseAlpha}=layout,pad=extent+8;
  svg.setAttribute('viewBox',`${360-pad} ${360-pad} ${pad*2} ${pad*2}`);
  let html='<circle cx="360" cy="360" r="200" fill="#fbfaf6" stroke="#c9cdbb"/>',stemHtml='';
  if(phaseAlpha>.01){
  html+=`<g class="phase-layer" opacity="${phaseAlpha.toFixed(3)}"${showPhases?'':' aria-hidden="true" pointer-events="none"'}><circle cx="360" cy="360" r="343" fill="#fbfaf6" stroke="#c9cdbb"/><circle cx="360" cy="360" r="309" fill="none" stroke="#d9ddcc"/>`;
  html+='<g class="outer-ring" tabindex="0" role="slider" aria-label="ตำแหน่งวงฉางเซิง ใช้ลูกศรซ้ายหรือขวาหมุนทีละช่อง" aria-valuemin="0" aria-valuemax="11" aria-valuenow="'+offset+'" aria-valuetext="'+(practice?'โหมดท่องจำ':'長生 ตรงกับ '+branches[offset].han+' '+branches[offset].zodiac)+'">';
  for(let i=0;i<12;i++){
    const a=i*30+rotation,show=!practice||(revealed&&wrap(i+offset)===selected);
    const base=highlightedPhases.has(i)&&!practice?phaseColors[profile]:'#f6f3e9';
    html+=`<g class="phase" data-phase="${i}" tabindex="0" role="button" aria-label="${show?phases[i].han+' '+phases[i].reading:'ระยะที่ซ่อนไว้'}" aria-pressed="${selectedPhase===i}"><path class="phase-sector" d="${sector(201,296,a)}" fill="${selectedPhase===i?shade(base):base}" stroke="#d6d9c9" stroke-width="1"/>`;
    html+=`<path class="meaning-sector" d="${sector(313,335,a)}" fill="#f5f2e9" stroke="#e3e3d8" stroke-width="1"/>`;
    html+=arcLabel(show?263:249,a,show?phases[i].han:'?',34,i===0?p.color:'#34483b',`phase-han-${i}`,true);
    if(show){
      html+=arcLabel(232,a,phases[i].reading,20,'#65745f',`phase-thai-${i}`,true);
      html+=arcLabel(324,a,phaseDescriptions[i],16,'#969b92',`meaning-${i}`,true);
    }else{
      html+=arcLabel(324,a,'· · ·',16,'#a9ada3',`meaning-${i}`,true);
    }
    html+='</g>';
  }
  html+='</g></g>';
  }
  // เน้นเสาวันเฉพาะเมื่อวงก้านฟ้าอยู่ตำแหน่งของวันนี้ (หมุนออกแล้วไม่เน้น)
  const stemShift=wrap(Math.round(stemRotation/30)),isVoid=i=>showStems&&stemAtBranch(i,stemShift).element==='void';
  const todayAligned=showStems&&wrap(Math.round(stemRotation/30))===pillarShift(today);
  // ชีพจรเบาๆ ของช่องวันนี้: หน่วงเวลาติดลบตามนาฬิกาเพื่อให้จังหวะต่อเนื่องแม้วาดวงใหม่
  const todayPulse=` class="today-pulse" style="animation-delay:-${Math.round(performance.now()%2600)}ms"`;
  if(stemAlpha>.01){
  stemHtml+=`<g class="stem-ring" opacity="${stemAlpha.toFixed(3)}"${showStems?' tabindex="0"':' aria-hidden="true"'} role="slider" aria-label="วงก้านฟ้านอกสุด ลากหรือใช้ลูกศรหมุน ก้านหยางล็อกกับกิ่งหยาง ก้านหยินล็อกกับกิ่งหยิน"><circle cx="360" cy="360" r="${stemIn+24}" fill="none" stroke="#fbfaf6" stroke-width="52"/><circle cx="360" cy="360" r="${stemIn+50}" fill="none" stroke="#c9cdbb"/>`;
  stemRing.forEach((s,k)=>{
    const a=k*30+stemRotation,void_=s.element==='void',isToday=todayAligned&&k===today.stem;
    stemHtml+=`<g class="stem" data-stem="${k}"${isToday?' data-today="true"':''}><path${isToday?todayPulse:''} d="${sector(stemIn,stemIn+47,a,14.6)}" fill="${isToday?(s.element==='metal'?'#b3bdc8':vivid(stemColors[s.element])):stemColors[s.element]}" stroke="#fbfaf6" stroke-width="2"/>`;
    if(void_){
      stemHtml+=arcLabel(stemIn+29,a,s.han,22,'#9ea397',`stem-han-${k}`,true,10);
      stemHtml+=arcLabel(stemIn+8,a,s.mark,15,'#b9bcb2',`stem-sub-${k}`,true,10);
    }else stemHtml+=arcLabel(stemIn+21,a,s.han,34,'#2e463c',`stem-han-${k}`,true,8);
    stemHtml+='</g>';
  });
  stemHtml+='</g>';
  }
  html+=stemHtml;
  const branchFill=i=>{
    const base=selected===i?branchSelectedColors[branches[i].key]:branchColors[branches[i].key];
    return isVoid(i)?fade(base,.62):todayAligned&&i===today.branch?vivid(base):base;
  };
  for(let i=0;i<12;i++){
    const b=branches[i],a=i*30;
    html+=`<g class="branch" data-branch="${i}" tabindex="0" role="button" aria-label="${b.han} ${b.reading} ${b.zodiac} ${b.element} ฤดู${b.season}" aria-pressed="${selected===i}"><path${todayAligned&&i===today.branch&&!isVoid(i)?todayPulse:''} d="${sector(114,196,a)}" fill="${branchFill(i)}" stroke="#fbfaf6" stroke-width="2"/>`;
    html+=arcLabel(155,a,b.han,44,isVoid(i)?'#a7ada2':'#2e463c',`branch-han-${i}`,true)+'</g>';
  }
  html+='<circle cx="360" cy="360" r="106" fill="#fbfaf6"/><g class="center-direction-band" aria-label="แถบ 8 ธาตุทิศระหว่างเส้นวงกลมรอบศูนย์กลาง">';
  for(let index=0;index<8;index++){
    html+=`<path data-direction-element="${directionElements[index]}" data-direction-sector="${index}" d="${sector(97,106,index*45*direction,20)}" fill="${directionColors[directionElements[index]]}"/>`;
  }
  html+='</g><circle cx="360" cy="360" r="106" fill="none" stroke="#d4d9c9"/><circle cx="360" cy="360" r="97" fill="none" stroke="#e6e8dc"/>';
  // ปุ่มธาตุกลางวงและลูกศรใช้กับวง 12 วัฏจักร จึงจางหายไปพร้อมกัน
  if(phaseAlpha>.01){
  html+=`<g class="center-layer" opacity="${phaseAlpha.toFixed(3)}"${showPhases?'':' aria-hidden="true" pointer-events="none"'}>`;
  const peak=profilePeakBranch(profile),next=profiles[nextProfile(profile)];
  html+=`<path class="element-pointer" data-pointer-branch="${branches[peak].han}" aria-label="${p.name} ชี้ ${branches[peak].han}" d="M360 278 L353 296 L360 290 L367 296Z" transform="rotate(${direction*peak*30+180} 360 360)" fill="${p.color}"/>`;
  html+=`<g class="center-profile" data-center-profile="${profile}" ${showPhases?'tabindex="0" ':''}role="button" aria-label="${p.han} ${p.reading} ${p.name} แตะเพื่อเปลี่ยนเป็น ${next.han} ${next.name}"><circle cx="360" cy="345" r="54" fill="transparent"/>${label(0,0,p.han,48,p.color,-24)}</g>`;
  html+=label(0,0,p.name,20,'#34483b',20)+label(0,0,'12 กิ่งดิน',16,'#87907c',51);
  html+='</g>';
  }
  const active=document.activeElement;
  const focus=active?.closest('[data-center-profile]')?'center':active?.dataset.phase!==undefined?'phase-'+active.dataset.phase:active?.closest('.stem-ring')?'stem':active?.closest('.outer-ring')?'outer':active?.dataset.branch;
  svg.innerHTML=html;
  if(focus!==undefined){const target=focus==='center'?svg.querySelector('[data-center-profile]'):focus==='stem'?svg.querySelector('.stem-ring'):focus==='outer'?svg.querySelector('.outer-ring'):focus.startsWith('phase-')?svg.querySelector(`[data-phase="${focus.slice(6)}"]`):svg.querySelector(`[data-branch="${focus}"]`);target?.focus({preventScroll:true});}
}
function renderControls(){
  $('stem-toggle').checked=showStems;$('phase-toggle').checked=showPhases;
  for(const id of ['rotation-controls','step-status','alignment','practice-section'])$(id).hidden=!showPhases;
  $('wheel-caption').style.visibility=showPhases||showStems?'':'hidden';
  $('today-pillar').hidden=!showStems;
  $('today-pillar').textContent=`◎ วันนี้ ${stemRing[today.stem].han}${branches[today.branch].han}`;
  const p=profiles[profile];
  $('alignment').textContent=offset===p.start?p.name+' · ตำแหน่งตามหลัก':'หมุนเอง · '+p.name;
  document.documentElement.style.setProperty('--green',p.color);
  $('reveal').hidden=!practice||!showPhases;
  $('reveal').disabled=revealed;
  $('reveal').textContent=revealed?'เฉลยแล้ว':'เฉลยช่องที่เลือก';
}
function cancelMotion(){cancelAnimationFrame(motionFrame);cancelAnimationFrame(dragFrame);motionFrame=dragFrame=0;}
function animateTo(target){
  cancelMotion();destination=target;offset=snap(target);revealed=false;renderControls();
  const start=rotation,delta=target-start,duration=reducedMotion.matches?0:180;
  if(!duration||Math.abs(delta)<.01){rotation=target;renderWheel();$('step-status').textContent='ลงล็อกแล้ว · ลากเพื่อหมุน';return;}
  $('step-status').textContent='กำลังลงล็อก';
  let began;
  function frame(time){
    if(began===undefined)began=time;
    const progress=Math.min(1,(time-began)/duration);
    rotation=start+delta*(1-Math.pow(1-progress,3));renderWheel();
    if(progress<1)motionFrame=requestAnimationFrame(frame);
    else{motionFrame=0;rotation=target;$('step-status').textContent='ลงล็อกแล้ว · ลากเพื่อหมุน';}
  }
  motionFrame=requestAnimationFrame(frame);
}
function rotate(step){animateTo((motionFrame?destination:Math.round(rotation/30)*30)+step*direction*30);}
function animateStem(target){
  cancelAnimationFrame(stemFrame);stemDestination=target;
  const start=stemRotation,delta=target-start,duration=reducedMotion.matches?0:180;
  if(!duration||Math.abs(delta)<.01){stemRotation=target;renderWheel();return;}
  let began;
  const frame=time=>{
    if(began===undefined)began=time;
    const progress=Math.min(1,(time-began)/duration);
    stemRotation=start+delta*(1-Math.pow(1-progress,3));renderWheel();
    if(progress<1)stemFrame=requestAnimationFrame(frame);else{stemFrame=0;stemRotation=target;}
  };
  stemFrame=requestAnimationFrame(frame);
}
const lockStem=()=>animateStem(Math.round(stemRotation/60)*60);
function rotateStem(step){animateStem((stemFrame?stemDestination:Math.round(stemRotation/60)*60)+step*direction*60);}
// ปุ่มวันนี้: หมุนวงก้านฟ้ากลับไปเสาวันนี้ (ทางที่สั้นที่สุด) และตั้งซาฮะของวันใหม่
function goToday(){
  if(!showStems)return;
  const target=pillarShift(today)*30;
  animateStem(stemRotation+angleDelta(target,((stemRotation%360)+360)%360));
  profile=sanheProfile(today.branch);alignProfile();
}
function alignProfile(){const target=profiles[profile].start*30;animateTo(rotation+angleDelta(target,((rotation%360)+360)%360));}
function choosePhase(i){selectedPhase=i;if(practice){selected=wrap(i+offset);revealed=false;}renderWheel();renderControls();svg.querySelector(`[data-phase="${i}"]`)?.focus({preventScroll:true});}
function chooseBranch(i){selected=i;revealed=false;renderWheel();renderControls();svg.querySelector(`[data-branch="${i}"]`)?.focus({preventScroll:true});}
function cycleCenterProfile(){profile=nextProfile(profile);alignProfile();svg.querySelector('[data-center-profile]')?.focus({preventScroll:true});}
$('prev').addEventListener('click',()=>rotate(-1));$('next').addEventListener('click',()=>rotate(1));
$('reset').addEventListener('click',alignProfile);
function toggleRing(key,value){
  if(key==='showStems')showStems=value;else showPhases=value;
  try{localStorage.setItem(key,value?'1':'0');}catch{}
  renderControls();animateLayout();
}
$('today-pillar').addEventListener('click',goToday);
$('stem-toggle').addEventListener('change',e=>toggleRing('showStems',e.target.checked));
$('phase-toggle').addEventListener('change',e=>toggleRing('showPhases',e.target.checked));
$('practice').addEventListener('change',e=>{practice=e.target.checked;revealed=false;renderWheel();renderControls();});
$('reveal').addEventListener('click',()=>{revealed=true;renderWheel();renderControls();});
svg.addEventListener('click',e=>{if(e.target.closest('[data-center-profile]')){if(showPhases)cycleCenterProfile();return;}const branch=e.target.closest('[data-branch]');if(branch)chooseBranch(Number(branch.dataset.branch));});
svg.addEventListener('keydown',e=>{
  if(e.target.closest('[data-center-profile]')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();cycleCenterProfile();return;}
  const phase=e.target.closest('[data-phase]');
  if(phase&&(e.key==='Enter'||e.key===' ')){e.preventDefault();choosePhase(Number(phase.dataset.phase));return;}
  const branch=e.target.closest('[data-branch]');
  if(branch&&(e.key==='Enter'||e.key===' ')){e.preventDefault();chooseBranch(Number(branch.dataset.branch));}
  if(e.target.closest('.stem-ring')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    e.preventDefault();rotateStem(['ArrowRight','ArrowDown'].includes(e.key)?1:-1);svg.querySelector('.stem-ring')?.focus({preventScroll:true});return;
  }
  if(e.target.closest('.outer-ring')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    e.preventDefault();rotate(['ArrowRight','ArrowDown'].includes(e.key)?1:-1);svg.querySelector('.outer-ring')?.focus({preventScroll:true});
  }
});
function pointerAngle(e){const box=svg.getBoundingClientRect();return Math.atan2(e.clientX-box.left-box.width/2,-(e.clientY-box.top-box.height/2))*180/Math.PI;}
svg.addEventListener('pointerdown',e=>{
  const ringName=e.target.closest('.stem-ring')&&showStems?'stem':e.target.closest('.outer-ring')&&showPhases?'phase':null;
  if(!ringName||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;
  e.preventDefault();cancelMotion();cancelAnimationFrame(stemFrame);stemFrame=0;drag={ring:ringName,id:e.pointerId,last:pointerAngle(e),x:e.clientX,y:e.clientY,moved:false,phase:e.target.closest('[data-phase]')?.dataset.phase};revealed=false;renderControls();svg.setPointerCapture(e.pointerId);svg.classList.add('dragging');$('step-status').textContent='ปล่อยเพื่อลงล็อก';
});
svg.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<6)return;
  drag.moved=true;
  const angle=pointerAngle(e),delta=direction*angleDelta(angle,drag.last);if(drag.ring==='stem')stemRotation+=delta;else rotation+=delta;drag.last=angle;
  if(!dragFrame)dragFrame=requestAnimationFrame(()=>{dragFrame=0;renderWheel();});
});
function stopDrag(e){
  if(!drag||e.pointerId!==drag.id)return;
  const tappedPhase=!drag.moved?drag.phase:undefined,drag0=drag;
  drag=null;svg.classList.remove('dragging');if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);
  if(drag0.ring==='stem'){lockStem();return;}
  animateTo(Math.round(rotation/30)*30);
  if(e.type==='pointerup'&&tappedPhase!==undefined)choosePhase(Number(tappedPhase));
}
svg.addEventListener('pointerup',stopDrag);svg.addEventListener('pointercancel',stopDrag);svg.addEventListener('lostpointercapture',stopDrag);
renderWheel();renderControls();

function spiralArcLabel(entry,offset,text,size,color,key){
  const id=`year-${entry.year}-${key}`;
  return `<defs><path id="${id}" d="${spiralTextPath(entry,offset,size)}"/></defs><text text-anchor="middle" font-size="${size}" fill="${color}"><textPath href="#${id}" startOffset="50%">${text}</textPath></text>`;
}
function renderSpiral(){
  const endYear=zodiacRoundEnd(birthYear,currentYear),entries=spiralYears(birthYear,endYear,direction),visibleEntries=spiralSlice(entries,cycle),extent=visibleEntries.at(-1).radius+(cycle===null?46:67);
  const spiral=$('spiral');spiral.setAttribute('viewBox',`${-extent} ${-extent} ${extent*2} ${extent*2}`);
  let html='';
  html+='<g transform="translate(-360 -360)">';
  for(let i=0;i<12;i++){
    const b=branches[i],a=i*30;
    html+=`<path d="${sector(100,163,a)}" fill="${colors[b.key]}" stroke="#fbfaf6" stroke-width="2"/>`;
    html+=arcLabel(132,a,b.han,32,'#2e463c',`year-branch-${i}`,true);
  }
  html+='</g><circle cx="0" cy="0" r="94" fill="none" stroke="#e6e8dc"/>';
  if(cycle!==null){
    const first=visibleEntries[0];
    for(let index=visibleEntries.length;index<12;index++){
      const placeholder={angle:first.angle+direction*index*30,radius:205,circular:true};
      html+=`<path class="future-slot" d="${spiralCell(placeholder)}" fill="#eeece5" stroke="#fbfaf6" stroke-width="2"/>`;
    }
  }
  for(const entry of visibleEntries){
    const fill=entry.year===selectedYear?selectedColors[branches[entry.branch].key]:colors[branches[entry.branch].key];
    html+=`<g class="year-cell${entry.year>currentYear?' coming-year':''}" data-year="${entry.year}" tabindex="0" role="button" aria-label="อายุย่าง ${entry.age} ปี ${entry.ganzhi} ${branches[entry.branch].zodiac} ${era==='BE'?'พ.ศ.':'ค.ศ.'} ${displayYear(entry.year,era)}${entry.year>currentYear?' ปีอนาคต':entry.year===currentYear?' ปีปัจจุบัน':''}" aria-pressed="${entry.year===selectedYear}"><path d="${spiralCell(entry)}" fill="${fill}" stroke="#f5f2e9" stroke-width="2"/>${spiralArcLabel(entry,0,`<tspan>${entry.age} ${entry.ganzhi} </tspan><tspan fill="#969b91" font-weight="300">${shortYear(entry.year,era)}</tspan>`,Math.min(24,entry.radius*.44/(3.9+String(entry.age).length*.6)),'#263b33','line')}</g>`;
  }
  if(cycle!==null){
    const first=visibleEntries[0],last=visibleEntries.at(-1);
    const cuts=[first.angle-direction*15];
    if(visibleEntries.length<12)cuts.push(last.angle+direction*15);
    for(const angle of cuts){
      const from=spiralPoint(angle,170),to=spiralPoint(angle,244);
      html+=`<path class="cycle-boundary" d="M ${from} L ${to}" stroke="#fbfaf6" stroke-width="11"/><path d="M ${from} L ${to}" stroke="#5d7163" stroke-width="3" stroke-linecap="round"/>`;
    }
    const marker=(entry,text)=>`<g class="cycle-marker" font-weight="300"><path d="${spiralCell({...entry,radius:249,circular:true},10)}" fill="#e1e2df" stroke="#fbfaf6" stroke-width="1"/>${spiralArcLabel({...entry,radius:249,circular:true},0,text,15,'#757a73','marker')}</g>`;
    html+=marker(first,visibleEntries.length===1?`เริ่ม/จบ ${displayYear(first.year,era)}`:`เริ่ม ${displayYear(first.year,era)}`);
    if(visibleEntries.length>1)html+=marker(last,`จบ ${displayYear(last.year,era)}`);
  }
  html+='<circle cx="0" cy="0" r="85" fill="#fbfaf6" stroke="#dedfd2"/><text x="0" y="-35" text-anchor="middle" font-size="18" fill="#727a6e">ปีเกิด · '+branches[zodiacIndexForBirth()].zodiac+'</text><text x="0" y="4" text-anchor="middle" font-size="36" fill="#497c61">'+displayYear(birthYear,era)+'</text><text x="0" y="36" text-anchor="middle" font-size="19" fill="#727a6e">'+(era==='BE'?'พ.ศ.':'ค.ศ.')+'</text>';
  spiral.innerHTML=html;
  const count=Math.ceil(entries.length/12),activeEntries=cycle===null?entries:entries.filter(e=>e.cycle===cycle);
  $('year-caption').textContent=(cycle===null?'ทุกรอบ':`รอบที่ ${cycle+1} / ${count}`)+` · ${displayYear(activeEntries[0].year,era)}–${displayYear(activeEntries.at(-1).year,era)}`;
  $('cycle-guide').textContent=(cycle===null?'':`เริ่ม → ไล่${direction===1?'ตาม':'ทวน'}เข็มนาฬิกา → จบ · `)+`ปีปัจจุบัน ${displayYear(currentYear,era)} · ปิดรอบนักษัตร ${displayYear(endYear,era)}`;
  const chosen=entries.find(e=>e.year===selectedYear);
  $('year-selection').innerHTML=`อายุย่าง ${chosen.age} ปี · ${chosen.ganzhi} ${branches[chosen.branch].zodiac} · <span class="muted-year">${era==='BE'?'พ.ศ.':'ค.ศ.'} ${displayYear(chosen.year,era)}</span>${chosen.year>currentYear?' · ปีอนาคต':chosen.year===currentYear?' · ปีปัจจุบัน':''}`;
  $('cycle-prev').disabled=cycle===0; $('cycle-next').disabled=cycle===count-1;
  $('cycle-all').textContent=cycle===null?'ดูทีละรอบ':'ดูทุกรอบ';
  $('cycle-select').innerHTML='<option value="all">ดูทุกรอบ</option>'+Array.from({length:count},(_,index)=>{
    const years=entries.filter(entry=>entry.cycle===index);
    return `<option value="${index}">รอบ ${index+1} · ${displayYear(years[0].year,era)}–${displayYear(years.at(-1).year,era)} · ย่าง ${years[0].age}–${years.at(-1).age}</option>`;
  }).join('');
  $('cycle-select').value=cycle===null?'all':String(cycle);
}
function zodiacIndexForBirth(){return spiralYears(birthYear,birthYear)[0].branch;}
function setMode(value){
  if(drag){const pointer=drag.id;drag=null;svg.classList.remove('dragging');if(svg.hasPointerCapture(pointer))svg.releasePointerCapture(pointer);}
  cancelMotion();rotation=destination=offset*30;mode=value;
  $('phase-view').hidden=mode!=='phases';$('years-view').hidden=mode!=='years';
  $('mode-phases').setAttribute('aria-pressed',String(mode==='phases'));$('mode-years').setAttribute('aria-pressed',String(mode==='years'));
  if(mode==='years')renderSpiral();else{renderWheel();renderControls();}
}
function setEra(value){
  let entered;try{entered=parseBirthInput($('birth-input').value.trim(),era,currentYear);}catch{entered={year:birthYear,kind:'year'};}
  era=value;if(entered.kind==='year')$('birth-input').value=displayYear(entered.year,era);$('birth-era').textContent=era==='BE'?'พ.ศ.':'ค.ศ.';
  $('era-be').setAttribute('aria-pressed',String(era==='BE'));$('era-ce').setAttribute('aria-pressed',String(era==='CE'));$('birth-error').hidden=true;renderSpiral();
}
function selectYear(year){selectedYear=year;if(cycle!==null)cycle=Math.floor((year-birthYear)/12);renderSpiral();$('spiral').querySelector(`[data-year="${year}"]`)?.focus({preventScroll:true});}
$('mode-phases').addEventListener('click',()=>setMode('phases'));
$('mode-years').addEventListener('click',()=>setMode('years'));
$('era-be').addEventListener('click',()=>setEra('BE'));$('era-ce').addEventListener('click',()=>setEra('CE'));
$('birth-form').addEventListener('submit',e=>{
  e.preventDefault();try{birthYear=parseBirthInput($('birth-input').value.trim(),era,currentYear).year;$('birth-input').value=displayYear(birthYear,era);selectedYear=birthYear;cycle=null;$('birth-error').hidden=true;$('birth-input').removeAttribute('aria-invalid');renderSpiral();closeSettings();}catch(error){$('birth-error').textContent=error.message;$('birth-error').hidden=false;$('birth-input').setAttribute('aria-invalid','true');$('birth-input').focus();}
});
$('spiral').addEventListener('click',e=>{const cell=e.target.closest('[data-year]');if(cell)selectYear(Number(cell.dataset.year));});
$('spiral').addEventListener('keydown',e=>{const cell=e.target.closest('[data-year]');if(cell&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectYear(Number(cell.dataset.year));}});
function stepCycle(delta){
  const last=Math.floor((zodiacRoundEnd(birthYear,currentYear)-birthYear)/12);cycle=cycle===null?(delta<0?last:0):Math.max(0,Math.min(last,cycle+delta));chooseCycle(cycle);
}
$('cycle-prev').addEventListener('click',()=>stepCycle(-1));$('cycle-next').addEventListener('click',()=>stepCycle(1));
function chooseCycle(value){
  cycle=value;
  if(cycle!==null&&Math.floor((selectedYear-birthYear)/12)!==cycle)selectedYear=birthYear+cycle*12;
  renderSpiral();
}
$('cycle-all').addEventListener('click',()=>chooseCycle(cycle===null?Math.floor((selectedYear-birthYear)/12):null));
$('cycle-select').addEventListener('change',e=>chooseCycle(e.target.value==='all'?null:Number(e.target.value)));

function setDirection(value){
  if(drag){const pointer=drag.id;drag=null;svg.classList.remove('dragging');if(svg.hasPointerCapture(pointer))svg.releasePointerCapture(pointer);}
  cancelMotion();rotation=destination=offset*30;direction=value;
  $('direction-cw').setAttribute('aria-pressed',String(direction===1));
  $('direction-ccw').setAttribute('aria-pressed',String(direction===-1));
  renderWheel();renderControls();if(mode==='years')renderSpiral();
}
$('direction-cw').addEventListener('click',()=>setDirection(1));
$('direction-ccw').addEventListener('click',()=>setDirection(-1));

const settingsDialog=$('settings-dialog');
$('settings-open').addEventListener('click',()=>{$('birth-input').value=displayYear(birthYear,era);$('birth-error').hidden=true;$('birth-input').removeAttribute('aria-invalid');settingsDialog.showModal();document.body.classList.add('settings-active');});
function closeSettings(){settingsDialog.close();}
$('settings-close').addEventListener('click',closeSettings);
settingsDialog.addEventListener('close',()=>{document.body.classList.remove('settings-active');$('settings-open').focus({preventScroll:true});});
settingsDialog.addEventListener('click',e=>{
  if(e.target!==settingsDialog)return;
  const box=settingsDialog.getBoundingClientRect();
  if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)closeSettings();
});
