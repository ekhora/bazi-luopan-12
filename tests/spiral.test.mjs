import test from 'node:test';
import assert from 'node:assert/strict';
import {spiralYears,zodiacIndex,displayYear,parseBirthYear,yearNow,spiralCell,yearGanzhi,spiralTextPath,shortYear} from '../spiral.mjs';
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
