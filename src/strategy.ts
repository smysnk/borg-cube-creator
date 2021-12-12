import Panel from './borg/Panel';
import SolidLayerStrategy from './borg/layerStrategy/SolidLayerStrategy';
import IslandLayerStrategy from './borg/layerStrategy/IslandLayerStrategy';
import BridgeLayerStrategy from './borg/layerStrategy/BridgeLayerStrategy';
import TextureLayerStrategy from './borg/layerStrategy/TextureLayerStrategy';

let layerStrategies = [
  new SolidLayerStrategy({ height: 2 }),
  new IslandLayerStrategy({ spacing: 2, height: 2 }),
  new IslandLayerStrategy({ spacing: 2, height: 2 }),
  new IslandLayerStrategy({ spacing: 2, height: 2 }),
  // new BridgeLayerStrategy(),
  // new IslandLayerStrategy({ spacing: 2 }),
  // new IslandLayerStrategy(),
  // new TextureLayerStrategy(),
];

// let layerStrategies = [
//   new SolidLayerStrategy({ height: 1 }),
//   new IslandLayerStrategy({ height: 1, spacing: 1 }),
//   new IslandLayerStrategy({ height: 1, spacing: 1 }),
//   new IslandLayerStrategy({ height: 1, spacing: 2, aboveHorizon: true }),
// ];

export default new Panel(100, layerStrategies);
