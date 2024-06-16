import { Sound } from '@pixi/sound';
import { Assets } from 'pixi.js';

function createAudioCollection(sounds: string[]) {
  const collection = sounds.map((sound) => {
    const soundAsset = Assets.get(sound);
    if (!soundAsset) return null;

    return { alias: sound, sound: Sound.from(soundAsset.url) };
  });

  function play(soundAlias: string, loop?: boolean) {
    const soundInstance = getInstance(soundAlias);
    if (!soundInstance) return;

    soundInstance.sound.play({ loop });
  }

  function pause(soundAlias: string) {
    const soundInstance = getInstance(soundAlias);
    if (!soundInstance) return;
    if (!soundInstance.sound.isPlaying) return;

    soundInstance?.sound.pause();
  }

  function resume(soundAlias: string) {
    const soundInstance = getInstance(soundAlias);
    if (!soundInstance) return;
    if (soundInstance.sound.isPlaying) return;

    soundInstance?.sound.resume();
  }

  function setVolume(soundAlias: string, volume: number) {
    const soundInstance = getInstance(soundAlias);
    if (!soundInstance) return;

    soundInstance.sound.volume = volume;
  }

  function getInstance(soundAlias: string) {
    return collection.find((sound) => soundAlias === sound?.alias) ?? null;
  }

  return { play, pause, resume, setVolume };
}

export { createAudioCollection };
