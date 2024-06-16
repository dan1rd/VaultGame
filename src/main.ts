import './style.css';

import { createGame } from './core/Game';
import { initAssets, loadSceneAssets } from './core/Assets';

import { createLoadingScene } from './Scenes/LoadingScene';
import { createVaultScene } from './Scenes/VaultScene';

async function main() {
  await initAssets();
  const game = await createGame();

  const loadingScene = createLoadingScene();
  game.setScene(loadingScene);

  await loadSceneAssets('VaultScene');

  const vaultScene = createVaultScene();
  game.setScene(vaultScene);
}

main();
