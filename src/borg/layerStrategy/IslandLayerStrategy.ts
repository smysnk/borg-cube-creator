import Rectangle from '../shapes/Rectangle';

export default class IslandLayerStrategy {
  currentId: any;
  complete: boolean;
  spacing: any;
  maxLength: any;
  maxWidth: any;
  height: any;
  aboveHorizon: boolean;

  constructor({ spacing = 2, maxLength = 5, maxWidth = 20, height = 1, aboveHorizon = false } = {}) {
    this.currentId = 1;
    this.complete = false;
    this.spacing = spacing;
    this.maxLength = maxLength;
    this.maxWidth = maxWidth;
    this.height = height;
    this.aboveHorizon = aboveHorizon;
  }

  tick(panel: any) {
    this.currentId += 1;

    let x = 0;
    let y = 0;
    let valid = false;
    while ((x !== panel.size - 1 || y !== panel.size - 1) && !valid) {
      x += 1;
      if (x >= panel.size) {
        x = 0;
        y += 1;
      }
      valid = panel.hasNoNeighbours(x, y, this.currentId, this.spacing);
    }

    if (valid) {
      let shape = new Rectangle(this.maxLength, this.maxWidth);
      for (let shapeY = 0; shapeY < shape.length; shapeY++) {
        for (let shapeX = 0; shapeX < shape.width; shapeX++) {
          if (panel.canPlace(shapeX + x, shapeY + y, this.currentId)) {
            panel.set(shapeX + x, shapeY + y, this.currentId);
          }
        }
      }
    }

    if (x === panel.size - 1 && y === panel.size - 1) {
      this.complete = true;
    }
  }
}