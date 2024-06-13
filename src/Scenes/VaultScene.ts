import { Sprite } from 'pixi.js';
import { createScene } from '../core/Scene';

const createVaultScene = () => {
  const vaultScene = createScene();
  let currentMS = 0;
  let isOpened = false;

  initialize();

  vaultScene.onTick = (elapsedMS) => {
    if (!isOpened) {
      currentMS += elapsedMS;
    }
  };

  function initialize() {
    currentMS = 0;
    const sprite = Sprite.from('bg.webp');
    sprite.x = window.innerWidth / 2;
    sprite.y = window.innerHeight / 2;
    sprite.anchor.set(0.5);
    vaultScene.addChild(sprite);
  }

  return vaultScene;
};

export { createVaultScene };
