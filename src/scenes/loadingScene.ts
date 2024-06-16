import { Graphics } from 'pixi.js';
import { createScene } from '../core/scene';
import { WindowSize } from '../types/common';

const createLoadingScene = () => {
  const loadingScene = createScene();
  const background = new Graphics()
    .rect(0, 0, window.innerWidth, window.innerHeight)
    .fill({ color: '#2b2b2b' });

  loadingScene.onResize = (size: WindowSize) => {
    background.clear().rect(0, 0, size.width, size.height).fill({ color: '#2b2b2b' });
  };

  loadingScene.addChild(background);

  return loadingScene;
};

export { createLoadingScene };
