var PointUtils = {};


PointUtils.arc = function(len, {y=10, segments=4}){
  let p = [];
  let x = len/2;
  let r = y + ((x*x - y*y)/2/y * (y > x ? 1:1));
  
  let rad = Math.atan2(r-y, x)* (y > x ? 1:1);

  let step = (Math.PI/2 - rad ) / segments;
  p.push([x,y]);
  for(let i=segments-1; i>=0; i--){
        let y2 = r * Math.sin(rad+step*i);
        let x2 = r * Math.cos(rad+step*i);
        p.push([x+x2,y2-r+y]);
        p.unshift([x-x2,y2-r+y]);
  }
  return p;
}

PointUtils.curve = function(len, {i=2, px=0.3, py=0.2, y=0}){
  let sqr = x=>x*x
  if(y) py = y/len;
  let p = [];
  let segments = 4;
  let top = len*py;
  let dx = len*px;
  for(let i=0; i<segments; i++){
    p.push([dx/segments*i, top-sqr(1/segments*(segments-i))*top])
  }
  p.push([len*px,top]);
  let dx2 = len-dx;
  for(let i=1; i<segments; i++){
    p.push([dx+dx2/segments*i, top-sqr(1/segments*i)*top])
  }
  return p;
}

PointUtils.bump = function({d=2,w=2}={}){
  return new P2DPoints(0,0).y(d).x(w).y(-d);
}


PointUtils.flipPoints = function(points){
  points.forEach(p=>{
    let tmp = p[0];
    p[0] = p[1];
    p[1] = tmp;
  });
}

PointUtils.scalePoints = function(points, sx, sy){
  if(sx == 1 && sy == 1) return;
  points.forEach(p=>{
    p[0] = p[0] * sx;
    p[1] = p[1] * sy;
  });
}

PointUtils.rotatePoints = function(points, rad){
  if(rad == 0) return;
  points.forEach(p=>{
    let x = p[0], y=p[1];
    p[0] = x * Math.cos(rad) - y * Math.sin(rad);
    p[1] = y * Math.cos(rad) + x * Math.sin(rad);
  });
}

PointUtils.translatePoints = function(points, tx, ty){
  points.forEach(p=>{
    p[0] = p[0] + tx;
    p[1] = p[1] + ty;
  });
}