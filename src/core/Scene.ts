import { Container } from 'pixi.js';
import { WindowSize } from '../types/common';

interface SceneProperties {
  onResize?: (size: WindowSize) => void;
  onTick?: (elapsedMS: number) => void;
}

export type Scene = SceneProperties & Container;

const createScene = () => new Container() as Scene;

export { createScene };
