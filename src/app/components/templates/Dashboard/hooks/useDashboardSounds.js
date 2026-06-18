import { useRef } from "react";

const soundStartExercise = "/sounds/Clicked_Start_Exercise_Dashboard.mp3";
const soundStreak = "/sounds/Streak_Dashboard.mp3";
const soundLevelUp = "/sounds/XP_Level_Up_Dashboard.mp3";
const soundAvatarChosen = "/sounds/New_Avatar_Chosen_Dashboard.mp3";
const soundMissionCompleted = "/sounds/Mission_Completed_Dashboard.mp3";

const isAudioMuted = () => {
  // Dashboard SFX (clicks, streaks, level ups) follow "soundEnabled", NOT bg music mute.
  // Background music mute only controls Theme_* files.
  return localStorage.getItem("soundEnabled") === "false";
};

const playSound = (audioRef, soundSrc, label) => {
  if (isAudioMuted()) return;

  if (!audioRef.current) {
    audioRef.current = new Audio(soundSrc);
  }

  audioRef.current.currentTime = 0;
  audioRef.current.play().catch((err) => {
    console.error(`Error playing ${label} sound:`, err);
  });
};

export default function useDashboardSounds() {
  const audioRefStartExercise = useRef(null);
  const audioRefStreak = useRef(null);
  const audioRefLevelUp = useRef(null);
  const audioRefAvatarChosen = useRef(null);
  const audioRefMissionCompleted = useRef(null);

  const playStartExerciseSound = () =>
    playSound(audioRefStartExercise, soundStartExercise, "start exercise");

  const playStreakSound = () =>
    playSound(audioRefStreak, soundStreak, "streak");

  const playLevelUpSound = () =>
    playSound(audioRefLevelUp, soundLevelUp, "level up");

  const playAvatarChosenSound = () =>
    playSound(audioRefAvatarChosen, soundAvatarChosen, "avatar chosen");

  const playMissionCompletedSound = () =>
    playSound(
      audioRefMissionCompleted,
      soundMissionCompleted,
      "mission completed",
    );

  return {
    playStartExerciseSound,
    playStreakSound,
    playLevelUpSound,
    playAvatarChosenSound,
    playMissionCompletedSound,
  };
}
