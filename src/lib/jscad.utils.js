const jscad = jscadModeling
const { connectors, geometry, geometries, maths, primitives, text, utils, booleans, expansions, extrusions, hulls, measurements, transforms, colors } = jscad
const { cuboid, sphere, cylinder, circle, star,cylinderElliptic, polyhedron, roundedRectangle, rectangle } = primitives
const { translate, scale, center } = transforms
const { union, subtract, intersect } = booleans
const { path2, geom2, geom3, poly2, poly3 } = geometries
const { slice, extrudeFromSlices, extrudeLinear, extrudeRectangular, extrudeRotate, project } = extrusions
const { mat4, line2, line3, vec2, vec3, vec4 } = maths

const extrudeChamfer = ({baseSlice, h=10, cut=0, cutTop=0, cutBottom=0, tz=0, tx=0, ty=0}) => {
  cutTop = cutTop || cut;
  cutBottom = cutBottom || cut;
  let levels = [];
  
  if(cutBottom){
  	levels.push([0,-cutBottom]);
  	levels.push([cutBottom,0]); 
  }else{
  	levels.push([0,0]); 
  }
  
  levels.push([h-cutTop-cutBottom,0]); 
  
  if(cutTop){
	  levels.push([cutTop, -cutTop]); 
  }
  
  return extrudeLevels({levels, baseSlice, tz, tx, ty})
}

const extrudeLevels = ({levels, baseSlice, corners='edge', segments=16, tz=0, tx=0, ty=0}) => {
  let h = 0;
  return extrudeFromSlices({numberOfSlices:levels.length, callback:(progress, counter)=>{
    let level = levels[counter];
    h += level[0];

    base = jscad.expansions.offset({delta:level[1], corners, segments},baseSlice);
    // DIRTY FIX for what expand does to original geom
    if(level[1] > 0){
    	if(corners == 'round'){		
	    	for(let i=0; i<segments-1; i++){
		    	let tmp = base.sides.shift();
		    	base.sides.push(tmp);
	    	}
    	}else{
	    	let tmp = base.sides.pop();
	    	base.sides.unshift(tmp);
    	}
    }
    base = slice.fromSides(base.sides);
    return slice.transform(mat4.fromTranslation([0, 0, h+tz]), base);
  }});	
}

const extrudeScaleLevels = ({levels, baseSlice, corners='edge', segments=16, tz=0, tx=0, ty=0}) => {
  let h = 0;
  baseSlice = slice.fromSides(geom2.toSides(baseSlice))
  return extrudeFromSlices({numberOfSlices:levels.length, callback:(progress, counter)=>{
    let level = levels[counter];
    let _slice = baseSlice
    
    if(level[3]) _slice = slice.fromSides(geom2.toSides(level[3]))
    
    h += level[0];

    let scaleX = scaleY = level[1];
    if(level.length > 2) scaleY = level[2];

    const scaleMatrix = mat4.fromScaling([scaleX, scaleY, 1])
    const transformMatrix = mat4.fromTranslation([0, 0, h+tz])
    return slice.transform(mat4.multiply(scaleMatrix, transformMatrix), _slice)
  }});
}


const roundTop = (base, {height=4, r1=0.2, r1Percent=0, rx=0.1, ry=0, segments=1}) => {
    if(r1Percent) r1 = r1Percent * height;
    ry = ry || rx;
    // radius is for one side, and scale factor is for both
    rx = rx*2; 
    ry = ry*2;


    let numberOfSlices = 2 + segments;
    let step = 1/(numberOfSlices-1);
    let angleDelta = Math.PI / (segments) / 2 ;
    let angleDelta2 = 180 / (segments) / 2 ;
 

    let startH = height - r1;

    let baseSlice = slice.fromSides(geom2.toSides(base))

    return extrudeFromSlices({
      numberOfSlices,
      callback: (progress, counter, baseSlice) => {
        let h = progress * height;
        let scaleX = 1;
        let scaleY = 1;

        if(progress == 1){ // top slice (counter = numSlices-1)
          scaleX = 1 - rx;
          scaleY = 1 - ry;
        }else if(progress == step){ // first top slice (counter = 1)
          h = startH;
        }else if(progress > step){ // curve (counter = 2,3,4...)
          let angle = (counter -1) * angleDelta;
          h = height - r1 + (Math.sin(angle) * r1);
          scaleX = 1 - rx + (Math.cos(angle) * rx);
          scaleY = 1 - rx + (Math.cos(angle) * ry);
        }else{
          // bottom slice (counter = 0)
        }
        
        const scaleMatrix = mat4.fromScaling([scaleX, scaleY, 1])
        const transformMatrix = mat4.fromTranslation([0, 0, h])
        return slice.transform(mat4.multiply(scaleMatrix, transformMatrix), baseSlice)

      }
    }, baseSlice)
  }


