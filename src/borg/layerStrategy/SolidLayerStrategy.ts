export default class SolidLayerStrategy {  
  complete: any;
  
  constructor() {
    this.complete = false;
  }

  tick(panel) {
    for (let x = 0; x < panel.size; x++) {
      for (let y = 0; y < panel.size; y++) {        
        panel.set(x, y, 2);
      }
    }  
    
    this.complete = true;
  }
}