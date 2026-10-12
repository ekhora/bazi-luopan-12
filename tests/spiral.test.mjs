import test from 'node:test';
import assert from 'node:assert/strict';
import {spiralYears,zodiacIndex,displayYear,parseBirthYear,parseBirthInput,yearNow,spiralCell,yearGanzhi,spiralTextPath,shortYear,spiralSlice,spiralPoint,zodiacRoundEnd} from '../spiral.mjs';
test('เกิดมะแม 2522: 48 ปีตั้งแต่อายุย่าง 1 ถึง 48 ในปี 2026',()=>{
  const entries=spiralYears(1979,2026);
  assert.equal(entries.length,48);assert.equal(entries[0].branch,7);assert.equal(entries[0].age,1);assert.equal(entries[47].age,48);assert.equal(entries[47].year,2026);
  assert.deepEqual([0,1,2,3].map(c=>entries.filter(e=>e.cycle===c).length),[12,12,12,12]);
  assert.deepEqual(entries.filter(e=>(e.age-1)%12===0).map(e=>e.year),[1979,1991,2003,2015]);
});
test('สลับ พ.ศ. ค.ศ. และเปลี่ยนปีเกิด',()=>{
  assert.equal(parseBirthYear('2522','BE',2026),1979);assert.equal(parseBirthYear('1979','CE',2026),1979);
  assert.equal(displayYear(2026,'BE'),2569);assert.equal(shortYear(1979,'BE'),'22');assert.equal(shortYear(1979,'CE'),'79');assert.equal(shortYear(2000,'CE'),'00');assert.equal(zodiacIndex(1980),8);assert.equal(zodiacIndex(2026),6);
  const entries=spiralYears(2000,2026);assert.equal(entries.length,27);assert.equal(entries[0].branch,4);assert.equal(entries[26].cycle,2);
  assert.equal(spiralYears(2026,2026).length,1);assert.equal(spiralYears(2026,2026)[0].age,1);
  assert.throws(()=>parseBirthYear('2570','BE',2026));assert.throws(()=>parseBirthYear('abc','BE',2026));
});
test('ก้นหอยแยกปีนักษัตรเดียวกันรอบละ 78 หน่วยและไม่เกิดค่าผิดปกติ',()=>{
  const entries=spiralYears(1979,2026);
  assert.equal(entries[12].radius-entries[0].radius,78);assert.equal(entries[12].branch,entries[0].branch);
  for(const entry of entries)assert.doesNotMatch(spiralCell(entry),/NaN|Infinity/);
});
test('ปีปัจจุบันยึดเวลาไทยเมื่อข้ามปี',()=>{
  assert.equal(yearNow(new Date('2026-12-31T18:00:00Z')),2027);
});

test('ก้านฟ้ากิ่งดินปีตรงกับปฏิทินฮ่องกงและวนครบ 60 ปี',()=>{
  assert.equal(yearGanzhi(1979),'己未');assert.equal(yearGanzhi(2026),'丙午');assert.equal(yearGanzhi(1984),'甲子');
  for(let year=1800;year<=2026;year++)assert.equal(yearGanzhi(year),yearGanzhi(year+60));
  const entries=spiralYears(1979,2026);assert.equal(entries[0].ganzhi,'己未');assert.equal(entries.at(-1).ganzhi,'丙午');
  for(const entry of entries)for(const offset of [-20,0,20])assert.doesNotMatch(spiralTextPath(entry,offset,22),/NaN|Infinity/);
});

test('ดูทีละรอบแสดงเฉพาะปีของรอบที่เลือกและจัดวงให้พอดีจอ',()=>{
  const entries=spiralYears(1979,2026),second=spiralSlice(entries,1);
  assert.equal(second.length,12);assert.equal(second[0].year,1991);assert.equal(second.at(-1).year,2002);
  assert.equal(second[0].age,13);assert.ok(second.every(entry=>entry.radius===205&&entry.circular));assert.equal(second[0].ganzhi,'辛未');
  assert.equal(spiralSlice(entries,null).length,48);assert.equal(entries[12].radius,283);
  const partial=spiralSlice(spiralYears(2000,2026),2);assert.equal(partial.length,3);assert.equal(partial[0].year,2024);assert.equal(partial.at(-1).year,2026);
});

test('สลับตามเข็มและทวนเข็มสะท้อนวงโดยคงปี อายุ และกิ่งดินเดิม',()=>{
  const cw=spiralYears(1979,2026,1),ccw=spiralYears(1979,2026,-1);
  for(let i=0;i<cw.length;i++){
    assert.equal(cw[i].year,ccw[i].year);assert.equal(cw[i].age,ccw[i].age);assert.equal(cw[i].branch,ccw[i].branch);assert.equal(cw[i].ganzhi,ccw[i].ganzhi);
    const a=spiralPoint(cw[i].angle,cw[i].radius),b=spiralPoint(ccw[i].angle,ccw[i].radius);
    assert.ok(Math.abs(a[0]+b[0])<1e-9);assert.ok(Math.abs(a[1]-b[1])<1e-9);
    assert.doesNotMatch(spiralCell(ccw[i]),/NaN|Infinity/);assert.doesNotMatch(spiralTextPath(ccw[i],0,24),/NaN|Infinity/);
  }
  assert.equal(ccw[1].angle-ccw[0].angle,-30);assert.throws(()=>spiralYears(1979,2026,0));
});

test('จบรอบละ 12 ปีโดยไม่เพิ่มรอบ 2570 ที่มีปีเดียว',()=>{
  assert.equal(zodiacRoundEnd(1979,2026),2026);assert.equal(zodiacRoundEnd(1979,2027),2038);assert.equal(zodiacRoundEnd(1979,2028),2038);
  assert.equal(zodiacRoundEnd(2000,2026),2035);assert.equal(zodiacRoundEnd(2026,2026),2037);
  const entries=spiralYears(1979,zodiacRoundEnd(1979,2026));
  assert.equal(entries.length,48);assert.equal(entries.at(-1).year,2026);assert.equal(entries.at(-1).age,48);
  assert.equal(spiralSlice(entries,3).length,12);assert.equal(spiralSlice(entries,4).length,0);
  for(let birth=1900;birth<=2026;birth++){
    const end=zodiacRoundEnd(birth,2026);assert.ok(end>=2026);assert.equal((end-birth+1)%12,0);assert.ok(end-2026<12);
  }
});

test('กรอกอายุ 1–999 เพื่อตั้งปีเกิด โดยอายุย่าง 48 เท่ากับ 2522',()=>{
  assert.deepEqual(parseBirthInput('48','BE',2026),{year:1979,age:48,kind:'age'});
  assert.deepEqual(parseBirthInput('48','CE',2026),{year:1979,age:48,kind:'age'});
  assert.equal(parseBirthInput('1','BE',2026).year,2026);
  const oldest=parseBirthInput('999','BE',2026);assert.equal(oldest.year,1028);assert.equal(parseBirthInput(String(displayYear(oldest.year,'BE')),'BE',2026).age,999);assert.equal(parseBirthInput('1028','CE',2026).age,999);
  assert.equal(spiralYears(oldest.year,zodiacRoundEnd(oldest.year,2026)).at(-1).age,1008);
  assert.deepEqual(parseBirthInput('2522','BE',2026),{year:1979,age:48,kind:'year'});assert.equal(parseBirthInput('1979','CE',2026).year,1979);
  for(const input of ['0','0000','-1','1000','9999','1.5','abc',''])assert.throws(()=>parseBirthInput(input,'BE',2026));
});
