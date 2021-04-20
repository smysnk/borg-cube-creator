export default class SolidLayerStrategy {  
  complete: any;
  height: any;
  
  constructor({ height } = { height: 1 }) {
    this.complete = false;
    this.height = height;
  }

  tick(panel: any) {
    for (let x = 0; x < panel.size; x++) {
      for (let y = 0; y < panel.size; y++) {        
        panel.set(x, y, 2);
      }
    }  
    
    this.complete = true;
  }
}