export const BIRTH_YEAR = 1979;
export const yearNow = date => Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Bangkok',year:'numeric'}).format(date));
export const zodiacIndex = year => ((year-1979+7)%12+12)%12;
export const displayYear = (year,era='BE') => year+(era==='BE'?543:0);
export function parseBirthYear(value,era,currentYear){
  if(!/^\d{4}$/.test(String(value)))throw new Error('กรอกปีเกิดเป็นเลข 4 หลัก');
  const year=Number(value)-(era==='BE'?543:0);
  if(year<1800||year>currentYear)throw new Error(`ปีเกิดต้องอยู่ระหว่าง ${displayYear(1800,era)}–${displayYear(currentYear,era)}`);
  return year;
}
export function spiralYears(birthYear,currentYear){
  if(!Number.isInteger(birthYear)||!Number.isInteger(currentYear)||birthYear>currentYear||birthYear<1800)throw new Error('ช่วงปีไม่ถูกต้อง');
  return Array.from({length:currentYear-birthYear+1},(_,age)=>({year:birthYear+age,age,cycle:Math.floor(age/12),branch:zodiacIndex(birthYear+age),angle:(zodiacIndex(birthYear)+age)*30,radius:205+age*6.5}));
}
export const spiralPoint=(angle,radius)=>[radius*Math.sin((angle+180)*Math.PI/180),-radius*Math.cos((angle+180)*Math.PI/180)];
export function spiralCell(entry){
  const points=[];
  for(let step=0;step<=8;step++){
    const delta=-.47+step*.94/8;
    points.push(spiralPoint(entry.angle+delta*30,entry.radius+delta*6.5+32));
  }
  for(let step=8;step>=0;step--){
    const delta=-.47+step*.94/8;
    points.push(spiralPoint(entry.angle+delta*30,entry.radius+delta*6.5-32));
  }
  return 'M '+points.map(point=>point.join(',')).join(' L ')+' Z';
}