function cylinderFromTo(p1,p2, radius){
  const sqr = x=>x*x

  let dx = p2[0] - p1[0]
  let dy = p2[1] - p1[1]
  let dz = p2[2] - p1[2]

  let height = Math.sqrt( sqr(dx) + sqr(dy) + sqr(dz))
  let obj = cylinder({radius, height})

  if(dx || dy){
    let dxy = Math.sqrt( sqr(dx) + sqr(dy))
    
    let ay = Math.atan(dxy/dz) *(dx < 0 ? -1:1) 
    let az = Math.atan(dy/dx)
    let ax = dz < 0 ? -Math.PI:0
    obj = transforms.rotate([ax,ay,az], obj)
  }

  let mid = [p1[0]+dx/2,p1[1]+dy/2,p1[2]+dz/2]

  return translate(mid, obj)
}

function rPointD(r, angle, tx=0, ty=0){
  return rPoint(r, toRad(angle), tx, ty)
}

function rPoint(r, angle, tx=0, ty=0){
  return [tx + r * Math.cos(angle), ty + r * Math.sin(angle)];
}

function elipsePoint(r1,r2, angle){
  return [r1 * Math.cos(angle), r2 * Math.sin(angle)];
}

function elipsePointD(r1,r2, angle){
  return elipsePoint(r1,r2, toRad(angle))
}

function elipseAngle(r1,r2, angle){
  if(r1 == r2) return angle;

  let point = elipsePoint(r1,r2, angle);
  let f1 = [0,0];
  let f2 = [0,0];
  let f;
  if(r1 > r2){
    f = Math.sqrt(r1*r1 - r2*r2)
    f1[0] -= f;
    f2[0] += f;
  }else{
    f = Math.sqrt(r2*r2 - r1*r1)
    f1[1] -= f;
    f2[1] += f;    
  }
 return ( pointAngle(f1,point) + pointAngle(f2,point) ) / 2;
}

function elipseAngleD(r1,r2, angle){
  if(r1 == r2) return angle;
  return toDeg( elipseAngle(r1,r2, toRad(angle)) )
}

function elipseAngleMoveD(r1,r2,tz,angle,...pieces){
  return elipseAngleMove(r1,r2,tz,toRad(angle),...pieces)
}

function elipseAngleMove(r1,r2,tz,_angle,...pieces){
  let p = elipsePoint(r1,r2, _angle)
  let angle = elipseAngle(r1,r2, _angle)
  return translate([...p,tz], transforms.rotate([0,0,angle],...pieces))
}


function pointAngle(p1, p2){
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0])
}

function pointAngleD(p1, p2){
  return toDeg(pointAngle(p1, p2))
}
function toRad(d){return d/180*Math.PI;}
function toDeg(r){return r*180/Math.PI;}

const __cachedResult = {}
function cachedResult(func,params,...variants){
  let key = func.toString()
  let paramKey = {...params}
  if(variants) variants.forEach(v=>{
    delete paramKey[v]
    key += '&'+JSON.stringify(params[v])
  })

  let old = __cachedResult[key]
  if(!old) old = __cachedResult[key] = {}

  paramKey = JSON.stringify(paramKey)
  if(old.paramKey != paramKey){
    old.paramKey = paramKey
    old.result = func(params)
  }
  return old.result
}