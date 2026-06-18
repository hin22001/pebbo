/**
 * BackgroundMusicManager - Centralized background music controller
 *
 * Handles:
 * - Popup intro music
 * - Welcome theme (plays once after popup)
 * - Exercise loop (route-aware)
 * - Audio ducking when trigger sounds play
 */

class BackgroundMusicManager {
  constructor() {
    this.bgAudio = null;
    this.currentTrack = null; // 'intro', 'welcome', 'exercise', 'library'

    this.currentRoute = "";
    this.isDucked = false;

    this.normalVolume = 0.5;
    this.duckedVolume = 0.15;
    this.duckFadeDuration = 300; // ms

    // Track paths
    this.tracks = {
      intro: "/sounds/Popup_Scene_1_Pebbo_Intro.mp3",
      welcome: "/sounds/Theme_Login_Welcome_to_Pebbo.mp3",
      exercise: "/sounds/Theme_Exercise_First_Pebbo_Quest.mp3",
      libraryIntro: "/sounds/Popup_Scene_2_Pebbo_Library_Intro.mp3",
      libraryTheme: "/sounds/Theme_Lib_Reading_at_Pebbo.mp3",
    };

    // Background music uses its own mute flag: pebbo_bg_music_muted
    // Only controls Theme_* files. "soundEnabled" is independent (controls SFX).
    this.muted =
      typeof window !== "undefined" &&
      localStorage.getItem("pebbo_bg_music_muted") === "true";
    this.enabled = !this.muted;

    // Role/route-level kill switch. Independent from the user-facing `muted`
    // flag so suppressing music for teachers never writes to (and never
    // overwrites a student's) localStorage preference.
    this.suppressed = false;

    if (typeof window !== "undefined") {
      // Listen for background music-specific mute changes
      window.addEventListener("pebbo_bg_music_mute_changed", (event) => {
        const nextMuted = Boolean(event?.detail?.muted);
        this.setMuted(nextMuted);
      });
      window.addEventListener("storage", (event) => {
        if (event.key === "pebbo_bg_music_muted") {
          this.setMuted(event.newValue === "true");
        }
      });
    }
  }

  _initAudio() {
    if (this.bgAudio || typeof window === "undefined") return;

    this.bgAudio = new Audio();
    this.bgAudio.volume = this.normalVolume;

    // Transition handling for non-looping tracks (like welcome)
    this.bgAudio.addEventListener("ended", () => {
      if (this.currentTrack === "welcome") {
        this.currentTrack = null;
        this._handleAutoTransition();
      }
    });
  }

  _playTrack(type) {
    if (this.muted || !this.enabled || this.suppressed) return;
    this._initAudio();

    // Select track based on route for special types
    let targetSrc = this.tracks[type];
    if (type === "intro") {
      const isLibrary = this.currentRoute.includes("/math-library");
      targetSrc = isLibrary ? this.tracks.libraryIntro : this.tracks.intro;
    }

    // Don't restart if already playing the same track
    if (
      this.currentTrack === type &&
      !this.bgAudio.paused &&
      this.bgAudio.src.includes(targetSrc)
    ) {
      return;
    }

    // Pause current strictly
    this.bgAudio.pause();

    // Configure and play
    this.bgAudio.src = targetSrc;
    this.bgAudio.loop = type !== "welcome";
    this.bgAudio.currentTime = 0;
    this.bgAudio.volume = this.isDucked ? this.duckedVolume : this.normalVolume;

    this.currentTrack = type;
    this.bgAudio.play().catch((e) => {
      console.warn(`[BackgroundMusicManager] ${type} play blocked:`, e);
      this.currentTrack = null;
    });
  }

  _handleAutoTransition() {
    // After welcome ends, start the appropriate loop for the route
    if (this.currentRoute.includes("/exercise")) {
      this.playExerciseLoop();
    } else if (this.currentRoute.includes("/math-library")) {
      this.playLibraryLoop();
    }
  }

  // ============ PUBLIC API ============

  playIntro() {
    this._playTrack("intro");
  }

  stopIntro(playWelcomeAfter = true) {
    if (this.currentTrack === "intro") {
      this.stopAll();
      if (playWelcomeAfter) {
        if (this.currentRoute.includes("/math-library")) {
          this.playLibraryLoop();
        } else {
          this.playWelcome();
        }
      }
    }
  }

