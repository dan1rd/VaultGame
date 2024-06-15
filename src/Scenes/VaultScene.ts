import { Container, Graphics, Sprite } from 'pixi.js';
import { createScene } from '../core/Scene';
import {
  scaleSprites,
  centerSprites,
  setPivotToCenter,
  centerContainer,
  getScale,
} from '../utils/layout';
import { Text } from 'pixi.js';
import { MotionBlurFilter } from 'pixi-filters';
import gsap from 'gsap';

type VaultCombination = [number, -1 | 1][];
interface VaultSceneState {
  totalElapsedMS: number;
  door: {
    isLocked: boolean;
    handleAngle: number;
    unlockCombination: VaultCombination;
  };
}

interface GroupOptions {
  parentContainer: Container;
  scaleFactor: number;
}

interface Group {
  container: Container;
}

type ShineGroup = Group & {
  playShineAnimation: () => void;
};

type HandleGroup = Group & {
  spinHandle: (spinCount: number, duration?: number) => void;
};

type KeypadGroup = Group & {
  setTimerLabel: (ms: number) => void;
};

const createVaultScene = () => {
  const state = initializeVaultSceneState();

  const vaultScene = createScene();
  vaultScene.label = 'Vault Scene';

  function initialize() {
    const background = Sprite.from('bg.webp');
    vaultScene.addChild(background);

    const scaleFactor = getScale(
      { width: window.innerWidth, height: window.innerHeight },
      background.texture.width,
      background.texture.height
    );

    scaleSprites([background], scaleFactor);
    setPivotToCenter([vaultScene]);
    centerContainer([vaultScene], window.innerWidth, window.innerHeight);

    const { container: closedDoorGroup } = createClosedDoorGroup({
      parentContainer: vaultScene,
      scaleFactor,
      onRightClick: () => {
        spinHandle(1);
      },
      onLeftClick: () => {
        spinHandle(-1);
      },
    });

    const { container: openDoorGroup } = createOpenDoorGroup({
      parentContainer: vaultScene,
      scaleFactor,
    });
    openDoorGroup.x += closedDoorGroup.width - openDoorGroup.width / 2 + 150 * scaleFactor;
    openDoorGroup.visible = false;

    const { spinHandle } = createHandleGroup({
      parentContainer: closedDoorGroup,
      scaleFactor,
    });

    const { container: keypadGroup, setTimerLabel } = createKeypadGroup({
      parentContainer: vaultScene,
      scaleFactor,
    });
    keypadGroup.x -= closedDoorGroup.width / 2 + keypadGroup.width / 2;

    const { playShineAnimation } = createShineGroup({
      parentContainer: vaultScene,
      scaleFactor,
    });

    function toggleDoor() {
      state.door.isLocked = !state.door.isLocked;

      closedDoorGroup.visible = state.door.isLocked;
      openDoorGroup.visible = !state.door.isLocked;
    }

    vaultScene.onTick = (elapsedMS) => {
      if (state.door.isLocked) {
        state.totalElapsedMS += elapsedMS;
        // setTimerLabel(state.totalElapsedMS);
      }
    };

    vaultScene.onResize = (size) => {
      const sceneScale = getScale(
        { width: size.width, height: size.height },
        background.width,
        background.height
      );

      centerContainer([vaultScene], size.width, size.height);
      vaultScene.scale.set(sceneScale);
    };
  }

  function createShineGroup(options: GroupOptions): ShineGroup {
    const { scaleFactor, parentContainer } = options;

    const container = new Container();
    container.label = 'Shine Container';

    const blinkCount = 3;
    const blinks: Sprite[] = [];
    for (let i = 0; i < blinkCount; i++) {
      const blink = Sprite.from('blink.webp');
      blink.alpha = 0;
      blink.anchor.set(0.5);
      blinks.push(blink);
    }

    setPivotToCenter([container]);
    centerContainer([container], parentContainer.width, parentContainer.height);

    blinks.forEach((blink) => container.addChild(blink));
    scaleSprites(blinks, scaleFactor);

    blinks[0].x += -500 * scaleFactor;
    blinks[1].x += -75 * scaleFactor;
    blinks[2].x += 150 * scaleFactor;
    blinks[2].y += 350 * scaleFactor;

    parentContainer.addChild(container);

    const playShineAnimation = () => {};

    return { container, playShineAnimation };
  }

  function createOpenDoorGroup(options: GroupOptions): Group {
    const { scaleFactor, parentContainer } = options;

    const container = new Container();
    container.label = 'Open Door Container';

    const door = Sprite.from('doorOpen.webp');
    const doorShadow = Sprite.from('doorOpenShadow.webp');
    container.addChild(doorShadow, door);

    scaleSprites([door, doorShadow], scaleFactor);
    doorShadow.y += 75 * scaleFactor;

    setPivotToCenter([container]);
    centerContainer([container], parentContainer.width, parentContainer.height);

    parentContainer.addChild(container);

    return { container };
  }

  function createClosedDoorGroup(
    options: GroupOptions & { onRightClick: () => void; onLeftClick: () => void }
  ): Group {
    const { scaleFactor, parentContainer, onRightClick, onLeftClick } = options;

    const container = new Container();
    container.label = 'Closed Door Container';

    const door = Sprite.from('door.webp');
    container.addChild(door);

    scaleSprites([door], scaleFactor);
    setPivotToCenter([container]);
    centerContainer([container], parentContainer.width, parentContainer.height);
    container.x += 50 * scaleFactor;

    parentContainer.addChild(container);

    const createButton = (onClick: () => void) => {
      const button = new Graphics()
        .rect(0, 0, 900 * scaleFactor, container.height)
        .fill({ color: 'black' });

      button.alpha = 0;
      button.interactive = true;
      button.cursor = 'pointer';
      button.onpointertap = onClick;

      return button;
    };

    const rotateLeftButton = createButton(onLeftClick);
    const rotateRightButton = createButton(onRightClick);
    rotateRightButton.x += rotateLeftButton.width + 50 * scaleFactor;

    container.addChild(rotateLeftButton);
    container.addChild(rotateRightButton);

    return { container };
  }

  function createHandleGroup(options: GroupOptions): HandleGroup {
    const { scaleFactor, parentContainer } = options;

    const container = new Container();
    container.label = 'Handle Container';

    const handle = Sprite.from('handle.webp');
    const handleShadow = Sprite.from('handleShadow.webp');

    centerSprites([handle, handleShadow], container.width, container.height);
    scaleSprites([handle, handleShadow], scaleFactor);
    const shadowOffset = 40 * scaleFactor;
    handleShadow.y += shadowOffset;

    setPivotToCenter([container]);
    centerContainer([container], parentContainer.width, parentContainer.height);
    container.x -= 85 * scaleFactor;

    container.addChild(handleShadow);
    container.addChild(handle);
    parentContainer.addChild(container);

    const motionBlurFilter = new MotionBlurFilter();
    container.filters = [motionBlurFilter];

    function spinHandle(spinCount: number = 1, duration: number = 0.75) {
      state.door.handleAngle += spinCount * 60;

      const timeline = gsap.timeline();
      timeline.to(container, {
        angle: state.door.handleAngle,
        onUpdate: function () {
          motionBlurFilter.velocityX = Math.min(spinCount * (duration - this.time()), 20);

          const currentRadians = (container.angle * Math.PI) / 180;
          handleShadow.y = Math.cos(currentRadians) * shadowOffset;
          handleShadow.x = Math.sin(currentRadians) * shadowOffset;
        },
        ease: 'power3.out',
        duration,
      });
    }

    return { container, spinHandle };
  }

  function createKeypadGroup(options: GroupOptions): KeypadGroup {
    const { scaleFactor, parentContainer } = options;

    const container = new Container();
    container.label = 'Keypad Container';

    const keypad = Sprite.from('keypad.svg');
    centerSprites([keypad], container.width, container.height);
    scaleSprites([keypad], scaleFactor * 0.8);
    keypad.y -= 30 * scaleFactor;

    setPivotToCenter([container]);
    centerContainer([container], parentContainer.width, parentContainer.height);

    container.addChild(keypad);
    parentContainer.addChild(container);

    const elapsedTimeLabel = new Text({
      text: '0:00',
      style: { fill: '#ffffff', fontSize: 80 * scaleFactor },
    });

    elapsedTimeLabel.anchor.set(0.5);
    elapsedTimeLabel.y = -160 * scaleFactor;
    container.addChild(elapsedTimeLabel);

    function setTimerLabel(ms: number) {
      elapsedTimeLabel.text = (ms / 1000).toFixed(2).replace('.', ':');
    }

    return { container, setTimerLabel };
  }

  initialize();
  return vaultScene;
};

function initializeVaultSceneState(): VaultSceneState {
  const getCombination = (): VaultCombination => {
    return [
      [4, -1],
      [5, 1],
    ]; // todo
  };

  return {
    totalElapsedMS: 0,
    door: {
      isLocked: true,
      handleAngle: 0,
      unlockCombination: getCombination(),
    },
  };
}

export { createVaultScene };
