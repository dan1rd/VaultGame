import { Sprite } from 'pixi.js';
import { createScene } from '../core/Scene';

const createVaultScene = () => {
  const vaultScene = createScene({ onTick });
  let currentMS = 0;
  let isOpened = false;

  initialize();

  function onTick(elapsedMS: number) {
    if (!isOpened) {
      currentMS += elapsedMS;
    }

    // console.log(currentMS);
  }

  function win() {
    isOpened = true;
  }

  function initialize() {
    currentMS = 0;
    const sprite = Sprite.from('bg');
    sprite.x = window.innerWidth / 2;
    sprite.y = window.innerHeight / 2;
    sprite.anchor.set(0.5);
    vaultScene.addChild(sprite);
    setTimeout(() => {
      win();
    }, 2000);
    // todo
  }

  return vaultScene;
};

export { createVaultScene };
