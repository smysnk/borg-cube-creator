const _rMagnet = 2.1;
const _hMagnet = 2.9;

function rotateD(angles, ...parts){
  return transforms.rotate(angles.map(toRad),...parts);
}

const _m5_screw = 2.6;
const _m5_nut = 4.6;
const _m5_nut_h = 3.9;

function reduceWidth(r, reduce){
  let ret = [...r]
  ret[0] = r[0] - reduce
  ret[1] = r[1] - reduce
  return ret;
}

function makeCylinderSlice(slice){
  switch(slice.toUpperCase()){
  case 'N': return [0,Math.PI]
  case 'S': return [Math.PI, Math.PI*2]
  case 'W': return [Math.PI*0.5, Math.PI*1.5]
  case 'E': return [Math.PI*1.5, Math.PI*2.5]
  case 'NE': 
  case 'EN': return [0, Math.PI*0.5]
  case 'NW': 
  case 'WN': return [Math.PI*0.5, Math.PI]
  case 'SW': 
  case 'WS': return [Math.PI, Math.PI*1.5]
  case 'SE': 
  case 'ES': return [Math.PI*1.5, Math.PI*2]

  }
}

function bottomCube(options){
  let {wall = 0, topWall = 0, bottomWall = 0, open} = options
  let walls = {T:topWall, B:bottomWall, N:wall, S:wall, E:wall, W:wall}
  if(options.walls) walls = {...walls, ...options.walls}
  if(options.sizeIn){
    let [x,y,z] = options.sizeIn;
    options.size = [ x + walls.W + walls.E, y + walls.S + walls.N, z + walls.B + walls.T ]
  }
  options.center = dirAlign(options.align || 'T', options.size, [0,0,options.bottom || 0])
  let piece = cuboid(options)
  if(wall || options.walls){
    options.size[0] -= walls.W + walls.E
    options.size[1] -= walls.N + walls.S
    options.size[2] -= walls.T + walls.B
    options.center[0] += (walls.W - walls.E) / 2
    options.center[1] += (walls.S - walls.N) / 2
    options.center[2] += (walls.B - walls.T) / 2
    piece = subtract(piece, cuboid(options))
  }
  if(options.holes) piece = subtract(piece, translate(options.center,...options.holes))
  return dirRotateMove(options, piece)[0];
}

function cylinderSlice(options){
  let {radius, height, wall} = options
  let {startRadius = radius, startWall = wall, startAngle=0, endAngle=Math.PI/2, slant=0} = options
  let {endRadius = startRadius, endWall = startWall} = options
  if(options.slice){
    startAngle = options.slice[0]
    endAngle = options.slice[1]
  }
  if(options.sliceD){
    startAngle = toRad(options.sliceD[0])
    endAngle = toRad(options.sliceD[1])
  }
  if(options.slantD) slant = toRad(options.slantD)

  function makePoints(modifier, height){
    return [
      [...rPoint(startRadius - startWall, startAngle+modifier), height],
      [...rPoint(startRadius, startAngle+modifier), height],
      [...rPoint(endRadius, endAngle-modifier), height],
      [...rPoint(startRadius - startWall, endAngle-modifier), height],
    ]
  }

  let points = [
    ...makePoints(slant,0),
    ...makePoints(-slant,height),
  ]
  return [
    cuboidFromPoints(points),
   // ...data.points.map(p=>translate(p,sphere())),
  ]
}
/** create cuboid from two layers of points that are counter clockwise
layer1   layer2
2--1     6--5
|  |     |  |
3--0     7--4

  6---5
 /|  /|
2-|-1 |
| | | |
| 7---4
|/  |/
3---0

*/
function cuboidFromPoints(points){
  let data = {
    points,
    faces:[
      [3,2,1,0],// bottom
      [4,5,6,7],// top
      [3,0,4,7],// close/front/S
      [6,5,1,2],// far/back/N
      [0,1,5,4], // left/E
      [7,6,2,3], // right/W
    ]
  }
  var piece = polyhedron(data)
  piece.polygons[THREE_util.arrayGeometryCachekey] = data
  return piece
}

function cuboidFromPointsZ(points1,z1, points2,z2){
  if(!points2) points2 = points1
  return cuboidFromPoints([
    ...points1.map(p=>[p[0],p[1],z1]),
    ...points2.map(p=>[p[0],p[1],z2]),
  ]);
}

