import { Container, Graphics, Sprite } from 'pixi.js';
import { createScene } from '../core/scene';
import {
  scaleSprites,
  centerSprites,
  setPivotToCenter,
  centerContainer,
  getScale,
} from '../utils/layout';
import { wait } from '../utils/common';
import { Text } from 'pixi.js';
import { MotionBlurFilter, GodrayFilter } from 'pixi-filters';
import { createAudioCollection } from '../core/audio';
import gsap from 'gsap';

type VaultCombination = [number, 1 | -1][];
interface VaultSceneState {
  unlockCombination: VaultCombination;
  timer: {
    isRunning: boolean;
    totalElapsedMS: number;
  };
  playerInput: {
    currentPair: number;
    currentSpins: number;
  };
  door: {
    isLocked: boolean;
    handleAngle: number;
  };
}

interface GroupOptions {
  parentContainer: Container;
  scaleFactor: number;
}

interface Group {
  container: Container;
}

type ClosedDoorGroup = Group & {
  disableButtons: () => void;
  enableButtons: () => void;
};

type ShineGroup = Group & {
  playShineAnimation: () => void;
};

type HandleGroup = Group & {
  spinHandle: ({
    spins,
    duration,
    onComplete,
  }: {
    spins: number;
    duration?: number;
    onComplete?: () => void;
  }) => void;
};

type KeypadGroup = Group & {
  setTimerLabel: (ms: number) => void;
};

