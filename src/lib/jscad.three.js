var THREE_util = {
  arrayGeometryCachekey: Symbol('arrayGeometryCachekey'),
  colorPoly: [0, 0, 1],
  lineColor: function(c){
    if(!c || c === this.colorPoly){
      if(!this.lineMaterial) this.lineMaterial = this._lineColor(this.colorPoly)
      return this.lineMaterial
    }
    return this._lineColor(c)
  },
  _lineColor: function(c){
    return new THREE.LineBasicMaterial( { color: new THREE.Color(c[0],c[1],c[2]), opacity: c[3] === void 0 ? 1:c[3], transparent: c[3] != 1 && c[3] !== void 0} )
  },
  line: function(points, color=THREE_util.colorPoly, closed=false){
    let material = this.lineColor(color)
    points = points.map(p=>new THREE.Vector3( p[0], p[1], p[2] || 0 ))
    if(closed) points.push(points[0])
    var geom = new THREE.BufferGeometry().setFromPoints( points )
    return new THREE.Line( geom, material )
  }
}

function CachedGeom(cached, transforms){
  this.cached = cached;
  this.transforms = transforms || jscad.maths.mat4.create()
}

CachedGeom.prototype.translate = function(x=0,y=0,z=0){
  return new CachedGeom(this.cached, jscad.maths.mat4.translate([x,y,z],this.transforms))
}

CachedGeom.prototype.rotate = function(x=0,y=0,z=0){
  return new CachedGeom(this.cached, jscad.maths.mat4.rotate([x,y,z],this.transforms))
}