function slantCube(w,d,h,options={}){
  let w2 = w/2
  let d2 = d/2
  let h2 = h/2
  let {N=0,S=0,E=0,W=0} = options.slant
  let center = dirAlign(options.align || 'T', [w,d,h])
  let points = [
    [ w2+center[0], -d2+center[1], -h2+center[2]], // SE
    [ w2+center[0],  d2+center[1], -h2+center[2]], // NE
    [-w2+center[0],  d2+center[1], -h2+center[2]], // NW
    [-w2+center[0], -d2+center[1], -h2+center[2]], // SW

    [ w2+E+center[0], -d2-S+center[1],  h2+center[2]], // SE
    [ w2+E+center[0],  d2+N+center[1],  h2+center[2]], // NE
    [-w2-W+center[0],  d2+N+center[1],  h2+center[2]], // NW
    [-w2-W+center[0], -d2-S+center[1],  h2+center[2]], // SW
  ]
  console.log('points',points);
  return dirRotateMove(options,cuboidFromPoints(points))[0]
}

function bottomPyramid(options){
  let {size=1, center=[0,0,0]} = options
  if(typeof size == 'number') size = options.size = [size, size, Math.sqrt(size*size/2)]

  options.center = dirAlign(options.align || 'T', options.size, [0,0,options.bottom || 0])

  let [x,y,z] = size;
  let [cx,cy,cz] = options.center;
  let x2 = x/2
  let y2 = y/2
  let z2 = z/2
  let data = {
    points:[
      [cx - x2, cy - y2, cz -z2],
      [cx + x2, cy - y2, cz -z2],
      [cx + x2, cy + y2, cz -z2],
      [cx - x2, cy + y2, cz -z2],
      // top is added later
    ],
    faces:[
      [3,2,1,0],
      [0,1,4],
      [1,2,4],
      [2,3,4],
      [3,0,4],
    ]
  }
  let top = [cx + 0 , cy +  0, cz +z2];
  dirAlign(options.alignTop, size,top)
  top = translatePoint(top,options.translateTop)

  data.points.push(top)
  let piece = polyhedron(data)
  piece.polygons[THREE_util.arrayGeometryCachekey] = data
  return dirRotateMove(options, piece)[0];
}

function bottomPyramidCorner(options){
  let {size=1, center=[0,0,0], corner=0} = options
  if(typeof size == 'number') size = options.size = [size, size, Math.sqrt(size*size/2)]

  options.center = dirAlign(options.align || 'T', options.size, [0,0,options.bottom || 0])

  let [x,y,z] = size;
  let [cx,cy,cz] = options.center;
  let x2 = x/2
  let y2 = y/2
  let z2 = z/2
  let data = {
    points:[
      [cx + x2, cy + y2, cz -z2],
      [cx - x2, cy + y2, cz -z2],
      [cx - x2, cy - y2, cz -z2],
      [cx + x2, cy - y2, cz -z2],
      // top is added later
    ],
    faces:[
      [2,1,0],
      [0,1,3],
      [1,2,3],
      [2,0,3],
      // [3,0,4],
    ]
  }
  data.points.splice(corner%4,1)
  let top = [cx + 0 , cy +  0, cz +z2];
  dirAlign(options.alignTop, size,top)
  top = translatePoint(top,options.translateTop)
  
  data.points.push(top)
  let piece = polyhedron(data)
  piece.polygons[THREE_util.arrayGeometryCachekey] = data
  return dirRotateMove(options, piece)[0];
}

function translatePoint(p,t){
  if(t) return [p[0] + t[0] || 0, p[1] + t[1] || 0, p[2] || 0 + t[2] || 0]
    return p
}

function bottomCylinder(options){
  return bottomCylinderElliptic(options)
  // let r2 = options.radius*2
  // options.center = dirAlign(options.align || 'T', [r2,r2,options.height], [0,0,options.bottom || 0])
  // let piece = cylinder(options)
  // if(options.wall){
  //   let {topWall = 0, bottomWall = 0} = options
  //   options.height -= topWall + bottomWall
  //   options.radius -= options.wall
  //   options.center[2] += bottomWall - (bottomWall + topWall) / 2
  //   piece = subtract(piece, cylinder(options))
  // }
  // if(options.holes) piece = subtract(piece, ...options.holes)
  // return dirRotateMove(options, piece)[0];
}

function bottomCylinderElliptic(options){
  let {radius, slice} = options
  const toArray = val=>val instanceof Array ? val:[val,val]
  if(radius) options.startRadius = [radius,radius]

  options.startRadius = toArray(options.startRadius)
  let {startRadius} = options

  if(!options.endRadius) options.endRadius = startRadius;
  options.endRadius = toArray(options.endRadius)
  
  options.center = dirAlign(options.align || 'T', [startRadius[0]*2,startRadius[1]*2,options.height], [0,0,options.bottom || 0])
//  options.center = [0,0,options.height/2+(options.bottom || 0)];
  if(slice){
    if(typeof slice == 'string') slice = makeCylinderSlice(slice)
    options.startAngle = slice[0]
    options.endAngle = slice[1]
  }
  if(options.sliceD){
    options.startAngle = toRad(options.sliceD[0])
    options.endAngle = toRad(options.sliceD[1])
  }
  let piece = cylinderElliptic(options)
  if(options.wall){
    let endWall
    let startWall = endWall = options.wall
    if(startWall instanceof Array){
      endWall = startWall[1]
      startWall = startWall[0]
    }
    let {topWall = 0, bottomWall = 0} = options
    options.height -= topWall + bottomWall
    options.startRadius = reduceWidth(startRadius, startWall)
    options.endRadius = reduceWidth(options.endRadius, endWall)
    options.center[2] += bottomWall - (bottomWall + topWall) / 2
    piece = subtract(piece, cylinderElliptic(options))
  }
  if(options.holes) piece = subtract(piece, ...options.holes)
  return dirRotateMove(options, piece)[0];
}

