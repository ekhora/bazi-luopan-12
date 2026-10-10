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
