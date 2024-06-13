import { Container } from 'pixi.js';
import { WindowSize } from '../types/common';

interface SceneProperties {
  onResize?: (size: WindowSize) => void;
  onTick?: (elapsedMs: number) => void;
}

export type Scene = SceneProperties & Container;

const createScene = ({ onResize, onTick }: SceneProperties): Scene => {
  const scene = new Container() as Scene;
  scene.onResize = onResize;
  scene.onTick = onTick;
  return scene;
};

export { createScene };
