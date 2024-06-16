import './style.css';

import { createGame } from './core/game';
import { initAssets, loadSceneAssets } from './core/assets';

import { createLoadingScene } from './scenes/loadingScene';
import { createVaultScene } from './scenes/vaultScene';

async function main() {
  await initAssets();
  const game = await createGame();

  const loadingScene = createLoadingScene();
  game.setScene(loadingScene);

  await loadSceneAssets('vaultScene');

  const vaultScene = createVaultScene();
  game.setScene(vaultScene);
}

main();
