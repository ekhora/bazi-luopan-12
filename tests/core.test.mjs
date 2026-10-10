import test from 'node:test';
import assert from 'node:assert/strict';
import {branches,phases,profiles,wrap,snap,phaseAt,angleDelta} from '../core.mjs';
test('ตำแหน่งสำคัญของทั้งสี่ธาตุตรงตามตารางฉางเซิง',()=>{
  const expected={wood:['亥','寅','卯','午','未'],fire:['寅','巳','午','酉','戌'],metal:['巳','申','酉','子','丑'],water:['申','亥','子','卯','辰']};
  for(const [key,p] of Object.entries(profiles)){
    [0,3,4,7,8].forEach((index,j)=>assert.equal(branches[wrap(p.start+index)].han,expected[key][j]));
    const found=branches.map((_,i)=>phaseAt(i,p.start).han);
    assert.equal(new Set(found).size,12);
  }
});
test('วงนอกลงล็อกและกลับตำแหน่งเดิมหลังหมุนครบ 12 ช่อง',()=>{
  for(let offset=0;offset<12;offset++){
    assert.equal(wrap(offset+12),offset);assert.equal(wrap(offset-12),offset);
    for(let i=0;i<12;i++)assert.equal(phaseAt(wrap(i+offset),offset),phases[i]);
  }
  assert.equal(snap(14),0);assert.equal(snap(16),1);assert.equal(snap(-16),11);assert.equal(snap(359),0);assert.equal(snap(721),0);
});
test('ลากข้ามแนวเหนือได้ต่อเนื่องทั้งสองทิศ',()=>{
  assert.equal(angleDelta(-179,179),2);assert.equal(angleDelta(179,-179),-2);
});
test('ฤดูกาลแบ่งเป็นสี่กลุ่ม กลุ่มละสามกิ่งดิน',()=>{
  for(const season of ['spring','summer','autumn','winter'])assert.equal(branches.filter(b=>b.key===season).length,3);
  assert.equal(branches.filter(b=>b.key==='spring').map(b=>b.han).join(''),'寅卯辰');
});
