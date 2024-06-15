import { Container, Sprite } from 'pixi.js';
import { WindowSize } from '../types/common';

const getScale = (size: WindowSize, bgWidth: number, bgHeight: number) => {
  const contain = Math.min(size.width / bgWidth, size.height / bgHeight);
  const cover = Math.max(size.width / bgWidth, size.height / bgHeight);

  const ratio = size.width / size.height;
  if (ratio <= 1 || ratio >= 2.5) {
    return contain * 1.5;
  }

  return cover;
};

const centerSprites = (sprites: Sprite[], parentWidth: number, parentHeight: number) => {
  sprites.forEach((sprite) => {
    sprite.anchor.set(0.5);
    sprite.x = parentWidth / 2;
    sprite.y = parentHeight / 2;
  });
};

const scaleSprites = (sprites: Sprite[], scalar: number) => {
  sprites.forEach((sprite) => {
    sprite.width = sprite.texture.width * scalar;
    sprite.height = sprite.texture.height * scalar;
  });
};

const setPivotToCenter = (containers: Container[]) => {
  containers.forEach((container) => {
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;
  });
};

const centerContainer = (containers: Container[], parentWidth: number, parentHeight: number) => {
  containers.forEach((container) => {
    container.x = parentWidth / 2;
    container.y = parentHeight / 2;
  });
};

export { getScale, centerSprites, scaleSprites, setPivotToCenter, centerContainer };
