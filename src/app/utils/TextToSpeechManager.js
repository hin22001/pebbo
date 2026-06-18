/**
 * TextToSpeechManager - Utility class for managing text-to-speech functionality
 * Uses ElevenLabs API with fallback to Web Speech API
 */
class TextToSpeechManager {
  constructor() {
    // Check if running in browser environment
    this.synthesis =
      typeof window !== "undefined" ? window.speechSynthesis : null;
    this.utterance = null;
    this.audio = null;
    this.currentText = null;
    this.speaking = false;
    this.paused = false;
    this.onStateChange = null; // Callback for state changes
    this.audioUrl = null; // URL for current audio blob
    this.useElevenLabs = true; // Try ElevenLabs first, fallback to Web Speech API
    this.manuallyStopped = false; // Track if user manually stopped audio
    this.muted = this.readMutedFromStorage();

    if (typeof window !== "undefined") {
      // Listen for TTS-specific mute changes
      window.addEventListener("pebbo_tts_mute_changed", (event) => {
        this.setMuted(Boolean(event?.detail?.muted));
      });
      window.addEventListener("storage", (event) => {
        if (event.key === "pebbo_tts_muted") {
          this.setMuted(event.newValue === "true");
        }
      });
    }
  }

  readMutedFromStorage() {
    if (typeof window === "undefined") return false;
    const ttsMutedRaw = localStorage.getItem("pebbo_tts_muted");
    if (ttsMutedRaw != null) return ttsMutedRaw === "true";
    // Fallback: check old mute flag for backward compatibility
    return localStorage.getItem("pebbo_audio_muted") === "true";
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    if (this.muted) {
      this.stop();
    }
    // Persist TTS mute state separately from background music
    if (typeof window !== "undefined") {
      localStorage.setItem("pebbo_tts_muted", this.muted.toString());
    }
  }

  /**
   * Check if the browser supports TTS (either ElevenLabs or Web Speech API)
   * @returns {boolean} True if supported, false otherwise
   */
  isSupported() {
    return (
      typeof window !== "undefined" &&
      (("Audio" in window && this.useElevenLabs) ||
        ("speechSynthesis" in window && this.synthesis !== null))
    );
  }

  /**
   * Get available English voices (for Web Speech API fallback)
   * @returns {Array} Array of English voices
   */
  getEnglishVoices() {
    if (!this.synthesis) return [];

    const voices = this.synthesis.getVoices();
    return voices.filter((voice) => voice.lang.startsWith("en"));
  }

  /**
   * Select the best English voice (prefer female voices for Web Speech API fallback)
   * @returns {SpeechSynthesisVoice|null} Selected voice or null
   */
  selectVoice() {
    const voices = this.getEnglishVoices();

    if (voices.length === 0) return null;

    // Prefer female voices for better quality and warmth
    const femaleVoiceNames = [
      "Samantha", // macOS - Apple's premium voice
      "Victoria", // macOS - High quality, clear
      "Microsoft Zira", // Windows - Microsoft's flagship female voice
      "Google US English Female", // Chrome - Good quality, widely available
      "Microsoft Eva", // Windows - Alternative Microsoft voice
      "Karen", // macOS - Good quality
      "Moira", // macOS - Decent but older
      "Amelie", // Various - Good but less natural
      "Anna", // Various - Standard quality
      "Ellen",
      "Fiona",
      "Kate",
      "Sara",
      "Tessa",
    ];

    // Try to find a female voice
    for (const femaleName of femaleVoiceNames) {
      const femaleVoice = voices.find((voice) =>
        voice.name.toLowerCase().includes(femaleName.toLowerCase()),
      );
      if (femaleVoice) return femaleVoice;
    }

    // Fallback: Try to find any voice with "female" in the name
    const anyFemaleVoice = voices.find((voice) =>
      voice.name.toLowerCase().includes("female"),
    );
    if (anyFemaleVoice) return anyFemaleVoice;

    // Fallback: Prefer US English voices
    const usVoice = voices.find((voice) => voice.lang === "en-US");
    if (usVoice) return usVoice;

    // Last fallback: any English voice
    return voices[0];
  }

