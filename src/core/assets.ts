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
  const fileSources = Object.keys(import.meta.glob('/public/**/*.*'));

  fileSources.forEach((src) => {
    const url = src.replace('/public/', '');
    const [bundleName, , assetAlias] = url.split('/');

    let currentBundle = bundles.find((bundle) => bundle.name === bundleName);
    if (!currentBundle) {
      currentBundle = { name: bundleName, assets: [] };
      bundles.push(currentBundle);
    }

    if (currentBundle.assets.findIndex((asset) => asset.alias === assetAlias) === -1) {
      currentBundle.assets.push({ alias: assetAlias, src: url });
    }
  });

  return { bundles };
};

const initAssets = async () => await Assets.init({ manifest: getAssetsManifest() });
const loadSceneAssets = async (bundleName: string) => await Assets.loadBundle(bundleName);

export { initAssets, loadSceneAssets };
