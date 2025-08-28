export function isColliding(a: {x:number,y:number,w:number,h:number}, b:{x:number,y:number,w:number,h:number}) {
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
}