const createVaultScene = () => {
  let state = initializeVaultSceneState();

  const sounds = createAudioCollection([
    'animeWowMeme.ogg',
    'bg.ogg',
    'incorrectCode.ogg',
    'spinMultiple.ogg',
    'spinOnce.ogg',
    'vault.ogg',
    'win.ogg',
  ]);
  sounds.setVolume('bg.ogg', 0.35);
  sounds.play('bg.ogg', true);

  const godrayFilter = new GodrayFilter({
    alpha: 0,
    gain: 0.6,
    lacunarity: 2,
    parallel: false,
  });

  const vaultScene = createScene();
  vaultScene.label = 'Vault Scene';

  function start() {
    state.timer.isRunning = true;
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

    const {
      container: closedDoorGroup,
      disableButtons,
      enableButtons,
    } = createClosedDoorGroup({
      parentContainer: vaultScene,
      scaleFactor,
      onRightClick: () => {
        registerSpin(1);
      },
      onLeftClick: () => {
        registerSpin(-1);
      },
    });

    const { container: openDoorGroup } = createOpenDoorGroup({
      parentContainer: vaultScene,
      scaleFactor,
    });
    openDoorGroup.x += closedDoorGroup.width - openDoorGroup.width / 2 + 150 * scaleFactor;
    openDoorGroup.visible = false;

    const { container: handleGroup, spinHandle } = createHandleGroup({
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

    function playLightRaysAnimation() {
      vaultScene.filters = [godrayFilter];
      gsap.to(godrayFilter, {
        alpha: 1,
        yoyo: true,
        repeat: 1,
        duration: 2.5,
        onComplete: () => {
          vaultScene.filters = [];
        },
      });
    }

    function registerSpin(direction: 1 | -1) {
      const [spinsRequired, correctDirection] =
        state.unlockCombination[state.playerInput.currentPair];

      if (direction !== correctDirection) {
        sounds.play('incorrectCode.ogg');

        state.unlockCombination = generateCombination();
        state.playerInput = getInitialPlayerInput();
        resetTimer();
        disableButtons();

        spinHandle({
          spins: 60,
          duration: 2,
          onComplete: () => {
            enableButtons();
            state.timer.isRunning = true;
          },
        });

        return;
      }

      state.playerInput.currentSpins++;
      if (state.playerInput.currentSpins !== spinsRequired) {
        spinHandle({ spins: direction });

        return;
      }

      if (state.playerInput.currentPair === state.unlockCombination.length - 1) {
        disableButtons();
        spinHandle({ spins: direction, onComplete: winGame });
      } else {
        spinHandle({ spins: direction });
        state.playerInput.currentSpins = 0;
        state.playerInput.currentPair++;
      }
    }

    function setDoorLockState(isLocked: boolean) {
      sounds.play('vault.ogg');

      state.door.isLocked = isLocked;

      closedDoorGroup.visible = state.door.isLocked;
      openDoorGroup.visible = !state.door.isLocked;
    }

    function winGame() {
      sounds.pause('bg.ogg');
      sounds.play('win.ogg');
      sounds.play('animeWowMeme.ogg');
      playLightRaysAnimation();

      state.timer.isRunning = false;
      setDoorLockState(false);
      playShineAnimation();
      wait(5).then(startNewGame);
    }

    function startNewGame() {
      sounds.resume('bg.ogg');

      setDoorLockState(true);
      state = initializeVaultSceneState();
      handleGroup.angle = state.door.handleAngle;
      resetTimer();

      spinHandle({
        spins: 60,
        duration: 2,
        onComplete: () => {
          enableButtons();
          state.timer.isRunning = true;
        },
      });
    }

    function resetTimer() {
      state.timer = getInitialTimer();
      setTimerLabel(state.timer.totalElapsedMS);
    }

    vaultScene.onTick = (elapsedMS) => {
      if (state.timer.isRunning) {
        state.timer.totalElapsedMS += elapsedMS;
        setTimerLabel(Math.min(state.timer.totalElapsedMS, 99990));
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

    const playShineAnimation = () => {
      const stagger = 0.2;

      gsap.to(blinks, {
        duration: 2,
        angle: '+=60',
        ease: 'power2.out',
        stagger,
      });

      gsap.to(blinks, {
        duration: 2.25,
        alpha: 1,
        yoyo: true,
        repeat: 1,
        stagger,
      });
    };

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
  ): ClosedDoorGroup {
    const { scaleFactor, parentContainer, onRightClick, onLeftClick } = options;

    const container = new Container();
    container.label = 'Closed Door Container';

    const door = Sprite.from('door.webp');
    container.addChild(door);

    scaleSprites([door], scaleFactor);
    setPivotToCenter([container]);
    centerContainer([container], parentContainer.width, parentContainer.height);
    container.x += 50 * scaleFactor;
    container.y -= 30 * scaleFactor;

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

    const doorLeftButton = createButton(onLeftClick);
    const doorRightButton = createButton(onRightClick);
    doorRightButton.x += doorLeftButton.width + 50 * scaleFactor;

    container.addChild(doorLeftButton);
    container.addChild(doorRightButton);

    function disableButtons() {
      doorLeftButton.interactive = false;
      doorRightButton.interactive = false;
      doorLeftButton.cursor = 'default';
      doorRightButton.cursor = 'default';
    }

    function enableButtons() {
      doorLeftButton.interactive = true;
      doorRightButton.interactive = true;
      doorLeftButton.cursor = 'pointer';
      doorRightButton.cursor = 'pointer';
    }

    return { container, disableButtons, enableButtons };
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

    function spinHandle({
      spins,
      duration = 0.5,
      onComplete = () => {},
    }: {
      spins: number;
      duration?: number;
      onComplete?: () => void;
    }) {
      if (duration >= 1.5) {
        sounds.play('spinMultiple.ogg');
      } else {
        sounds.play('spinOnce.ogg');
      }

      state.door.handleAngle += spins * 60;

      const timeline = gsap.timeline();
      timeline.to(container, {
        angle: state.door.handleAngle,
        onUpdate: function () {
          motionBlurFilter.velocityX = Math.min(
            Math.abs(spins) * Math.max(duration - this.time() - 0.5, 0),
            20
          );

          const currentRadians = (container.angle * Math.PI) / 180;
          handleShadow.y = Math.cos(currentRadians) * shadowOffset;
          handleShadow.x = Math.sin(currentRadians) * shadowOffset;
        },
        ease: 'power3.out',
        onComplete,
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
      resolution: 2,
      style: { fill: '#ffffff', fontSize: 72 * scaleFactor },
    });

    elapsedTimeLabel.anchor.set(0.5);
    elapsedTimeLabel.y = -160 * scaleFactor;
    container.addChild(elapsedTimeLabel);

    function setTimerLabel(ms: number) {
      elapsedTimeLabel.text = (ms / 1000).toFixed(2).replace('.', ':');
    }

    return { container, setTimerLabel };
  }

  start();
  return vaultScene;
};

function initializeVaultSceneState(): VaultSceneState {
  return {
    unlockCombination: generateCombination(),
    timer: getInitialTimer(),
    playerInput: getInitialPlayerInput(),
    door: {
      isLocked: true,
      handleAngle: 0,
    },
  };
}

function getInitialTimer() {
  return { isRunning: false, totalElapsedMS: 0 };
}

function getInitialPlayerInput() {
  return { currentPair: 0, currentSpins: 0 };
}

function generateCombination() {
  const getRandomNumber = () => Math.floor(Math.random() * 9 + 1);
  const combination: VaultCombination = [
    [getRandomNumber(), 1],
    [getRandomNumber(), -1],
    [getRandomNumber(), 1],
  ];

  console.log(`
${combination[0][0]} Clockwise
${combination[1][0]} Counterclockwise
${combination[2][0]} Clockwise
  `);

  return combination;
}

export { createVaultScene };
