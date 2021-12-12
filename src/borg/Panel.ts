export default class Panel {
  complete: boolean;
  size: any;
  terrain: any;
  layerStrategies: any;
  layerCurrent: any;

  constructor(size, layers) {
    this.complete = false;
    this.size = size;
    this.terrain = [];
    this.layerStrategies = layers;
    this.layerCurrent = 0;

    for (let layer = this.layerStrategies.length - 1; layer >= 0; layer--) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (this.terrain[layer] === undefined) {
            this.terrain[layer] = [];      
          }
          if (this.terrain[layer][x] === undefined) {
            this.terrain[layer][x] = [];      
          }
          this.terrain[layer][x][y] = 0;
        }
      }
    }
    console.log('init');
  }

  hasNoNeighbours(xProspect, yProspect, id, spacing = 3) {
    let valid = true;
    for (let y = -spacing; y <= spacing; y++) {
      for (let x = -spacing; x <= spacing; x++) {
        if (xProspect + x < 0 
          || xProspect + x >= this.size
          || yProspect + y < 0
          || yProspect + y >= this.size) {
            // Ignore
        } else if (this.terrain[this.layerCurrent][xProspect + x][yProspect + y] !== 0 && this.terrain[this.layerCurrent][xProspect + x][yProspect + y] !== id) {
          valid = false;
        }
      }
    }
    return valid;
  }

  canPlace(xProspect, yProspect, id) {
    if (xProspect < 0 
      || xProspect >= this.size
      || yProspect < 0
      || yProspect >= this.size) {
        return false;
    }

    let valid = true;
    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        if (xProspect + x < 0 
          || xProspect + x >= this.size
          || yProspect + y < 0
          || yProspect + y >= this.size) {
            // Ignore
        } else if (this.terrain[this.layerCurrent][xProspect + x][yProspect + y] !== 0 && this.terrain[this.layerCurrent][xProspect + x][yProspect + y] !== id) {
          valid = false;
        }
      }
    }
    return valid;
  }

  set(xProspect, yProspect, id) {
    this.terrain[this.layerCurrent][xProspect][yProspect] = id;
  }

  tick() {
    if (this.complete) {
      return true;
    }
    this.layerStrategies[this.layerCurrent].tick(this);

    if (this.layerStrategies[this.layerCurrent].complete && this.layerCurrent < this.terrain.length - 1) {
      this.layerCurrent += 1;
    } else if (this.layerStrategies[this.layerCurrent].complete) {
      this.complete = true;
      console.log('complete');
    }
  }

  getSquare(layer, x, y) {
    if (x < 0 || y < 0 || x > this.size - 1 || y > this.size - 1) {
      return 0;
    }
    return this.terrain[layer][x][y];
  }

  get(x, y) {
    if (x < 0 || y < 0 || x > this.size - 1 || y > this.size - 1) {
      return 0;
    }
    return this.terrain[this.layerCurrent][x][y];
  }
}