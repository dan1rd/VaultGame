import { Assets } from 'pixi.js';

interface Asset {
  alias: string;
  src: string;
}

interface Bundle {
  name: string;
  assets: Asset[];
}

interface Manifest {
  bundles: Bundle[];
}

const getAssetsManifest = (): Manifest => {
  const bundles: Bundle[] = [];
  const fileSources = Object.keys(import.meta.glob('/public/Assets/**/*.*'));

  fileSources.forEach((src) => {
    const [, , , bundleName, , assetAlias] = src.split('/');

    let currentBundle = bundles.find((bundle) => bundle.name === bundleName);
    if (!currentBundle) {
      currentBundle = { name: bundleName, assets: [] };
      bundles.push(currentBundle);
    }

    if (currentBundle.assets.findIndex((asset) => asset.alias === assetAlias) === -1) {
      currentBundle.assets.push({ alias: assetAlias, src: src.replace('/public/', '') });
    }
  });

  return { bundles };
};

const initAssets = async () => await Assets.init({ manifest: getAssetsManifest() });
const loadSceneAssets = async (bundleName: string) => await Assets.loadBundle(bundleName);

export { initAssets, loadSceneAssets };
