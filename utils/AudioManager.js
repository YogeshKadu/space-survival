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
    this.mute = false;
  }

  playReplacing(name) {
    const source = this.sounds[name];
    // if (!source || this.mute) return;
    if (!source) return;

    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    const audio = source.cloneNode();
    this.currentAudio = audio;
    this.currentAudio.volume = this.mute ? 0 : 1;

    audio.play().catch((error) => {
      console.warn("Audio playback failed:", error);
    });
  }
  // Controlled
  play(name) {
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
  // uncontrolled - best for shooting
  playAsync(name) {
    const source = this.sounds[name];
    // if (!source || this.mute) return;
    if (!source) return;

    // A fresh element lets this call finish independently of other calls.
    const audio = source.cloneNode();
    audio.volume = this.mute ? 0 : 1;

    audio.play().catch((error) => {
      console.warn("Audio playback failed:", error);
    });
  }
  stop(name) {
    // if(!this.sounds[name].pause) {
      this.sounds[name].pause();
      this.sounds[name].currentTime = 0;
    // }
  }
  muteAudio() {
    this.mute = true;
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.volume = 0;
    }
    // Extras
    Object.values(this.sounds).map((audio) =>audio.volume = 0)
  }
  unmuteAudio () {
    this.mute = false;
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.volume = 1;
    }
    // Extras
    Object.values(this.sounds).map((audio) =>audio.volume = 0.5)
  }
  // muteBackground() { this.sounds.background.volume = 0;}
  // unmuteBackground() { this.sounds.background.volume = 1;}
  setVolume(name, volume) {
    // this.sounds[name].volume = volume;
    this.setArrtibute(name,"volume",volume);
  }
  setArrtibute(name, key,value) {
    this.sounds[name][key] = value;
  }
  get isMute() {return this.mute;}
}
