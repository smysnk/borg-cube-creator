import React, { useEffect, useRef } from "react";

import Panel from './borg/Panel';
import SolidLayerStrategy from './borg/layerStrategy/SolidLayerStrategy';
import IslandLayerStrategy from './borg/layerStrategy/IslandLayerStrategy';
import BridgeLayerStrategy from './borg/layerStrategy/BridgeLayerStrategy';

let layerStrategies = [
  new SolidLayerStrategy(),
  new IslandLayerStrategy({ spacing: 1 }),
  // new BridgeLayerStrategy(),
  new IslandLayerStrategy({ spacing: 2 }),
  // new IslandLayerStrategy(),
];

const panel = new Panel(250, layerStrategies);

const canvasSize = 500;
const gridSize = canvasSize / panel.size;

const colors = [
  'rgba(255, 0, 0, 0.5)',
  'rgba(0, 255, 0, 0.5)',
  'rgba(0, 0, 255, 0.5)',
];
// const colors = [
//   'rgba(0, 0, 0, 0.5)',
// ];

const Canvas = props => {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const ctx = canvas.getContext('2d');
    let frameCount = 0;
    let animationFrameId;    

    const render = () => {
      frameCount++;
      panel.tick();
      
      if (frameCount % 120 === 0) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.rect(0, 0, canvasSize, canvasSize);
        ctx.fill();
  
        for (let layer = 0; layer < panel.layerStrategies.length; layer++) {
          for (let y = 0; y < panel.size; y++) {
            for (let x = 0; x < panel.size; x++) {
              if (panel.getSquare(layer, x, y)) {
                ctx.fillStyle = colors[layer % colors.length];
                ctx.beginPath();
                ctx.rect(x * gridSize, y * gridSize, gridSize, gridSize);
                ctx.fill();
              }
            }
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(render);
    }
    render();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
  }, [])
  
  return <canvas ref={canvasRef} {...props}/>
}

export default Canvas;