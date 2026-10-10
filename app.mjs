import {branches,phases,profiles,wrap,snap,angleDelta} from './core.mjs';
const $ = id => document.getElementById(id);
const svg = $('wheel');
let profile='wood', offset=profiles.wood.start, selected=0, practice=false, revealed=false, drag=null;
let rotation=offset*30, destination=rotation, motionFrame=0, dragFrame=0;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const colors={spring:'#dfecdd',summer:'#f6dfcc',autumn:'#ece2c6',winter:'#dce8eb'};
// 長生, 帝旺 and 墓 share the element palette of the selected yang stem.
const phaseColors={wood:'#c9dfc0',fire:'#f1c0a5',metal:'#d3d7db',water:'#bed5eb'};
const highlightedPhases=new Set([0,4,8]);
// Chinese compass orientation: south above, north below (午 top, 子 bottom).
const point=(radius,angle)=>[360+radius*Math.sin((angle+180)*Math.PI/180),360-radius*Math.cos((angle+180)*Math.PI/180)];
const sector=(inner,outer,angle)=>{
  const a=point(outer,angle-15),b=point(outer,angle+15),c=point(inner,angle+15),d=point(inner,angle-15);
  return `M ${a} A ${outer} ${outer} 0 0 1 ${b} L ${c} A ${inner} ${inner} 0 0 0 ${d} Z`;
};
const label=(radius,angle,text,size,color='#263b33',dy=0)=>{const [x,y]=point(radius,angle);return `<text x="${x}" y="${y+dy}" text-anchor="middle" dominant-baseline="middle" font-size="${size}" fill="${color}">${text}</text>`};
function renderWheel(){
  const p=profiles[profile];
  let html='<circle cx="360" cy="360" r="309" fill="#fbfaf6" stroke="#c9cdbb"/><circle cx="360" cy="360" r="301" fill="none" stroke="#d9ddcc"/>';
  html+='<g class="outer-ring" tabindex="0" role="slider" aria-label="ตำแหน่งวงฉางเซิง ใช้ลูกศรซ้ายหรือขวาหมุนทีละช่อง" aria-valuemin="0" aria-valuemax="11" aria-valuenow="'+offset+'" aria-valuetext="'+(practice?'โหมดท่องจำ':'長生 ตรงกับ '+branches[offset].han+' '+branches[offset].zodiac)+'">';
  for(let i=0;i<12;i++){
    const a=i*30+rotation,show=!practice||(revealed&&wrap(i+offset)===selected);
    html+=`<path d="${sector(201,296,a)}" fill="${highlightedPhases.has(i)&&!practice?phaseColors[profile]:'#f6f3e9'}" stroke="#d6d9c9" stroke-width="1"/>`;
    html+=label(253,a,show?phases[i].han:'?',28,i===0?p.color:'#34483b',show?-15:0);
    if(show)html+=label(253,a,phases[i].reading,18,'#65745f',18);
  }
  html+='</g>';
  for(let i=0;i<12;i++){
    const b=branches[i],a=i*30;
    html+=`<g class="branch" data-branch="${i}" tabindex="0" role="button" aria-label="${b.han} ${b.reading} ${b.zodiac} ${b.element} ฤดู${b.season}" aria-pressed="${selected===i}"><path d="${sector(114,196,a)}" fill="${colors[b.key]}" stroke="${selected===i?p.color:'#fbfaf6'}" stroke-width="${selected===i?3:2}"/>`;
    html+=label(157,a,b.han,36,'#2e463c',-9)+label(157,a,b.zodiac,18,'#52685e',24)+'</g>';
  }
  html+='<circle cx="360" cy="360" r="106" fill="#fbfaf6" stroke="#d4d9c9"/><circle cx="360" cy="360" r="97" fill="none" stroke="#e6e8dc"/>';
  html+='<path d="M360 278 L353 296 L360 290 L367 296Z" fill="'+p.color+'"/>';
  html+=label(0,0,p.han,48,p.color,-24)+label(0,0,p.name,20,'#34483b',20)+label(0,0,'12 กิ่งดิน',16,'#87907c',51);
  const active=document.activeElement;
  const focus=active?.closest('.outer-ring')?'outer':active?.dataset.branch;
  svg.innerHTML=html;
  if(focus!==undefined){const target=focus==='outer'?svg.querySelector('.outer-ring'):svg.querySelector(`[data-branch="${focus}"]`);target?.focus({preventScroll:true});}
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
function rotate(step){animateTo((motionFrame?destination:Math.round(rotation/30)*30)+step*30);}
function alignProfile(){const target=profiles[profile].start*30;animateTo(rotation+angleDelta(target,((rotation%360)+360)%360));}
function chooseBranch(i){selected=i;revealed=false;renderWheel();renderControls();svg.querySelector(`[data-branch="${i}"]`)?.focus({preventScroll:true});}
$('profiles').addEventListener('click',e=>{const button=e.target.closest('[data-profile]');if(!button)return;profile=button.dataset.profile;alignProfile();$('profiles').querySelector(`[data-profile="${profile}"]`).focus({preventScroll:true});});
$('prev').addEventListener('click',()=>rotate(-1));$('next').addEventListener('click',()=>rotate(1));
$('reset').addEventListener('click',alignProfile);
$('practice').addEventListener('change',e=>{practice=e.target.checked;revealed=false;renderWheel();renderControls();});
$('reveal').addEventListener('click',()=>{revealed=true;renderWheel();renderControls();});
svg.addEventListener('click',e=>{const branch=e.target.closest('[data-branch]');if(branch)chooseBranch(Number(branch.dataset.branch));});
svg.addEventListener('keydown',e=>{
  const branch=e.target.closest('[data-branch]');
  if(branch&&(e.key==='Enter'||e.key===' ')){e.preventDefault();chooseBranch(Number(branch.dataset.branch));}
  if(e.target.closest('.outer-ring')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    e.preventDefault();rotate(['ArrowRight','ArrowDown'].includes(e.key)?1:-1);svg.querySelector('.outer-ring')?.focus({preventScroll:true});
  }
});
function pointerAngle(e){const box=svg.getBoundingClientRect();return Math.atan2(e.clientX-box.left-box.width/2,-(e.clientY-box.top-box.height/2))*180/Math.PI;}
svg.addEventListener('pointerdown',e=>{
  if(!e.target.closest('.outer-ring')||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;
  e.preventDefault();cancelMotion();drag={id:e.pointerId,last:pointerAngle(e)};revealed=false;renderControls();svg.setPointerCapture(e.pointerId);svg.classList.add('dragging');$('step-status').textContent='ปล่อยเพื่อลงล็อก';
});
svg.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const angle=pointerAngle(e);rotation+=angleDelta(angle,drag.last);drag.last=angle;
  if(!dragFrame)dragFrame=requestAnimationFrame(()=>{dragFrame=0;renderWheel();});
});
function stopDrag(e){
  if(!drag||e.pointerId!==drag.id)return;
  drag=null;svg.classList.remove('dragging');if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);
  animateTo(Math.round(rotation/30)*30);
}
svg.addEventListener('pointerup',stopDrag);svg.addEventListener('pointercancel',stopDrag);svg.addEventListener('lostpointercapture',stopDrag);
renderWheel();renderControls();