  /**
   * Speak the given text using ElevenLabs API with fallback to Web Speech API
   * @param {string} text - The text to speak
   * @param {Object} options - Optional settings (rate, pitch, volume, model_id, onEnd, onError)
   */
  async speak(text, options = {}) {
    if (this.readMutedFromStorage()) {
      this.setMuted(true);
      return;
    }
    this.muted = false;

    if (!this.isSupported()) {
      console.warn("TextToSpeechManager: TTS not supported");
      if (options.onError) options.onError("TTS not supported");
      return;
    }

    if (!text || text.trim() === "") {
      return;
    }

    // Stop any ongoing speech
    this.stop();

    this.currentText = text;
    this.manuallyStopped = false; // Reset manual stop flag

    // Try ElevenLabs API first
    if (
      this.useElevenLabs &&
      typeof window !== "undefined" &&
      "Audio" in window
    ) {
      try {
        // Call ElevenLabs API
        const response = await fetch("/api/tts/elevenlabs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text.trim(),
            model_id: options.model_id || "eleven_flash_v2_5", // Use Flash v2.5 for ultra-low latency
            // Voice settings are pre-configured in ElevenLabs for voice ID
          }),
        });

        if (!response.ok) {
          throw new Error(`TTS API error: ${response.statusText}`);
        }

        // Get audio blob
        const audioBlob = await response.blob();
        this.audioUrl = URL.createObjectURL(audioBlob);

        // Create audio element
        this.audio = new Audio(this.audioUrl);
        this.audio.volume = options.volume !== undefined ? options.volume : 1.0;

        // Set playback rate (0.5 to 2.0)
        if (options.rate !== undefined) {
          this.audio.playbackRate = Math.max(0.5, Math.min(2.0, options.rate));
        }

        // Event handlers
        this.audio.onplay = () => {
          this.speaking = true;
          this.paused = false;
          if (this.onStateChange) {
            this.onStateChange({ speaking: true, paused: false });
          }
        };

        this.audio.onended = () => {
          this.speaking = false;
          this.paused = false;
          this.currentText = null;

          // CRITICAL: Clear handlers before cleanup to prevent false error triggers
          if (this.audio) {
            this.audio.onended = null;
            this.audio.onerror = null;
          }

          this.cleanup();

          if (this.onStateChange) {
            this.onStateChange({ speaking: false, paused: false });
          }
          if (options.onEnd) options.onEnd();
        };

        this.audio.onerror = (event) => {
          // Don't fallback if user manually stopped the audio
          if (this.manuallyStopped) {
            this.manuallyStopped = false; // Reset flag
            return;
          }

          console.warn("ElevenLabs audio playback error, falling back:", event);

          this.speaking = false;
          this.paused = false;
          this.currentText = null;
          this.cleanup();

          if (this.onStateChange) {
            this.onStateChange({
              speaking: false,
              paused: false,
              error: "Audio playback error",
            });
          }

          // Fallback to Web Speech API on audio playback error
          this.fallbackToWebSpeech(text, options);
        };

        this.audio.onpause = () => {
          this.paused = true;
          if (this.onStateChange) {
            this.onStateChange({ speaking: true, paused: true });
          }
        };