function dirAlign(align='T',size=[1,1,1],center=[0,0,0]){
  if(!align) return;
  for(let i=0; i<align.length; i++){
    let dir = align[i];
    if(dir == 'T') center[2] += size[2]/2
    if(dir == 'B') center[2] -= size[2]/2
    if(dir == 'S') center[1] -= size[1]/2
    if(dir == 'N') center[1] += size[1]/2
    if(dir == 'E') center[0] += size[0]/2
    if(dir == 'W') center[0] -= size[0]/2
  }
  return center;
}

function dirRotateMove(options,...elems){
  let dirs = options.dir||'';
  let rot = [0,0,0]
  for(let i=0; i<dirs.length; i++){
    let dir = dirs[i];
    if(dir == 'B') rot = [180,0,0]
    if(dir == 'S') rot = [90,0,0] 
    if(dir == 'N') rot = [-90,0,0]
    if(dir == 'E') rot = [0,90,0] 
    if(dir == 'W') rot = [0,-90,0]
    
    if(dir == 'Y') rot[1] += 90
    if(dir == 'y') rot[1] -= 90

    if(dir == 'X') rot[0] += 90
    if(dir == 'x') rot[0] -= 90

    if(dir == 'Z') rot[2] += 90
    if(dir == 'z') rot[2] -= 90
  }

  elems = [rotateD(rot ,...elems)]

  if(options.tx || options.ty || options.tz)
    elems = [translate([options.tx || 0, options.ty || 0, options.tz || 0 ], ...elems)];

  return elems;
}

function magnetHole(options){
  options.radius = options.radius || options.r || (_rMagnet + options.rTol || 0)
  options.height = options.height || options.h || (_hMagnet + options.hTol || 0)
  return bottomCylinder(options)
}


function csgFromSegments (segments, {w=2, h=1}={}) {
  return segments.map(segment => rectangular_extrude(segment, { w, h }) );
}

function makeText({text='A', height=10, w=2, h=1}={}) {
  if (text === undefined || text.length === 0) return []
  const lineSegments3D = []
  const lineSegmentPointArrays = vectorText({ x: 0, y: 0, height, input: text }) // line segments for each character
  lineSegmentPointArrays.forEach((segmentPoints) => { // process the line segment
    const segmentShape = extrudeLinear(
      { height: h },
      jscad.expansions.expand({ delta: w, corners: 'round', segments: 16 }, jscad.primitives.line(segmentPoints))
    )
    lineSegments3D.push(segmentShape)
  })

  const messageObject = center([true, true, false], union(lineSegments3D))
  return messageObject;
}

function m5_nut({height=_m5_nut_h, radius=_m5_nut, segments=6, rTol=0, hTol=0, bottom=0, dir='T', align='T', tx=0, ty=0, tz=0}={}){
  let options = {height, radius, segments, rTol, hTol, bottom, align, dir, tx, ty, tz}
  options.radius = options.radius + options.rTol;
  options.height = options.height + options.hTol;
  return bottomCylinder(options);
}

function m5_screw({height=10, radius=_m5_screw, segments=32, rTol=0, hTol=0, bottom=0, dir='T', align='T', tx=0, ty=0, tz=0}={}){
  let options = {height, radius, segments, rTol, hTol, bottom, dir, tx, ty, tz}
  options.radius = options.radius + options.rTol;
  options.height = options.height + options.hTol;
  return bottomCylinder(options);
}

function m5_both({height=10, bottom=0, rTol1=0, rTol2=0, hTol=0, dir='T', align='T', tx=0, ty=0, tz=0}={}){
  let r2 = _m5_nut*2
  let size = [r2,r2,height] // size together
  
  let nutHalf = _m5_nut_h/2;
  let center = dirAlign(align,size, [0,0, bottom - height/2 + nutHalf])
  let nut = cylinder({segments:6, radius:_m5_nut+rTol1, height:_m5_nut_h, center})

  center = dirAlign(align,size, [0,0, bottom +nutHalf])
  let screw   = cylinder({height:height- _m5_nut_h, radius:_m5_screw+rTol2, center})

  return dirRotateMove({dir,tx,ty,tz},[nut, screw])
}
