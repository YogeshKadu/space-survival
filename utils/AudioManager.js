export const audios = {
  lastHeart: "lastHeart",
  hit: "hit",
  endgame: "endgame",
  background: "background"
};

export class AudioManager {
  constructor() {
    this.sounds = {
      lastHeart: new Audio(
        "./assets/sounds/lastHeart/run-vine-sound-effect.mp3",
      ),
      hit: new Audio("./assets/sounds/hit/punch_u4LmMsr.mp3"),
      endgame: new Audio(
        "./assets/sounds/endgame/meme-de-creditos-finales.mp3",
      ),
      background: new Audio("./assets/music/the_mountain-retro-143303.mp3")
    };

    Object.values(this.sounds).forEach((audio) => {
      audio.preload = "auto";
      audio.load();
    });

    this.currentAudio = null;
    this.activeSounds = [];
    this.mute = false;
    this.masterVolume = 1;
  }
  #randomKey(length = 8) {
    return crypto.randomUUID().replaceAll("-", "").slice(0, length);
  }
  #removeFromActiveSounds(key){
    this.activeSounds = this.activeSounds.filter(item => item.key !== key);
  }
  play(name, options = {}){
    if(this.mute) return;

    const { loop =false, isStandalone= false } = options;
    const original = this.sounds[name];
    if(!original) { 
      console.warn(`Invalid audio name passed - ${name} - ${Object.keys(this.sounds)}`);
      return;
    }
    if(isStandalone) {
      console.log(isStandalone , this.activeSounds);
      const oldStandalones = this.activeSounds.filter((item) => item.isStandalone === isStandalone);
      oldStandalones.forEach((item) => {
        const { audio } = item;
        audio.pause();
        audio.currentTime = 0;
      });
      this.activeSounds = this.activeSounds.filter((item) => item.isStandalone !== isStandalone);
    }
    const key = this.#randomKey();
    const audio = original.cloneNode();
    audio.loop = loop;
    audio.volume = this.masterVolume;

    const item = {key, name, audio, isStandalone};
    this.activeSounds.push(item);

    audio.play().catch(() => {
      this.#removeFromActiveSounds(key);
    });
    audio.addEventListener("ended",() => this.#removeFromActiveSounds(key));
    return item;
  }

  stopAudio({key, name} = {}) {
    if(!key && !name) {
      console.warn(`stopAudio() - key and name are not passed !`);
      return;
    }
    const item = this.activeSounds.find(item => item.key === key);

    if (!item) return;

    const { audio } = item;

    audio.pause();
    audio.currentTime = 0;

    this.#removeFromActiveSounds(key);
  }
  stopAllAudios() {
    this.activeSounds.forEach((item) => {
        const { key, audio } = item;
        audio.pause();
        audio.currentTime = 0;
    });
    this.activeSounds = [];
  }

  // Controlled
  _play(name) {
    const source = this.sounds[name];
    if (!source) return;
    if(!source.paused) {
      source.pause();
      source.currentTime = 0;
    }
    source.volume = this.mute ? 0 : 1;
    source.play().catch((error) => {
      console.error("Error playing ", name, "\n",error);
    });
  }

  muteAudio() {
    console.log(this.activeSounds);
    this.setMasterVolume(0);
    console.log(`muteAudio(0)`);
  }
  unmuteAudio () {
    console.log(`unmuteAudio(1)`);
    this.setMasterVolume(1);

  }
  setVolume(key, volume) {
    const filterVolume = Math.max(0, Math.min(volume, 1));
    const item = this.activeSounds.find(item => item.key === key);
    if(!item) {
      console.warn(`Invalid audio key passed - ${key}`);
      return;
    }
    item.audio.volume = filterVolume;
  }
  setMasterVolume(value) {
    this.masterVolume = Math.max(0, Math.min(value, 1));
    this.mute = this.masterVolume === 0 ? true : false;
    this.activeSounds.forEach((item) => {
      item.audio.volume = this.masterVolume;
    });
  }
  get isMute() {return this.mute;}
}
