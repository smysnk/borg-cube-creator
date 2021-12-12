import Shape from '../shapes/Shape';

export default class TextureLayerStrategy {  
  currentId: any;  
  complete: any;
  height: any;
  
  constructor({ height } = { height: 1 }) {
    this.currentId = 1;
    this.complete = false;
    this.height = height;
  }

  tick(panel: any) {

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
      
      let shape = new Shape({ id: this.currentId });
      let parentLayer = panel.terrain[panel.layerCurrent - 1];
      // this.discoverShape({ panel, shape, layer: parentLayer, targetX: x, targetY: y });
    }
    
    this.complete = true;
  }
}