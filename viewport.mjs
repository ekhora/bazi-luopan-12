export function clampView(view,width){
  const zoom=Math.max(1,Math.min(3,view.zoom));
  const limit=Math.max(0,width*(zoom-1)/2);
  return {zoom,x:Math.max(-limit,Math.min(limit,view.x)),y:Math.max(-limit,Math.min(limit,view.y))};
}
export function zoomAround(view,value,anchor,width){
  const zoom=Math.max(1,Math.min(3,value)),ratio=zoom/view.zoom;
  return clampView({zoom,x:anchor.x-(anchor.x-view.x)*ratio,y:anchor.y-(anchor.y-view.y)*ratio},width);
}
export function pinchView(view,before,after,width){
  const center=points=>({x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2});
  const distance=points=>Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);
  const a=center(before),b=center(after),length=distance(before);
  if(length<1)return view;
  const next=zoomAround(view,view.zoom*distance(after)/length,a,width);
  return clampView({...next,x:next.x+b.x-a.x,y:next.y+b.y-a.y},width);
}
