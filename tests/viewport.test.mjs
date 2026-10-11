import test from 'node:test';
import assert from 'node:assert/strict';
import {clampView,zoomAround,pinchView} from '../viewport.mjs';
test('ซูมรอบนิ้วคงตำแหน่งเดิมของเนื้อหาและจำกัดการลากในขอบวง',()=>{
  const view={zoom:1.5,x:10,y:-20},anchor={x:30,y:40};
  const next=zoomAround(view,2,anchor,390);
  assert.ok(Math.abs((anchor.x-view.x)/view.zoom-(anchor.x-next.x)/next.zoom)<1e-10);
  assert.ok(Math.abs((anchor.y-view.y)/view.zoom-(anchor.y-next.y)/next.zoom)<1e-10);
  assert.deepEqual(clampView({zoom:2,x:999,y:-999},390),{zoom:2,x:195,y:-195});
  assert.deepEqual(zoomAround(view,1,anchor,390),{zoom:1,x:0,y:0});
});
test('ถ่างสองนิ้วขยายและโยกสองนิ้วเลื่อนโดยไม่เปลี่ยนสเกล',()=>{
  const view={zoom:1,x:0,y:0};
  const before=[{x:-50,y:0},{x:50,y:0}],after=[{x:-100,y:0},{x:100,y:0}];
  assert.deepEqual(pinchView(view,before,after,390),{zoom:2,x:0,y:0});
  assert.deepEqual(pinchView({zoom:2,x:0,y:0},before,[{x:-30,y:30},{x:70,y:30}],390),{zoom:2,x:20,y:30});
  assert.deepEqual(pinchView(view,[{x:0,y:0},{x:0,y:0}],after,390),view);
});
