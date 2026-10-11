import {BIRTH_YEAR,yearNow,displayYear,shortYear,parseBirthYear,spiralYears,spiralPoint,spiralCell,spiralTextPath,spiralSlice} from './spiral.mjs?v=25';
import {branches,phases,profiles,wrap,snap,angleDelta} from './core.mjs';
const $ = id => document.getElementById(id);
const svg = $('wheel');
let direction=1;
let mode='phases',birthYear=BIRTH_YEAR,era='BE',cycle=0,selectedYear=birthYear;
const currentYear=yearNow(new Date());
let profile='wood', offset=profiles.wood.start, selected=0, practice=false, revealed=false, drag=null, selectedPhase=null;
let rotation=offset*30, destination=rotation, motionFrame=0, dragFrame=0;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const colors={spring:'#dfecdd',summer:'#f6dfcc',autumn:'#ece2c6',winter:'#dce8eb'};
const selectedColors={spring:'#d0dfcc',summer:'#ecd0b7',autumn:'#ded2af',winter:'#cbdde2'};
// 長生, 帝旺 and 墓 share the element palette of the selected yang stem.
const phaseColors={wood:'#c9dfc0',fire:'#f1c0a5',metal:'#d3d7db',water:'#bed5eb'};
const highlightedPhases=new Set([0,4,8]);
const shade=color=>'#'+color.slice(1).match(/../g).map(channel=>Math.round(parseInt(channel,16)*.92).toString(16).padStart(2,'0')).join('');
// Chinese compass orientation: south above, north below (午 top, 子 bottom).
const point=(radius,angle)=>[360+radius*Math.sin((direction*angle+180)*Math.PI/180),360-radius*Math.cos((direction*angle+180)*Math.PI/180)];
const sector=(inner,outer,angle)=>{
  const a=point(outer,angle-15),b=point(outer,angle+15),c=point(inner,angle+15),d=point(inner,angle-15);
  return `M ${a} A ${outer} ${outer} 0 0 ${direction===1?1:0} ${b} L ${c} A ${inner} ${inner} 0 0 ${direction===1?0:1} ${d} Z`;
};
const label=(radius,angle,text,size,color='#263b33',dy=0)=>{const [x,y]=point(radius,angle);return `<text x="${x}" y="${y+dy}" text-anchor="middle" dominant-baseline="middle" font-size="${size}" fill="${color}">${text}</text>`};
const phaseDescriptions=['เริ่มต้นชีวิต','ชำระและเรียนรู้','เติบโต รับผิดชอบ','ตั้งหลัก สร้างตัว','รุ่งเรืองสูงสุด','กำลังเริ่มลดลง','อ่อนแรง ต้องพัก','สิ้นสุดระยะเดิม','เก็บงำพลัง','พลังเก่าขาดสิ้น','ก่อตัวในครรภ์','ฟูมฟักก่อนเกิด'];
function arcLabel(radius,angle,text,size,color,id,centered=false){
  const screenAngle=((direction*angle+180)%360+360)%360;
  const reverse=screenAngle>90&&screenAngle<270;
  if(centered)radius+=(reverse?1:-1)*size*.35;
  const start=point(radius,angle+(reverse?14:-14)*direction);
  const end=point(radius,angle+(reverse?-14:14)*direction);
  return `<defs><path id="${id}" d="M ${start} A ${radius} ${radius} 0 0 ${reverse?0:1} ${end}"/></defs><text text-anchor="middle" font-size="${size}" fill="${color}"><textPath href="#${id}" startOffset="50%">${text}</textPath></text>`;
}
function renderWheel(){
  const p=profiles[profile];
  let html='<circle cx="360" cy="360" r="343" fill="#fbfaf6" stroke="#c9cdbb"/><circle cx="360" cy="360" r="309" fill="none" stroke="#d9ddcc"/>';
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
  html+='</g>';
  for(let i=0;i<12;i++){
    const b=branches[i],a=i*30;
    html+=`<g class="branch" data-branch="${i}" tabindex="0" role="button" aria-label="${b.han} ${b.reading} ${b.zodiac} ${b.element} ฤดู${b.season}" aria-pressed="${selected===i}"><path d="${sector(114,196,a)}" fill="${selected===i?selectedColors[b.key]:colors[b.key]}" stroke="#fbfaf6" stroke-width="2"/>`;
    html+=arcLabel(155,a,b.han,44,'#2e463c',`branch-han-${i}`,true)+'</g>';
  }
  html+='<circle cx="360" cy="360" r="106" fill="#fbfaf6" stroke="#d4d9c9"/><circle cx="360" cy="360" r="97" fill="none" stroke="#e6e8dc"/>';
  html+='<path d="M360 278 L353 296 L360 290 L367 296Z" fill="'+p.color+'"/>';
  html+=label(0,0,p.han,48,p.color,-24)+label(0,0,p.name,20,'#34483b',20)+label(0,0,'12 กิ่งดิน',16,'#87907c',51);
  const active=document.activeElement;
  const focus=active?.dataset.phase!==undefined?'phase-'+active.dataset.phase:active?.closest('.outer-ring')?'outer':active?.dataset.branch;
  svg.innerHTML=html;
  if(focus!==undefined){const target=focus==='outer'?svg.querySelector('.outer-ring'):focus.startsWith('phase-')?svg.querySelector(`[data-phase="${focus.slice(6)}"]`):svg.querySelector(`[data-branch="${focus}"]`);target?.focus({preventScroll:true});}
}
function renderControls(){
  const p=profiles[profile];
  $('alignment').textContent=offset===p.start?p.name+' · ตำแหน่งตามหลัก':'หมุนเอง · '+p.name;
  document.documentElement.style.setProperty('--green',p.color);
  $('profiles').innerHTML=Object.entries(profiles).map(([key,p])=>`<button data-profile="${key}" class="${key===profile?'active':''}" style="--accent:${p.color}" aria-label="${p.han} ${p.reading} ${p.name}" aria-pressed="${key===profile}"><span class="han">${p.han}</span><span>${({wood:"ไม้",fire:"ไฟ",metal:"ทอง",water:"น้ำ"})[key]}<small>${p.reading}</small></span></button>`).join('');
  $('reveal').hidden=!practice;
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
function alignProfile(){const target=profiles[profile].start*30;animateTo(rotation+angleDelta(target,((rotation%360)+360)%360));}
function choosePhase(i){selectedPhase=i;if(practice){selected=wrap(i+offset);revealed=false;}renderWheel();renderControls();svg.querySelector(`[data-phase="${i}"]`)?.focus({preventScroll:true});}
function chooseBranch(i){selected=i;revealed=false;renderWheel();renderControls();svg.querySelector(`[data-branch="${i}"]`)?.focus({preventScroll:true});}
$('profiles').addEventListener('click',e=>{const button=e.target.closest('[data-profile]');if(!button)return;profile=button.dataset.profile;alignProfile();$('profiles').querySelector(`[data-profile="${profile}"]`).focus({preventScroll:true});});
$('prev').addEventListener('click',()=>rotate(-1));$('next').addEventListener('click',()=>rotate(1));
$('reset').addEventListener('click',alignProfile);
$('practice').addEventListener('change',e=>{practice=e.target.checked;revealed=false;renderWheel();renderControls();});
$('reveal').addEventListener('click',()=>{revealed=true;renderWheel();renderControls();});
svg.addEventListener('click',e=>{const branch=e.target.closest('[data-branch]');if(branch)chooseBranch(Number(branch.dataset.branch));});
svg.addEventListener('keydown',e=>{
  const phase=e.target.closest('[data-phase]');
  if(phase&&(e.key==='Enter'||e.key===' ')){e.preventDefault();choosePhase(Number(phase.dataset.phase));return;}
  const branch=e.target.closest('[data-branch]');
  if(branch&&(e.key==='Enter'||e.key===' ')){e.preventDefault();chooseBranch(Number(branch.dataset.branch));}
  if(e.target.closest('.outer-ring')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    e.preventDefault();rotate(['ArrowRight','ArrowDown'].includes(e.key)?1:-1);svg.querySelector('.outer-ring')?.focus({preventScroll:true});
  }
});
function pointerAngle(e){const box=svg.getBoundingClientRect();return Math.atan2(e.clientX-box.left-box.width/2,-(e.clientY-box.top-box.height/2))*180/Math.PI;}
svg.addEventListener('pointerdown',e=>{
  if(!e.target.closest('.outer-ring')||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;
  e.preventDefault();cancelMotion();drag={id:e.pointerId,last:pointerAngle(e),x:e.clientX,y:e.clientY,moved:false,phase:e.target.closest('[data-phase]')?.dataset.phase};revealed=false;renderControls();svg.setPointerCapture(e.pointerId);svg.classList.add('dragging');$('step-status').textContent='ปล่อยเพื่อลงล็อก';
});
svg.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<6)return;
  drag.moved=true;
  const angle=pointerAngle(e);rotation+=direction*angleDelta(angle,drag.last);drag.last=angle;
  if(!dragFrame)dragFrame=requestAnimationFrame(()=>{dragFrame=0;renderWheel();});
});
function stopDrag(e){
  if(!drag||e.pointerId!==drag.id)return;
  const tappedPhase=!drag.moved?drag.phase:undefined;
  drag=null;svg.classList.remove('dragging');if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);
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
  const entries=spiralYears(birthYear,currentYear,direction),visibleEntries=spiralSlice(entries,cycle),extent=visibleEntries.at(-1).radius+(cycle===null?46:67);
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
    html+=`<g class="year-cell" data-year="${entry.year}" tabindex="0" role="button" aria-label="${era==='BE'?'พ.ศ.':'ค.ศ.'} ${displayYear(entry.year,era)} ${entry.ganzhi} ${branches[entry.branch].zodiac} อายุย่าง ${entry.age} ปี" aria-pressed="${entry.year===selectedYear}"><path d="${spiralCell(entry)}" fill="${fill}" stroke="#f5f2e9" stroke-width="2"/>${spiralArcLabel(entry,0,`${shortYear(entry.year,era)} ${entry.ganzhi} ${entry.age}`,Math.min(24,entry.radius*.44/(3.9+String(entry.age).length*.6)),'#263b33','line')}</g>`;
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
    html+=marker(first,visibleEntries.length===1?'เริ่ม / ล่าสุด':`เริ่ม ${shortYear(first.year,era)}`);
    if(visibleEntries.length>1)html+=marker(last,`${visibleEntries.length===12?'จบ':'ล่าสุด'} ${shortYear(last.year,era)}`);
  }
  html+='<circle cx="0" cy="0" r="85" fill="#fbfaf6" stroke="#dedfd2"/><text x="0" y="-35" text-anchor="middle" font-size="18" fill="#727a6e">ปีเกิด · '+branches[zodiacIndexForBirth()].zodiac+'</text><text x="0" y="4" text-anchor="middle" font-size="36" fill="#497c61">'+displayYear(birthYear,era)+'</text><text x="0" y="36" text-anchor="middle" font-size="19" fill="#727a6e">'+(era==='BE'?'พ.ศ.':'ค.ศ.')+'</text>';
  spiral.innerHTML=html;
  const count=Math.ceil(entries.length/12),activeEntries=cycle===null?entries:entries.filter(e=>e.cycle===cycle);
  $('year-caption').textContent=(cycle===null?'ทุกรอบ':`รอบที่ ${cycle+1} / ${count}`)+` · ${displayYear(activeEntries[0].year,era)}–${displayYear(activeEntries.at(-1).year,era)}`;
  $('cycle-guide').textContent=cycle===null?'':`เริ่ม → ไล่${direction===1?'ตาม':'ทวน'}เข็มนาฬิกา → ${visibleEntries.length===12?'จบ':'ปีล่าสุด · รอบนี้ยังไม่ครบ 12 ปี'}`;
  const chosen=entries.find(e=>e.year===selectedYear);
  $('year-selection').textContent=`${era==='BE'?'พ.ศ.':'ค.ศ.'} ${displayYear(chosen.year,era)} · ${chosen.ganzhi} ${branches[chosen.branch].zodiac} · อายุย่าง ${chosen.age} ปี`;
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
  era=value;$('birth-input').value=displayYear(birthYear,era);$('birth-era').textContent=era==='BE'?'พ.ศ.':'ค.ศ.';
  $('era-be').setAttribute('aria-pressed',String(era==='BE'));$('era-ce').setAttribute('aria-pressed',String(era==='CE'));$('birth-error').hidden=true;renderSpiral();
}
function selectYear(year){selectedYear=year;if(cycle!==null)cycle=Math.floor((year-birthYear)/12);renderSpiral();$('spiral').querySelector(`[data-year="${year}"]`)?.focus({preventScroll:true});}
$('mode-phases').addEventListener('click',()=>setMode('phases'));
$('mode-years').addEventListener('click',()=>setMode('years'));
$('era-be').addEventListener('click',()=>setEra('BE'));$('era-ce').addEventListener('click',()=>setEra('CE'));
$('birth-form').addEventListener('submit',e=>{
  e.preventDefault();try{birthYear=parseBirthYear($('birth-input').value.trim(),era,currentYear);selectedYear=birthYear;cycle=0;$('birth-error').hidden=true;renderSpiral();}catch(error){$('birth-error').textContent=error.message;$('birth-error').hidden=false;}
});
$('spiral').addEventListener('click',e=>{const cell=e.target.closest('[data-year]');if(cell)selectYear(Number(cell.dataset.year));});
$('spiral').addEventListener('keydown',e=>{const cell=e.target.closest('[data-year]');if(cell&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectYear(Number(cell.dataset.year));}});
function stepCycle(delta){
  const last=Math.floor((currentYear-birthYear)/12);cycle=cycle===null?(delta<0?last:0):Math.max(0,Math.min(last,cycle+delta));chooseCycle(cycle);
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
