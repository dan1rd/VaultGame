import 'pixi.js/text-bitmap';
import './style.css';
import { createLoadingScene } from './Scenes/LoadingScene';
import { createGame } from './core/Game';
import { createVaultScene } from './Scenes/VaultScene';
import { getAssetsManifest } from './core/Assets';
import { Assets } from 'pixi.js';

await Assets.init({ manifest: getAssetsManifest() });
const game = await createGame();

const loadingScene = createLoadingScene();
game.setScene(loadingScene);

await Assets.loadBundle('vault-scene');
const vaultScene = createVaultScene();
game.setScene(vaultScene);