        // Play audio
        await this.audio.play();
        return; // Success, exit early
      } catch (error) {
        console.warn(
          "ElevenLabs TTS failed, falling back to Web Speech API:",
          error,
        );
        // Fallback to Web Speech API
        this.fallbackToWebSpeech(text, options);
      }
    } else {
      // Use Web Speech API directly
      this.fallbackToWebSpeech(text, options);
    }
  }

  /**
   * Fallback to Web Speech API
   * @param {string} text - The text to speak
   * @param {Object} options - Optional settings
   */
  fallbackToWebSpeech(text, options = {}) {
    if (!this.synthesis) {
      console.error("TextToSpeechManager: Web Speech API not available");
      this.speaking = false;
      this.paused = false;
      this.currentText = null;
      if (this.onStateChange) {
        this.onStateChange({
          speaking: false,
          paused: false,
          error: "TTS not available",
        });
      }
      return;
    }

    // Create new utterance
    this.utterance = new SpeechSynthesisUtterance(text);
    this.currentText = text;

    // Set language first
    this.utterance.lang = options.lang || "en-US";

    // Set speech parameters for more natural-sounding voice
    this.utterance.rate = options.rate || 0.7; // Normal speed (1.0 = 100% speed)
    this.utterance.pitch = options.pitch || 1.2; // Normal pitch (1.0 = neutral)
    this.utterance.volume = options.volume !== undefined ? options.volume : 1.0; // Full volume

    // Event handlers
    this.utterance.onstart = () => {
      this.speaking = true;
      this.paused = false;
      if (this.onStateChange) {
        this.onStateChange({ speaking: true, paused: false });
      }
    };

    this.utterance.onend = () => {
      this.speaking = false;
      this.paused = false;
      this.currentText = null;
      if (this.onStateChange) {
        this.onStateChange({ speaking: false, paused: false });
      }
      if (options.onEnd) options.onEnd();
    };

    this.utterance.onerror = (event) => {
      this.speaking = false;
      this.paused = false;
      this.currentText = null;
      if (this.onStateChange) {
        this.onStateChange({
          speaking: false,
          paused: false,
          error: event.error,
        });
      }
      if (options.onError) options.onError(event.error);
    };

    // Try to set voice (but don't fail if unavailable)
    const voices = this.synthesis.getVoices();
    if (voices.length > 0) {
      const voice = this.selectVoice();
      if (voice) {
        this.utterance.voice = voice;
      }
    }

    // Speak
    try {
      this.synthesis.speak(this.utterance);
    } catch (error) {
      this.speaking = false;
      console.error("Web Speech API error:", error);
    }
  }

  /**
   * Cleanup audio resources
   */
  cleanup() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
      this.audio = null;
    }
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }
  }

  /**
   * Stop the current speech
   */
  stop() {
    if (!this.isSupported()) return;

    // Set flag to indicate manual stop (prevents fallback from triggering)
    this.manuallyStopped = true;

    // Stop ElevenLabs audio if playing
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

    // Stop Web Speech API if speaking
    if (this.synthesis) {
      if (this.synthesis.speaking || this.synthesis.pending) {
        this.synthesis.cancel();
      }
    }

    this.speaking = false;
    this.paused = false;
    this.currentText = null;
    this.cleanup();

    if (this.onStateChange) {
      this.onStateChange({ speaking: false, paused: false });
    }
  }

  /**
   * Pause the current speech
   */
  pause() {
    if (!this.isSupported()) return;

    // Pause ElevenLabs audio if playing
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
      this.paused = true;
      if (this.onStateChange) {
        this.onStateChange({ speaking: true, paused: true });
      }
      return;
    }

    // Pause Web Speech API if speaking
    if (this.synthesis && this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
      this.paused = true;
      if (this.onStateChange) {
        this.onStateChange({ speaking: true, paused: true });
      }
    }
  }

  /**
   * Resume paused speech
   */
  async resume() {
    if (!this.isSupported()) return;

    // Resume ElevenLabs audio if paused
    if (this.audio && this.audio.paused) {
      try {
        await this.audio.play();
        this.paused = false;
        if (this.onStateChange) {
          this.onStateChange({ speaking: true, paused: false });
        }
        return;
      } catch (error) {
        console.error("TTS resume error:", error);
      }
    }

    // Resume Web Speech API if paused
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
      this.paused = false;
      if (this.onStateChange) {
        this.onStateChange({ speaking: true, paused: false });
      }
    }
  }

  /**
   * Check if currently speaking
   * @returns {boolean} True if speaking, false otherwise
   */
  isSpeaking() {
    return (
      (this.audio && this.speaking && !this.audio.paused) ||
      (this.synthesis && this.speaking && this.synthesis.speaking)
    );
  }

  /**
   * Check if speech is paused
   * @returns {boolean} True if paused, false otherwise
   */
  isPaused() {
    return (
      (this.audio && this.paused && this.audio.paused) ||
      (this.synthesis && this.paused && this.synthesis.paused)
    );
  }

  /**
   * Get the current text being spoken
   * @returns {string|null} Current text or null
   */
  getCurrentText() {
    return this.currentText;
  }

  /**
   * Set a callback for state changes
   * @param {Function} callback - Callback function
   */
  setStateChangeCallback(callback) {
    this.onStateChange = callback;
  }

  /**
   * Toggle speech (speak if not speaking, stop if speaking)
   * @param {string} text - The text to speak
   * @param {Object} options - Optional settings
   */
  toggle(text, options = {}) {
    if (this.isSpeaking()) {
      this.stop();
    } else {
      this.speak(text, options);
    }
  }
}

// Export singleton instance
const ttsManager = new TextToSpeechManager();

// Wait for voices to be loaded (some browsers load them asynchronously)
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Voices are now loaded
  };
}

export default ttsManager;
