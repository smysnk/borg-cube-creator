
import jscad from '@jscad/modeling';
import stlSerializer from '@jscad/stl-serializer';
import { deserializers, solidsAsBlob } from '@jscad/io';
import fs from 'fs';

import Panel from './borg/Panel';
import SolidLayerStrategy from './borg/layerStrategy/SolidLayerStrategy';
import IslandLayerStrategy from './borg/layerStrategy/IslandLayerStrategy';
import BridgeLayerStrategy from './borg/layerStrategy/BridgeLayerStrategy';

let layerStrategies = [
  new SolidLayerStrategy({ height: 1 }),
  new IslandLayerStrategy({ height: 1, spacing: 1 }),
  new IslandLayerStrategy({ height: 1, spacing: 1 }),
  new IslandLayerStrategy({ height: 1, spacing: 2, aboveHorizon: true }),
];

const panel = new Panel(60, layerStrategies);
const gridSize = 1;

const colors = [
  'rgba(255, 0, 0, 0.5)',
  'rgba(0, 255, 0, 0.5)',
  'rgba(0, 0, 255, 0.5)',
];

let start = Date.now();
while (!panel.complete) { 
  panel.tick();
}
console.log(`duration = ${Date.now() - start}`);


const { line, polygon, star } = jscad.primitives;
const { extrudeRectangular, extrudeLinear, extrudeRotate } = jscad.extrusions;
const { rotateX, rotateZ, rotateY, scale, translate } = jscad.transforms;
const { expand } = jscad.expansions;
const { cuboid, cylinder, cylinderElliptic, ellipsoid, geodesicSphere, roundedCuboid, roundedCylinder, sphere, torus } = jscad.primitives;
const { union, subtract, intersect } = jscad.booleans;
const { degToRad } = jscad.utils;

function main () {
  const terrain:any = [];

  let layerHeight = 0;
  let layerHeightBelowHorizon = 0;
  
  const square = polygon({ points: [[0, 0], [gridSize, 0], [gridSize, gridSize], [0, gridSize]] });
  for (let layer = 0; layer < panel.layerStrategies.length; layer++) {
    for (let y = 0; y < panel.size; y++) {
      for (let x = 0; x < panel.size; x++) {
        if (panel.getSquare(layer, x, y)) {
          let startX = x * gridSize;
          let startY = y * gridSize;
          const cube = extrudeLinear({ height: panel.layerStrategies[layer].height * gridSize }, square);
          terrain.push(translate([startX, startY, layerHeight * gridSize], cube));
        }
      }
    }
    layerHeight += panel.layerStrategies[layer].height;
    layerHeightBelowHorizon += (panel.layerStrategies[layer].aboveHorizon) ? 0 : panel.layerStrategies[layer].height;
  }

  let trimEdges:any = [];

  // Trim edges
  let height = (gridSize) * (layerHeightBelowHorizon);
  
  const triangle = polygon({ points: [[0, 0], [height, 0], [height, height]] });
  let shape:any;

  for (let i = 0; i < 4; i++) {     
    shape = extrudeLinear({ height: gridSize * panel.size }, triangle)
    shape = rotateX(degToRad(90), shape);
    shape = rotateZ(degToRad(-90), shape);
    shape = translate([gridSize * panel.size, height, 0], shape);
    for (let j = 0; j <= i; j++) {
      shape = rotateZ(degToRad(-90), shape);
      shape = translate([0, gridSize * panel.size, 0], shape);
    }

    trimEdges.push(shape);
  }

  // Supports around the edges
  let supportWidth = 3; 
  let supports:any = [];
  const support = polygon({ points: [[0, 0], [supportWidth, 0], [height + supportWidth - 1, height - 1],  [height, height - 1]] });
  for (let i = 0; i < 4; i++) {       
    shape = extrudeLinear({ height: gridSize * panel.size }, support)
    shape = rotateX(degToRad(90), shape);
    shape = rotateZ(degToRad(-90), shape);
    shape = translate([gridSize * panel.size, height + 2, 0], shape);
    for (let j = 0; j <= i; j++) {
      shape = rotateZ(degToRad(-90), shape);
      shape = translate([0, gridSize * panel.size, 0], shape);
    }

    supports.push(shape);
  }

  let offset =  (panel.size / 2);

  shape = subtract(union([...terrain, supports]), trimEdges);
  
  // Solar Panel Cuttout
  // let solarPanelSize = 40.1;
  // shape = subtract(shape, translate([offset, offset, 3], cuboid({ size: [solarPanelSize, solarPanelSize, 5]})));
  // shape = subtract(shape, translate([offset, offset, 0], cuboid({ size: [solarPanelSize - 10, solarPanelSize, 2]})));

  // // Antenna
  // let antennaHeight = 15;
  // let antennaRadius = 12.5 / 2;
  // let antennaWallWidth = 6.2;
  // shape = union([shape, translate([offset, offset, antennaHeight / 2], cylinder({ height: antennaHeight, radius: antennaRadius + antennaWallWidth }))])
  // shape = subtract(shape, translate([offset, offset, antennaHeight / 2], cylinder({ height: antennaHeight, radius: antennaRadius })))

  // // Screw hole
  // let screwHeadLength = 6;
  // let screwLength = 20 + screwHeadLength;
  // let screwOffsetZ = antennaHeight - 6;
  // let screw = translate([0, 0, screwLength / 2], cylinder({ height: screwLength, radius: 2.7 / 2.0 }));
  // // screw = union(screw, cylinder({ height: screwHeadLength, radius: 5.75 / 2.0 }));
  // screw = rotateX(degToRad(-90), screw);
  // screw = translate([offset, offset - screwLength, screwOffsetZ], screw);
  
  // shape = subtract(shape, screw);
  // shape = union(shape, screw);

  // return screw;

  return shape;
  // return [union(shapes)];
}

const writeOutputDataToFile = (outputFile, outputData) => {
  fs.writeFile(outputFile, outputData.asBuffer(),
    function (err) {
      if (err) {
        console.log('err', err)
      } else {
        console.log('success')
      }
    }
  )
}

const blob = solidsAsBlob(main(), { format: 'stl' });
writeOutputDataToFile('test.stl', blob);

