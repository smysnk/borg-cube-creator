
function P2DPoints(x=0, y=0){
  if(x instanceof Array){  
    let last = x.length-1
    this.pos = x[last]
    this.points = x
  }else{
    this.pos = {x,y}
    this.points = [[x,y]]
  }
}

let proto = P2DPoints.prototype;

proto.add = function(shape,options={}){
  this.points.push({shape,options});
  return this;
}

proto.addPoints = function(points){
  this.points.push(...points);
  return this;
}

proto.at = function(x=0,y=0){
    this.points.push([this.pos.x = x, this.pos.y = y]);
    return this;
}

proto.m = function(x=0, y=0){
    return this.at(this.pos.x + x, this.pos.y + y);
}

proto.x = function(x=0){
    return this.m(x, 0);
}

proto.y = function(y){
    return this.m(0, y);
}

proto.xTo = function(x=0){
    return this.at(x, this.pos.y);
}

proto.xToMy = function(x=0, y=0){
    return this.at(x, this.pos.y+y);
}

proto.yTo = function(y=0){
    return this.at(this.pos.x, y);
}

proto.mXyTo = function(x=0,y=0){
    return this.at(this.pos.x+x, y);
}

proto.aRad = function(rad, r){
  return this.m(r * Math.cos(rad), r * Math.sin(rad));    
}

proto.aDeg = function(deg, r){
  return this.aRad(deg/180 * Math.PI, r);
}

proto.xRad = function(rad, x){
  return this.m(x, x * Math.sin(rad) / Math.cos(rad));
}

proto.xDeg = function(deg, x){
  return this.xRad(deg/180 * Math.PI, x);
}

proto.yRad = function(rad, y){
  return this.m(y * Math.cos(rad) / Math.sin(rad), y);
}

proto.yDeg = function(deg, y){
  return this.xRad(deg/180 * Math.PI, y);
}

proto.calcPoints = function(){
  this.points = this.buildPoints();
}

proto.mirrorX = function({a=1,b=0, m0=-1, m1=1, makeNew=false}={}){
  return this.mirrorY({a,b,m0,m1, makeNew});
}

proto.mirrorY = function({a=0, b=1, m0=1, m1=-1, makeNew=false}={}){
  let points = this.points;
  let pointsOut = this.points;
  let ret;
  if(makeNew){
    ret = new P2DPoints();
    pointsOut = ret.points;
  }
  // remove start vertical
  let p0 = points[0];
  let p1 = points[1];
  if(!p1.shape && p0[a] == p1[a]) points.shift();

  // remove end vertical
  let pEnd0 = points[points.length -1];
  let pEnd1 = points[points.length -2];
  if(!pEnd1.shape && pEnd0[a] == pEnd1[a] && !makeNew) points.pop();

  let count = points.length;
  for(let i=count-1; i>=0;i--){
    let p = points[i];
    if(p.shape){
      pointsOut.push(p);
    }else{
      pointsOut.push([p[0]*m0, p[1]*m1]);
    }
  }
  return ret;
}

proto.lastPoint = function(tx=0, ty=0){
  let ret = this.points[this.points.length-1]
  if(tx || ty) ret = [ret[0]+tx, ret[1]+ty]
  return ret
}

proto.buildPoints = function(){
  let sqr = x=>x*x;
  let ret = []; 
  let points = this.points;
  const myFix2 = n=>parseFloat(n.toFixed(2))
  const isEqPoint = (p1,p2)=> myFix2(p1[0]) == myFix2(p2[0]) && myFix2(p1[1]) == myFix2(p2[1]);
  
  for(let i=0; i<points.length; i++){
    let point = points[i];
    if(point.shape){
      let prev = points[i-1];
      let next = points[i+1];
      let {options, shape} = point;
      let tx=0, ty=0, distance=0, rad=0;
      let deltaX = next[0] - prev[0];
      let deltaY = next[1] - prev[1];
      distance = Math.sqrt(sqr(next[0] - prev[0]) + sqr(next[1] - prev[1]));

      if(typeof shape == 'function') shape = shape(distance, options);
      let toAdd = shape.buildPoints ? shape.buildPoints():shape;
      
      rad = Math.atan2(deltaY, deltaX);
      if(options.mirror) PointUtils.scalePoints(toAdd,1,-1);
      
      if(options.start != undefined) tx = options.start;
      if(options.center || options.end != undefined){
        let len = 0;
        toAdd.forEach(p=>{if(p[0] > len) len = p[0]});

        if(options.center){
          tx = distance/2 - len/2 + (options.start || 0);
        }
        if(options.end != undefined){
          tx = distance - len - options.end;
        }
      }
      if(rad && tx) {
        // use tx to calc ty before it is changed
        ty = tx * Math.sin(rad)
        tx = tx * Math.cos(rad)
      }
      
      if(rad) PointUtils.rotatePoints(toAdd, rad)
      if(tx) PointUtils.translatePoints(toAdd,tx,ty);


      let pStart = points[0];
      //PointUtils.translatePoints(toAdd, prev[0]-pStart[0], prev[1]-pStart[1])
      PointUtils.translatePoints(toAdd, prev[0], prev[1])

      while(isEqPoint(prev,toAdd[0])) toAdd.shift();
      while(isEqPoint(next,toAdd[toAdd.length-1])) toAdd.pop();
      ret.push(...toAdd);
    }else{
      ret.push([...point])
    }
  }
  while(isEqPoint(ret[0], ret[ret.length-1])) ret.pop();
  return ret;
}

function myFix2(n){ return parseFloat(n.toFixed(2))}

proto.build = function(h=0, {points, preview=0, closed=true, tx=0, ty=0, tz=0, sx=1,sy=1, w=0, reverse=false}={}){
  if(!points) points = this.buildPoints()
  if(reverse) points = points.reverse()

  if(sx != 1 || sy != 1) PointUtils.scalePoints(points, sx,sy);
  if(tx != 0 || ty != 0) PointUtils.translatePoints(points, tx,ty);

  if(!preview) try{
      let shape = path2.fromPoints({closed}, points)
      if(w){
        shape = extrusions.extrudeRectangular({size:w , height:h, closed}, closed ? shape : path2.fromPoints({closed:false},points))
      }else{      
        shape = geom2.fromPoints(points)
        if(h) shape = [extrusions.extrudeLinear({height: h}, shape)]
      }
      if(tz) return [translate([0,0,tz], shape)]
      return [shape];
  }catch(e){
    console.log(e.message,e);
  }
  preview = preview || 0.1;
  let tmp = this.points.filter(p=>!p.shape);
  let ret = [extrusions.extrudeRectangular({size:preview , height:preview, closed}, path2.fromPoints({closed},points))];
  if(tmp.length != this.points.length){
    ret.push(colors.colorize([1,1,0],translate([0,0,-preview], extrusions.extrudeRectangular({size:preview , height:preview}, path2.fromPoints({closed},tmp)))))
  }
  for(let i=0; i<points.length; i++){
    let p = points[i];
    ret.push(
      colors.colorize([0,0,1],
        translate([p[0],p[1],preview], 
          cylinder({radius:preview/2, height:preview})
        )
      )
    );
  }
  return ret;
}

