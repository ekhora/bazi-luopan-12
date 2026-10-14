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

import {nextProfile,profilePeakBranch} from '../core.mjs';
test('ลูกศรตามธาตุและแตะกลางวงวนครบไม้ไฟทองน้ำ',()=>{
  let key='wood';const order=[];
  for(let index=0;index<4;index++){order.push(key);key=nextProfile(key);}
  assert.deepEqual(order,['wood','fire','metal','water']);assert.equal(key,'wood');
  assert.deepEqual(order.map(profilePeakBranch),[3,6,9,0]);
  for(const profile of order)assert.equal(phaseAt(profilePeakBranch(profile),profiles[profile].start).han,'帝旺');
});

import {stemRing,snapStem,stemAtBranch} from '../core.mjs';
test('วงก้านฟ้ามี 10 ก้าน + 空亡陽/陰 และหยางล็อกกับกิ่งหยางเสมอ',()=>{
  assert.equal(stemRing.map(s=>s.han).join(''),'甲乙丙丁戊己庚辛壬癸空亡空亡');
  assert.deepEqual(stemRing.slice(10).map(s=>s.mark),['陽','陰']);
  for(const deg of [-100,-31,0,29,31,59,61,95,359,500]){
    const shift=snapStem(deg);assert.equal(shift%2,0);
    for(let b=0;b<12;b++)assert.equal(stemAtBranch(b,shift).polarity,b%2===0?'yang':'yin');
  }
  assert.equal(stemAtBranch(0,0).han,'甲');assert.equal(stemAtBranch(10,0).mark,'陽');assert.equal(stemAtBranch(11,0).mark,'陰');
});

import {dayPillar,pillarShift} from '../core.mjs';
test('เสาวันตรงปฏิทินจีนและวงก้านฟ้าหมุนให้ก้านทับกิ่งของวัน',()=>{
  const name=p=>stemRing[p.stem].han+branches[p.branch].han;
  assert.equal(name(dayPillar(new Date('2000-01-01T12:00:00+07:00'))),'戊午');
  assert.equal(name(dayPillar(new Date('2024-02-10T12:00:00+07:00'))),'甲辰');
  assert.equal(name(dayPillar(new Date('1949-10-01T12:00:00+07:00'))),'甲子');
  for(let n=0;n<60;n++){
    const p=dayPillar(new Date(Date.UTC(2026,0,1+n,5)));
    assert.equal(stemAtBranch(p.branch,pillarShift(p)),stemRing[p.stem]);assert.equal(pillarShift(p)%2,0);
  }
});
