import backgroundMusicManager from "./BackgroundMusicManager";

class SoundManager {
  constructor() {
    this.enabled = localStorage.getItem("soundEnabled") !== "false";
    this.sounds = {};
  }

  play(soundName) {
    if (!this.enabled) return;

    if (!this.sounds[soundName]) {
      this.sounds[soundName] = new Audio(`/sounds/${soundName}.mp3`);
    }

    const audio = this.sounds[soundName];

    // Duck background music before playing trigger sound
    if (backgroundMusicManager) {
      backgroundMusicManager.duck();
    }

    // Unduck when sound ends
    audio.onended = () => {
      if (backgroundMusicManager) {
        backgroundMusicManager.unduck();
      }
    };

    audio.currentTime = 0;
    audio.play().catch(() => {
      // If play fails, unduck immediately
      if (backgroundMusicManager) {
        backgroundMusicManager.unduck();
      }
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem("soundEnabled", this.enabled);

    // Also toggle background music
    if (backgroundMusicManager) {
      backgroundMusicManager.setEnabled(this.enabled);
    }
  }
}

// Global instance
if (typeof window !== "undefined") {
  window.soundManager = new SoundManager();
}

export default SoundManager;
