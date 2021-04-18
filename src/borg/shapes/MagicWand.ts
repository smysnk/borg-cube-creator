export default class Shape {
  initialized: any;
  id: any;
  hp: any;
  dead: any;
  offsetX: any;
  offsetY: any;
  width: any;
  height: any;
  bitmap: any;

  constructor({ id, hp = 2 }) {
    this.initialized = false;
    this.id = id;
    this.hp = hp;
    this.dead = false;
  }

  reveal(targetX, targetY) {
    if (!this.initialized) {
      this.initialized = true;
      this.offsetX = targetX;
      this.offsetY = targetY;
      this.width = 1;
      this.height = 1;
      this.bitmap = [];
      this.bitmap[0] = [];
      this.bitmap[0][0] = this.hp;
      return;
    }
    let oldOffsetX = this.offsetX;
    let oldOffsetY = this.offsetY;
    let offsetDeltaX = targetX - this.offsetX;
    let offsetDeltaY = targetY - this.offsetY;

    let widthOld = this.width;
    let heightOld = this.height;

    // Adjust the width if needed
    if (offsetDeltaX < 0) {
      this.width = this.width + Math.abs(offsetDeltaX);
    } else if (offsetDeltaX + 1 > this.width) {
      this.width = offsetDeltaX + 1;
    }

    // Adjust the height if needed
    if (offsetDeltaY < 0) {
      this.height = this.height + Math.abs(offsetDeltaY);
    } else if (offsetDeltaY + 1 > this.height) {
      this.height = offsetDeltaY + 1;
    }

    // If the new offset is negative, need to adjust the original offset
    if (offsetDeltaX < 0) {
      this.offsetX = targetX;
    }
    
    // If the new offset is negative, need to adjust the original offset
    if (offsetDeltaY < 0) {
      this.offsetY = targetY;
    }
    
    // Recreate bitmap if the size has changed
    if (this.width !== widthOld || this.height !== heightOld) {
      let bitmapNew = [];
      for (let y = 0; y < (this.height); y++) {
        for (let x = 0; x < (this.width); x++) {
          if (bitmapNew[x] === undefined) {
            bitmapNew[x] = [];
          }

          let oldBitmapOffsetX = oldOffsetX - this.offsetX;
          let oldBitmapOffsetY = oldOffsetY - this.offsetY;

          bitmapNew[x][y] = this.get(x - oldBitmapOffsetX, y - oldBitmapOffsetY);
        }
      }
      this.bitmap = bitmapNew;
    } else {
      this.bitmap[targetX - this.offsetX][targetY - this.offsetY] = this.hp;
    }
  }

  get(x, y) {
    let targetX = x - this.offsetX;
    let targetY = y - this.offsetY;

    if (!this.initialized || targetX < 0 || targetX > this.bitmap.length - 1 || targetY < 0 || targetY > this.bitmap[0].length - 1) {
      return 0;
    }
    return this.bitmap[targetX][targetY];
  }

  set(x, y, value) {
    let targetX = x - this.offsetX;
    let targetY = y - this.offsetY;

    if (!this.initialized || targetX < 0 || targetX > this.bitmap.length - 1 || targetY < 0 || targetY > this.bitmap[0].length - 1) {
      return false;
    }
    this.bitmap[targetX][targetY] = (value < 0) ? 0 : value;
    return true;
  }

  translateDecay(xDirection, yDirection, panel, layer) {
    this.offsetX += xDirection;
    this.offsetY += yDirection;
    
    let dead = true;
    for (let yDecay = this.offsetY; yDecay < this.offsetY + this.height; yDecay++) {
      for (let xDecay = this.offsetX; xDecay < this.offsetX + this.width; xDecay++) {
        // If out of bounds, decay
        if (xDecay < 0 || yDecay < 0 || xDecay > panel.size - 1 || yDecay > panel.size - 1) {
          this.set(xDecay, yDecay, 0);
          continue;
        }

        // If there is no square here ignore
        if (this.get(xDecay, yDecay) === 0) {
          continue;
        }

        if (panel.getSquare(layer, xDecay, yDecay) === 0) {
          // Decay 2 if there is no island on the other side
          // let value = this.get(xDecay, yDecay) - 1; 
          let value = (panel.getSquare(layer, xDecay + xDirection, yDecay + yDirection) === 0) ? 0 : 1;
          this.set(xDecay, yDecay, value);
          if (value) {
            dead = false;
          }
        } else {
          dead = false;
        }
      
      }
    } 
    this.dead = dead;
  }

}
