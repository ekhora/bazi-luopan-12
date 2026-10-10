import {branches,phases,profiles,wrap,snap,phaseAt,angleDelta} from './core.mjs';
const $ = id => document.getElementById(id);
const svg = $('wheel');
let profile='wood', offset=profiles.wood.start, selected=0, practice=false, revealed=false, drag=null;
const colors={spring:'#dfecdd',summer:'#f6dfcc',autumn:'#ece2c6',winter:'#dce8eb'};
const point=(radius,angle)=>[360+radius*Math.sin(angle*Math.PI/180),360-radius*Math.cos(angle*Math.PI/180)];
const sector=(inner,outer,angle)=>{
  const a=point(outer,angle-15),b=point(outer,angle+15),c=point(inner,angle+15),d=point(inner,angle-15);
  return `M ${a} A ${outer} ${outer} 0 0 1 ${b} L ${c} A ${inner} ${inner} 0 0 0 ${d} Z`;
};
const label=(radius,angle,text,size,color='#263b33',dy=0)=>{const [x,y]=point(radius,angle);return `<text x="${x}" y="${y+dy}" text-anchor="middle" dominant-baseline="middle" font-size="${size}" fill="${color}">${text}</text>`};
function renderWheel(){
  const p=profiles[profile];
  let html='<circle cx="360" cy="360" r="309" fill="#fbfaf6" stroke="#c9cdbb"/><circle cx="360" cy="360" r="301" fill="none" stroke="#d9ddcc"/>';
  html+='<g class="outer-ring" tabindex="0" role="slider" aria-label="ตำแหน่งวงฉางเซิง ใช้ลูกศรซ้ายหรือขวาหมุนทีละช่อง" aria-valuemin="0" aria-valuemax="11" aria-valuenow="'+offset+'" aria-valuetext="長生 ตรงกับ '+branches[offset].han+' '+branches[offset].zodiac+'">';
  for(let i=0;i<12;i++){
    const a=wrap(i+offset)*30;
    html+=`<path d="${sector(201,296,a)}" fill="${i===0?'#e2eadb':'#f6f3e9'}" stroke="#d6d9c9" stroke-width="1"/>`;
    html+=label(253,a,practice?'?':phases[i].han,25,i===0?p.color:'#34483b',-15);
    if(!practice){html+=label(253,a,phases[i].reading,14,'#65745f',15);}
    else{html+=label(253,a,String(i+1).padStart(2,'0'),13,'#7f8c74',17);}
  }
  html+='</g>';
  for(let i=0;i<12;i++){
    const b=branches[i],a=i*30;
    html+=`<g class="branch" data-branch="${i}" tabindex="0" role="button" aria-label="${b.han} ${b.reading} ${b.zodiac} ${b.element} ฤดู${b.season}" aria-pressed="${selected===i}"><path d="${sector(114,196,a)}" fill="${colors[b.key]}" stroke="${selected===i?p.color:'#fbfaf6'}" stroke-width="${selected===i?3:2}"/>`;
    html+=label(157,a,b.han,32,'#2e463c',-9)+label(157,a,b.zodiac,15,'#52685e',22)+'</g>';
  }
  html+='<circle cx="360" cy="360" r="106" fill="#fbfaf6" stroke="#d4d9c9"/><circle cx="360" cy="360" r="97" fill="none" stroke="#e6e8dc"/>';
  html+='<path d="M360 278 L353 296 L360 290 L367 296Z" fill="'+p.color+'"/>';
  html+=label(0,0,p.han,48,p.color,-24)+label(0,0,p.name,18,'#34483b',20)+label(0,0,'12 กิ่งดิน',13,'#87907c',49);
  [[0,'เหนือ'],[90,'ตะวันออก'],[180,'ใต้'],[270,'ตะวันตก']].forEach(([a,t])=>{html+=label(330,a,t,12,'#8a907f')});
  svg.innerHTML=html;
}
function renderInfo(){
  const p=profiles[profile], b=branches[selected], phase=phaseAt(selected,offset);
  $('alignment').textContent=offset===p.start?'ตำแหน่งตามหลัก'+p.name:'ตำแหน่งหมุนเอง · ฝึกท่องจำ';
  $('step-status').textContent='ลงล็อกแล้ว';
  document.documentElement.style.setProperty('--green',p.color);
  $('profiles').innerHTML=Object.entries(profiles).map(([key,p])=>`<button data-profile="${key}" class="${key===profile?'active':''}" style="--accent:${p.color}" aria-pressed="${key===profile}"><span class="han">${p.han}</span><span>${p.name}<small>${p.reading}</small></span></button>`).join('');
  $('reading').innerHTML=`<div class="reading-head"><span class="reading-han">${b.han}</span><div><h2>${b.reading} · ${b.zodiac}</h2><p>${b.element} · ฤดู${b.season}</p></div></div>`+(practice&&!revealed?'<button class="reveal" id="reveal">ลองตอบ แล้วเปิดคำตอบ</button>':`<div class="phase-answer"><strong>${phase.han}</strong><p>${phase.reading}</p><p class="meaning">${phase.meaning}</p></div>`);
  $('reference').hidden=practice;
  $('table-body').innerHTML=branches.map((b,i)=>{const p=phaseAt(i,offset);return `<tr><td>${b.han} (${b.reading} ${b.zodiac} ${b.element})</td><td>${b.season}</td><td>${p.han}<small>${p.reading}</small></td><td>${p.meaning}</td></tr>`}).join('');
}
function render(){renderWheel();renderInfo();}
function rotate(step){offset=wrap(offset+step);revealed=false;render();}
function chooseBranch(i){selected=i;revealed=false;render();svg.querySelector(`[data-branch="${i}"]`)?.focus({preventScroll:true});}
$('profiles').addEventListener('click',e=>{const button=e.target.closest('[data-profile]');if(!button)return;profile=button.dataset.profile;offset=profiles[profile].start;revealed=false;render();$('profiles').querySelector(`[data-profile="${profile}"]`).focus({preventScroll:true});});
$('prev').addEventListener('click',()=>rotate(-1));
$('next').addEventListener('click',()=>rotate(1));
$('reset').addEventListener('click',()=>{offset=profiles[profile].start;revealed=false;render();});
$('practice').addEventListener('change',e=>{practice=e.target.checked;revealed=false;render();});
$('reading').addEventListener('click',e=>{if(e.target.closest('#reveal')){revealed=true;renderInfo();}});
svg.addEventListener('click',e=>{const branch=e.target.closest('[data-branch]');if(branch)chooseBranch(Number(branch.dataset.branch));});
svg.addEventListener('keydown',e=>{
  const branch=e.target.closest('[data-branch]');
  if(branch&&(e.key==='Enter'||e.key===' ')){e.preventDefault();chooseBranch(Number(branch.dataset.branch));}
  if(e.target.closest('.outer-ring')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    e.preventDefault();rotate(['ArrowRight','ArrowDown'].includes(e.key)?1:-1);svg.querySelector('.outer-ring').focus({preventScroll:true});
  }
});
function pointerAngle(e){const box=svg.getBoundingClientRect();return Math.atan2(e.clientX-box.left-box.width/2,-(e.clientY-box.top-box.height/2))*180/Math.PI;}
svg.addEventListener('pointerdown',e=>{
  if(!e.target.closest('.outer-ring')||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;
  e.preventDefault();const angle=pointerAngle(e);drag={id:e.pointerId,last:angle,degrees:offset*30};svg.setPointerCapture(e.pointerId);svg.classList.add('dragging');
});
svg.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const angle=pointerAngle(e);drag.degrees+=angleDelta(angle,drag.last);drag.last=angle;
  const next=snap(drag.degrees);if(next!==offset){offset=next;revealed=false;render();}
});
function stopDrag(e){if(!drag||e.pointerId!==drag.id)return;drag=null;svg.classList.remove('dragging');if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);}
svg.addEventListener('pointerup',stopDrag);svg.addEventListener('pointercancel',stopDrag);svg.addEventListener('lostpointercapture',stopDrag);
render();
