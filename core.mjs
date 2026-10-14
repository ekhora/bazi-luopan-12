export const branches = [
  ['子','จื่อ','ชวด','น้ำหยาง','หนาว','winter'], ['丑','โฉ่ว','ฉลู','ดินหยิน','หนาว','winter'],
  ['寅','อิ๋น','ขาล','ไม้หยาง','ใบไม้ผลิ','spring'], ['卯','เหม่า','เถาะ','ไม้หยิน','ใบไม้ผลิ','spring'],
  ['辰','เฉิน','มะโรง','ดินหยาง','ใบไม้ผลิ','spring'], ['巳','ซื่อ','มะเส็ง','ไฟหยิน','ร้อน','summer'],
  ['午','อู่','มะเมีย','ไฟหยาง','ร้อน','summer'], ['未','เว่ย','มะแม','ดินหยิน','ร้อน','summer'],
  ['申','เซิน','วอก','ทองหยาง','ใบไม้ร่วง','autumn'], ['酉','โหย่ว','ระกา','ทองหยิน','ใบไม้ร่วง','autumn'],
  ['戌','ซวี','จอ','ดินหยาง','ใบไม้ร่วง','autumn'], ['亥','ไฮ่','กุน','น้ำหยิน','หนาว','winter']
].map(([han,reading,zodiac,element,season,key])=>({han,reading,zodiac,element,season,key}));
export const phases = [
  ['長生','ฉางเซิง','ก่อเกิด'], ['沐浴','มู่ยวี่','ชำระล้าง'], ['冠帶','กวานไต้','เติบใหญ่'],
  ['臨官','หลินกวาน','สร้างตัว'], ['帝旺','ตี้วั่ง','รุ่งเรืองสูงสุด'], ['衰','ชวาย','อ่อนกำลัง'],
  ['病','ปิ้ง','เจ็บป่วย'], ['死','สื่อ','สิ้นสุด'], ['墓','มู่','เก็บเข้าคลัง'],
  ['絕','เจวี๋ย','ขาดสูญ'], ['胎','ไท','ปฏิสนธิ'], ['養','หย่าง','ฟูมฟัก']
].map(([han,reading,meaning])=>({han,reading,meaning}));
export const profiles = {
  wood: {han:'甲',reading:'เจี่ย',name:'ไม้หยาง',start:11,color:'#497c61'},
  fire: {han:'丙',reading:'ปิ่ง',name:'ไฟหยาง',start:2,color:'#b75d42'},
  metal: {han:'庚',reading:'เกิง',name:'ทองหยาง',start:5,color:'#957445'},
  water: {han:'壬',reading:'เหริน',name:'น้ำหยาง',start:8,color:'#4b738f'}
};
export const wrap = n => ((n % 12) + 12) % 12;
export const snap = degrees => wrap(Math.round(degrees / 30));
export const phaseAt = (branchIndex, offset) => phases[wrap(branchIndex-offset)];
export const angleDelta = (current,previous) => ((current-previous+540)%360)-180;

export function nextProfile(key){
  const keys=Object.keys(profiles),index=keys.indexOf(key);
  if(index<0)throw new Error('ธาตุไม่ถูกต้อง');
  return keys[(index+1)%keys.length];
}
export const profilePeakBranch=key=>wrap(profiles[key].start+4);
// วงก้านฟ้านอกสุด: 10 ก้านฟ้า + 空亡陽/空亡陰 (ช่องที่ k เป็นหยางเมื่อ k เป็นเลขคู่)
export const stemRing = [
  ['甲','เจี่ย','wood'],['乙','อี่','wood'],['丙','ปิ่ง','fire'],['丁','ติง','fire'],['戊','อู้','earth'],
  ['己','จี่','earth'],['庚','เกิง','metal'],['辛','ซิน','metal'],['壬','เหริน','water'],['癸','กุ่ย','water'],
  ['空亡','คงหวาง','void','陽'],['空亡','คงหวาง','void','陰']
].map(([han,reading,element,mark],slot)=>({han,reading,element,polarity:slot%2===0?'yang':'yin',mark:mark||(slot%2===0?'陽':'陰')}));
// หมุนทีละ 60° เท่านั้น เพื่อให้ช่องหยางทับกิ่งดินหยางและช่องหยินทับกิ่งดินหยิน (กิ่ง index คู่ = หยาง)
export const snapStem = degrees => wrap(Math.round(degrees / 60) * 2);
export const stemAtBranch = (branchIndex, shift) => stemRing[wrap(branchIndex - shift)];
// เสาวัน (日柱) ตามวันที่ปฏิทินเวลาไทย: ลำดับ 0 = 甲子, อ้างอิง 2000-01-01 = 戊午
export function dayPillar(date){
  const [y,m,d]=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(date).split('-').map(Number);
  const days=Math.round((Date.UTC(y,m-1,d)-Date.UTC(2000,0,1))/864e5);
  const index=((days+54)%60+60)%60;
  return {index,stem:index%10,branch:index%12};
}
// จำนวนช่องที่ต้องเลื่อนวงก้านฟ้าเพื่อให้ก้านของเสาวันทับกิ่งของเสาวัน
export const pillarShift = pillar => wrap(pillar.branch - pillar.stem);
// ซาฮะ (三合) ของกิ่งดิน: 申子辰 น้ำ, 巳酉丑 ทอง, 寅午戌 ไฟ, 亥卯未 ไม้
export const sanheProfile = branchIndex => ['water','metal','fire','wood'][wrap(branchIndex)%4];
