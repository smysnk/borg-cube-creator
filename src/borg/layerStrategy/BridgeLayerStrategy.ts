import _ from 'lodash';
import MagicWand from '../shapes/MagicWand';

export default class BridgeLayerStrategy {
  currentId: any;
  complete: any;
  
  constructor() {
    this.currentId = 1;
    this.complete = false;
  }

  findIsland(panel, terrain, x, y) {
    return panel.getSquare(panel.layerCurrent, x, y) === 0 && terrain[x][y] !== 0;
  }

  discoverShape({ panel, layer, shape, targetX, targetY }) {
    if (layer[targetX][targetY] === 0) {
      return false;
    }

    // Ignore if this square has already been revealed
    if (shape.get(targetX, targetY) !== 0) {
      return false;
    }

    shape.reveal(targetX, targetY);
    // console.log(`id=${shape.id} w=${shape.width} h=${shape.height} x=${shape.offsetX} y=${shape.offsetY}`);


    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        let nextX = targetX + x;
        let nextY = targetY + y;
        if (nextX < 0
          || nextX > panel.size - 1
          || nextY < 0
          || nextY > panel.size - 1
          || layer[nextX][nextY] === 0 
          || panel.terrain[panel.layerCurrent][nextX][nextY] !== 0 
          || shape.get(nextX, nextY) !== 0) {
          continue;
        }
        this.discoverShape({ panel, layer, shape, targetX: nextX, targetY: nextY });
      }
    } 
  }

  save(shape, panel) {
    for (let yFill = shape.offsetY; yFill < shape.offsetY + shape.height; yFill++) {
      for (let xFill = shape.offsetX; xFill < shape.offsetX + shape.width; xFill++) {
        if (xFill < 0 || yFill < 0 || xFill > panel.size - 1 || yFill > panel.size - 1) {
          continue;
        }
        if (shape.get(xFill, yFill)) {
          panel.terrain[panel.layerCurrent][xFill][yFill] = shape.get(xFill, yFill);
        }
      }
    }  
  }

  tick(panel) {
    let x = 0;
    let y = 0;
    console.log('start bridging');
    while (x !== panel.size - 1 || y !== panel.size - 1) {
      this.currentId += 1;
      x += 1;
      if (x >= panel.size) {
        x = 0;
        y += 1;
      }

      if (panel.getSquare(panel.layerCurrent - 1, x, y) === 0) {
        continue;
      }
      
      let shape = new MagicWand({ id: this.currentId });
      let parentLayer = panel.terrain[panel.layerCurrent - 1];
      this.discoverShape({ panel, shape, layer: parentLayer, targetX: x, targetY: y });
      // this.save(shape, panel);
      
      for (let yDirection = -1; yDirection <= 1; yDirection++) {
        for (let xDirection = -1; xDirection <= 1; xDirection++) {
          // Don't want to work diagonally or no x/y change
          if ((yDirection === 0 && yDirection === 0) || xDirection === yDirection) {
            continue;            
          }
          // let shapeCurrent = Object.assign(Object.create(Object.getPrototypeOf(shape)), shape);
          let shapeCurrent = _.cloneDeep(shape);
          while (!shapeCurrent.dead) {
            console.log(shapeCurrent);
            shapeCurrent.translateDecay(xDirection, yDirection, panel, panel.layerCurrent - 1);
            this.save(shapeCurrent, panel);           
          }
        }
      }
    }

    if (x === panel.size - 1 && y === panel.size - 1) {
      this.complete = true;
      console.log('complete layer 2');
    }
  }
}