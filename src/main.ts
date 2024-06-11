import './style.css';
import { Application } from 'pixi.js';

const initApplication = async () => {
  const app = new Application();
  await app.init({
    canvas: document.querySelector('#game') as HTMLCanvasElement,
    autoDensity: true,
    resizeTo: window,
    powerPreference: 'high-performance',
  });
};

await initApplication();
