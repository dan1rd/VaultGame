import { Container, Sprite } from 'pixi.js';
import { createScene } from '../core/Scene';
import {
  scaleSprites,
  centerSprites,
  setPivotToCenter,
  centerContainer,
  getSceneScale,
} from '../utils/layout';
import { Text } from 'pixi.js';

interface Group {
  container: Container;
}

type ClosedDoorGroup = Group & {
  onLeftSideClick: () => void;
  onRightSideClick: () => void;
};

type OpenDoorGroup = Group;

type ShineGroup = Group & {
  playShineAnimation: () => void;
};

type HandleGroup = Group & {
  setAngle: (angle: number) => void;
};

type KeypadGroup = Group & {
  setTimer: (ms: number) => void;
};

const createVaultScene = () => {
  const vaultScene = createScene();
  vaultScene.label = 'Vault Scene';

  function initialize() {
    const background = Sprite.from('bg.webp');
    vaultScene.addChild(background);

    const sceneScale = getSceneScale(
      { width: window.innerWidth, height: window.innerHeight },
      background.texture.width,
      background.texture.height
    );

    scaleSprites([background], sceneScale);
    setPivotToCenter([vaultScene]);
    centerContainer([vaultScene], window.innerWidth, window.innerHeight);

    const { container: closedDoorGroup } = createClosedDoorGroup({
      parentContainer: vaultScene,
      sceneScale,
    });

    const { container: openDoorGroup } = createOpenDoorGroup({
      parentContainer: vaultScene,
      sceneScale,
    });
    openDoorGroup.x += closedDoorGroup.width - openDoorGroup.width / 2 + 150 * sceneScale;
    openDoorGroup.visible = false;

    const { setAngle } = createHandleGroup({
      parentContainer: closedDoorGroup,
      sceneScale,
    });

    const { setTimer } = createKeypadGroup({
      parentContainer: vaultScene,
      sceneScale,
    });

    const { playShineAnimation } = createShineGroup({
      parentContainer: vaultScene,
      sceneScale,
    });

    toggleDoor();
    setTimer(0);
    playShineAnimation();

    function toggleDoor() {
      closedDoorGroup.visible = !closedDoorGroup.visible;
      openDoorGroup.visible = !closedDoorGroup.visible;
    }

    vaultScene.onTick = (elapsedMS) => {};

    vaultScene.onResize = (size) => {
      const scale = getSceneScale(
        { width: size.width, height: size.height },
        background.width,
        background.height
      );

      centerContainer([vaultScene], size.width, size.height);
      vaultScene.scale.set(scale);
    };
  }

  initialize();
  return vaultScene;
};

interface GroupOptions {
  parentContainer: Container;
  sceneScale: number;
}

function createShineGroup(options: GroupOptions): ShineGroup {
  const { sceneScale, parentContainer } = options;

  const container = new Container();
  container.label = 'Shine Container';

  const blinkCount = 3;
  const blinks: Sprite[] = [];
  for (let i = 0; i < blinkCount; i++) {
    const blink = Sprite.from('blink.webp');
    blink.anchor.set(0.5);
    blinks.push(blink);
  }

  setPivotToCenter([container]);
  centerContainer([container], parentContainer.width, parentContainer.height);

  blinks.forEach((blink) => container.addChild(blink));
  scaleSprites(blinks, sceneScale);

  blinks[0].x += -500 * sceneScale;
  blinks[1].x += -75 * sceneScale;
  blinks[2].x += 150 * sceneScale;
  blinks[2].y += 350 * sceneScale;

  parentContainer.addChild(container);

  const playShineAnimation = () => {};

  return { container, playShineAnimation };
}

function createOpenDoorGroup(options: GroupOptions): OpenDoorGroup {
  const { sceneScale, parentContainer } = options;

  const container = new Container();
  container.label = 'Open Door Container';

  const door = Sprite.from('doorOpen.webp');
  const doorShadow = Sprite.from('doorOpenShadow.webp');
  container.addChild(doorShadow, door);

  scaleSprites([door, doorShadow], sceneScale);
  doorShadow.y += 75 * sceneScale;

  setPivotToCenter([container]);
  centerContainer([container], parentContainer.width, parentContainer.height);

  parentContainer.addChild(container);

  return { container };
}

function createClosedDoorGroup(options: GroupOptions): ClosedDoorGroup {
  const { sceneScale, parentContainer } = options;

  const container = new Container();
  container.label = 'Closed Door Container';

  const door = Sprite.from('door.webp');
  container.addChild(door);

  scaleSprites([door], sceneScale);
  setPivotToCenter([container]);
  centerContainer([container], parentContainer.width, parentContainer.height);
  container.x += 50 * sceneScale;

  parentContainer.addChild(container);

  const onLeftSideClick = () => {};
  const onRightSideClick = () => {};

  return { container, onLeftSideClick, onRightSideClick };
}

function createHandleGroup(options: GroupOptions): HandleGroup {
  const { sceneScale, parentContainer } = options;

  const container = new Container();
  container.label = 'Handle Container';

  const handle = Sprite.from('handle.webp');
  const handleShadow = Sprite.from('handleShadow.webp');

  centerSprites([handle, handleShadow], container.width, container.height);
  scaleSprites([handle, handleShadow], sceneScale);
  handleShadow.y += 20 * sceneScale;

  setPivotToCenter([container]);
  centerContainer([container], parentContainer.width, parentContainer.height);
  container.x -= 85 * sceneScale;

  container.addChild(handleShadow);
  container.addChild(handle);
  parentContainer.addChild(container);

  function setAngle(angle: number) {
    container.angle = angle;
    console.log(angle);
  }

  return { container, setAngle };
}

function createKeypadGroup(options: GroupOptions): KeypadGroup {
  const { sceneScale, parentContainer } = options;

  const container = new Container();
  container.label = 'Keypad Container';

  const keypad = Sprite.from('keypad.svg');
  centerSprites([keypad], container.width, container.height);
  scaleSprites([keypad], sceneScale * 0.8);
  keypad.y -= 30 * sceneScale;

  setPivotToCenter([container]);
  centerContainer([container], parentContainer.width, parentContainer.height);

  container.x -= 1175 * sceneScale;

  container.addChild(keypad);
  parentContainer.addChild(container);

  const elapsedTime = new Text({
    text: '0:00',
    style: { fill: '#ffffff', fontSize: 80 * sceneScale },
  });

  elapsedTime.anchor.set(0.5);
  elapsedTime.y = -160 * sceneScale;
  container.addChild(elapsedTime);

  function setTimer(ms: number) {
    elapsedTime.text = ms.toFixed(2).replace('.', ':');
  }

  return { container, setTimer };
}

export { createVaultScene };