  playWelcome() {
    // If we're already on exercise/library page, skip welcome and go straight to loop
    if (
      this.currentRoute.includes("/exercise") ||
      this.currentRoute.includes("/math-library")
    ) {
      if (this.currentRoute.includes("/exercise")) this.playExerciseLoop();
      if (this.currentRoute.includes("/math-library")) this.playLibraryLoop();
      return;
    }
    this._playTrack("welcome");
  }

  stopWelcome() {
    if (this.currentTrack === "welcome") {
      this.stopAll();
    }
  }

  playExerciseLoop() {
    this._playTrack("exercise");
  }

  stopExerciseLoop() {
    if (this.currentTrack === "exercise") {
      this.stopAll();
    }
  }

  playLibraryLoop() {
    this._playTrack("libraryTheme");
  }

  stopLibraryLoop() {
    if (this.currentTrack === "libraryTheme") {
      this.stopAll();
    }
  }

  // ============ ROUTE MANAGEMENT ============
  setCurrentRoute(pathname) {
    const prevRoute = this.currentRoute;
    this.currentRoute = pathname;

    const isExercisePage = pathname.includes("/exercise");
    const wasExercisePage = prevRoute.includes("/exercise");

    const isLibraryPage = pathname.includes("/math-library");
    const wasLibraryPage = prevRoute.includes("/math-library");

    // Entering exercise page
    if (isExercisePage && !wasExercisePage) {
      // Only start if not playing intro (popup) or welcome
      if (this.currentTrack !== "intro" && this.currentTrack !== "welcome") {
        this.playExerciseLoop();
      }
    }
    // Leaving exercise page
    if (!isExercisePage && wasExercisePage) {
      this.stopExerciseLoop();
    }

    // Entering library page
    if (isLibraryPage && !wasLibraryPage) {
      if (this.currentTrack !== "intro" && this.currentTrack !== "welcome") {
        this.playLibraryLoop();
      }
    }
    // Leaving library page
    if (!isLibraryPage && wasLibraryPage) {
      this.stopLibraryLoop();
    }
  }

  // ============ AUDIO DUCKING ============
  duck() {
    if (this.isDucked) return;
    this.isDucked = true;
    this._fadeToVolume(this.duckedVolume, this.duckFadeDuration);
  }

  unduck() {
    if (!this.isDucked) return;
    this.isDucked = false;
    this._fadeToVolume(this.normalVolume, this.duckFadeDuration);
  }

  _fadeToVolume(targetVolume, duration) {
    if (!this.bgAudio || this.bgAudio.paused) return;

    const steps = 10;
    const stepDuration = duration / steps;
    const startVolume = this.bgAudio.volume;
    const volumeDiff = targetVolume - startVolume;
    let step = 0;

    const fadeStep = () => {
      step++;
      if (this.bgAudio) {
        this.bgAudio.volume = Math.max(
          0,
          Math.min(1, startVolume + (volumeDiff * step) / steps),
        );
      }
      if (step < steps) {
        setTimeout(fadeStep, stepDuration);
      }
    };

    fadeStep();
  }

  // ============ CONTROLS ============
  // Hard kill switch driven by role/route (e.g. the teacher portal has no
  // background music). Stops any current track and blocks future plays, but
  // does NOT persist to localStorage — it leaves the user's own mute choice
  // untouched. Idempotent; call with the current condition every mount.
  setSuppressed(suppressed) {
    this.suppressed = Boolean(suppressed);
    if (this.suppressed) {
      this.stopAll();
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.muted = !enabled;
    if (!enabled) {
      this.stopAll();
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("pebbo_bg_music_muted", (!enabled).toString());
      // NOTE: Only controls Theme_* background music. Does NOT touch "soundEnabled"
      // so short SFX (submit sounds, coin sounds, etc.) keep playing.
      // If needed in future, also set "soundEnabled" here to mute all audio.
    }
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    this.enabled = !this.muted;
    if (this.muted) {
      this.stopAll();
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("pebbo_bg_music_muted", this.muted.toString());
      // NOTE: Only controls Theme_* background music. Does NOT touch "soundEnabled"
      // so short SFX (submit sounds, coin sounds, etc.) keep playing.
      // If needed in future, also set "soundEnabled" here to mute all audio.
    }
  }

  stopAll() {
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.currentTime = 0;
    }
    this.currentTrack = null;
  }
}

// Global singleton instance
const backgroundMusicManager =
  typeof window !== "undefined" ? new BackgroundMusicManager() : null;

export default backgroundMusicManager;
