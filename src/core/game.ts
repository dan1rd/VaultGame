import { Application } from 'pixi.js';
import { Scene } from './scene';

interface GameState {
  currentScene: Scene | null;
}

interface Game {
  app: Application;
  state: GameState;
  setScene: (newScene: Scene | null) => void;
}

const createGame = async (): Promise<Game> => {
  const app = new Application();
  await app.init({
    canvas: document.querySelector('#game') as HTMLCanvasElement,
    autoDensity: true,
    resizeTo: window,
    powerPreference: 'high-performance',
    background: '#122122',
  });

  // @ts-ignore
  globalThis.__PIXI_APP__ = app;

  let state: GameState = { currentScene: null };

  app.ticker.add(() => {
    state.currentScene?.onTick?.(app.ticker.elapsedMS);
  });

  const setScene = (newScene: Scene | null) => {
    if (state.currentScene) {
      app.stage.removeChild(state.currentScene);
    }

    if (newScene) {
      app.stage.addChild(newScene);
    }

    state.currentScene = newScene;
  };

  window.addEventListener('resize', (event: UIEvent) => {
    const { innerWidth, innerHeight } = event.target as Window;
    state.currentScene?.onResize?.({ width: innerWidth, height: innerHeight });
  });

  return { app, state, setScene };
};

export { createGame };
