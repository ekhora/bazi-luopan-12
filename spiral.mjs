const stems = [...'甲乙丙丁戊己庚辛壬癸'];
const yearBranches = [...'子丑寅卯辰巳午未申酉戌亥'];
const modulo = (value,base) => ((value%base)+base)%base;
export const yearGanzhi = year => stems[modulo(year-4,10)]+yearBranches[modulo(year-4,12)];
export const BIRTH_YEAR = 1979;
export const yearNow = date => Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Bangkok',year:'numeric'}).format(date));
export const zodiacIndex = year => ((year-1979+7)%12+12)%12;
export const displayYear = (year,era='BE') => year+(era==='BE'?543:0);
export const shortYear=(year,era='BE')=>String(displayYear(year,era)).slice(-2);
export function parseBirthYear(value,era,currentYear){
  if(!/^\d{4}$/.test(String(value)))throw new Error('กรอกปีเกิดเป็นเลข 4 หลัก');
  const year=Number(value)-(era==='BE'?543:0);
  if(year<currentYear-998||year>currentYear)throw new Error(`กรอกอายุย่าง 1–999 หรือปีเกิด ${displayYear(currentYear-998,era)}–${displayYear(currentYear,era)}`);
  return year;
}
export function parseBirthInput(value,era,currentYear){
  const text=String(value).trim();
  if(!/^\d{1,4}$/.test(text))throw new Error('กรอกปีเกิด 4 หลัก หรืออายุย่าง 1–999 เป็นจำนวนเต็ม');
  const number=Number(text);
  if(number<1)throw new Error('อายุย่างต้องไม่น้อยกว่า 1 และไม่เกิน 999');
  if(number<=999)return {year:currentYear-number+1,age:number,kind:'age'};
  const year=parseBirthYear(text,era,currentYear);
  return {year,age:currentYear-year+1,kind:'year'};
}
export function spiralYears(birthYear,currentYear,direction=1){
  if(direction!==1&&direction!==-1)throw new Error('ทิศทางไม่ถูกต้อง');
  if(!Number.isInteger(birthYear)||!Number.isInteger(currentYear)||birthYear>currentYear||birthYear<1)throw new Error('ช่วงปีไม่ถูกต้อง');
  return Array.from({length:currentYear-birthYear+1},(_,elapsed)=>({year:birthYear+elapsed,age:elapsed+1,ganzhi:yearGanzhi(birthYear+elapsed),cycle:Math.floor(elapsed/12),branch:zodiacIndex(birthYear+elapsed),direction,angle:direction*(zodiacIndex(birthYear)+elapsed)*30,radius:205+elapsed*6.5}));
}
export function zodiacRoundEnd(birthYear,currentYear){
  if(!Number.isInteger(birthYear)||!Number.isInteger(currentYear)||birthYear>currentYear)throw new Error('ช่วงปีไม่ถูกต้อง');
  return birthYear+Math.ceil((currentYear-birthYear+1)/12)*12-1;
}
export const spiralPoint=(angle,radius)=>[radius*Math.sin((angle+180)*Math.PI/180),-radius*Math.cos((angle+180)*Math.PI/180)];
export function spiralCell(entry,halfWidth=32){
  const points=[];
  for(let step=0;step<=8;step++){
    const delta=-.47+step*.94/8;
    points.push(spiralPoint(entry.angle+delta*30,entry.radius+delta*(entry.circular?0:6.5)*(entry.direction??1)+halfWidth));
  }
  for(let step=8;step>=0;step--){
    const delta=-.47+step*.94/8;
    points.push(spiralPoint(entry.angle+delta*30,entry.radius+delta*(entry.circular?0:6.5)*(entry.direction??1)-halfWidth));
  }
  return 'M '+points.map(point=>point.join(',')).join(' L ')+' Z';
}

export function spiralTextPath(entry,offset,size){
  const screenAngle=modulo(entry.angle+180,360),reverse=screenAngle>90&&screenAngle<270;
  const points=Array.from({length:17},(_,step)=>{
    const delta=(reverse?1:-1)*(.44-step*.88/16);
    return spiralPoint(entry.angle+delta*30,entry.radius+offset+delta*6.5+(reverse?1:-1)*size*.35);
  });
  return 'M '+points.map(point=>point.join(',')).join(' L ');
}

export function spiralSlice(entries,cycle){
  if(cycle===null)return entries;
  return entries.filter(entry=>entry.cycle===cycle).map(entry=>({...entry,radius:205,circular:true}));
}
