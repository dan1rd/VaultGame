const getAssetsManifest = () => {
  // TODO: Will figure out if I have some time, hardcoding for now T_T

  return {
    bundles: [
      {
        name: 'vault-scene',
        assets: [
          { alias: 'bg', src: 'Assets/VaultScene/bg.webp' },
          { alias: 'blink', src: 'Assets/VaultScene/blink.webp' },
          { alias: 'door', src: 'Assets/VaultScene/door.webp' },
          { alias: 'doorOpen', src: 'Assets/VaultScene/doorOpen.webp' },
          { alias: 'doorOpenShadow', src: 'Assets/VaultScene/doorOpenShadow.webp' },
          { alias: 'handle', src: 'Assets/VaultScene/handle.webp' },
          { alias: 'handleShadow', src: 'Assets/VaultScene/handleShadow.webp' },
          { alias: 'keypad', src: 'Assets/VaultScene/keypad.svg' },
        ],
      },
    ],
  };
};

export { getAssetsManifest };
