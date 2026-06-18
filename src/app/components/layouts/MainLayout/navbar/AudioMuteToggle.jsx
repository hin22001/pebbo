"use client";

import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";

const BG_MUSIC_MUTED_KEY = "pebbo_bg_music_muted";
const TTS_MUTED_KEY = "pebbo_tts_muted";

const readBgMusicMuted = () => {
  if (typeof window === "undefined") return false;
  // Only reads bg music mute state — independent from "soundEnabled" (SFX)
  return localStorage.getItem(BG_MUSIC_MUTED_KEY) === "true";
};

const readTTSMuted = () => {
  if (typeof window === "undefined") return false;
  const mutedRaw = localStorage.getItem(TTS_MUTED_KEY);
  if (mutedRaw == null) {
    // Backward compatibility with old audio muted flag
    return localStorage.getItem("pebbo_audio_muted") === "true";
  }
  return mutedRaw === "true";
};

const writeBgMusicMuted = (muted) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(BG_MUSIC_MUTED_KEY, muted ? "true" : "false");
  // NOTE: Only mutes Theme_* background music files for now.
  // If needed in future, also set localStorage "soundEnabled" here to mute all SFX.
  window.dispatchEvent(
    new CustomEvent("pebbo_bg_music_mute_changed", { detail: { muted } }),
  );
};

const writeTTSMuted = (muted) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TTS_MUTED_KEY, muted ? "true" : "false");
  window.dispatchEvent(
    new CustomEvent("pebbo_tts_mute_changed", { detail: { muted } }),
  );
};

export default function AudioMuteToggle() {
  const [bgMusicMuted, setBgMusicMuted] = React.useState(false);
  const [ttsMuted, setTTSMuted] = React.useState(false);

  React.useEffect(() => {
    setBgMusicMuted(readBgMusicMuted());
    setTTSMuted(readTTSMuted());
  }, []);

  const handleBgMusicToggle = () => {
    const nextMuted = !bgMusicMuted;
    setBgMusicMuted(nextMuted);
    writeBgMusicMuted(nextMuted);
  };

  const handleTTSToggle = () => {
    const nextMuted = !ttsMuted;
    setTTSMuted(nextMuted);
    writeTTSMuted(nextMuted);
  };

  const allMuted = bgMusicMuted && ttsMuted;
  const someMuted = bgMusicMuted || ttsMuted;

  return (
    <>
      <Tooltip title={bgMusicMuted ? "Unmute background music" : "Mute background music"}>
        <IconButton size="small" onClick={handleBgMusicToggle}>
          {bgMusicMuted ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
        </IconButton>
      </Tooltip>
      <Tooltip title={ttsMuted ? "Unmute voice" : "Mute voice"}>
        <IconButton size="small" onClick={handleTTSToggle}>
          {ttsMuted ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
        </IconButton>
      </Tooltip>
    </>
  );
}
