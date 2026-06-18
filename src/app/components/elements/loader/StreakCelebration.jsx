"use client";
import React, { useEffect, useRef } from "react";
import Lottie from "lottie-react";
import jumpCheerPotterAnimation from "@/assets/animations/Jump_Cheer_Potter.json";

// Import sound file
const soundStreak = "/sounds/Streak_Dashboard.mp3";

export default function StreakCelebration(props) {
  const { isOpen, resetModal } = props;
  const audioRefStreak = useRef(null);
  const hasPlayedSound = useRef(false);

  // Play sound when modal opens
  useEffect(() => {
    if (isOpen && !hasPlayedSound.current) {
      const playStreakSound = () => {
        const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
        if (!soundEnabled) return;

        if (!audioRefStreak.current) {
          audioRefStreak.current = new Audio(soundStreak);
        }

        audioRefStreak.current.currentTime = 0;
        audioRefStreak.current.play().catch((err) => {
          console.error("Error playing streak sound:", err);
        });
      };

      // Small delay to ensure Lottie animation is rendered
      const soundTimer = setTimeout(() => {
        playStreakSound();
        hasPlayedSound.current = true;
      }, 200);

      return () => clearTimeout(soundTimer);
    } else if (!isOpen) {
      // Reset flag when modal closes
      hasPlayedSound.current = false;
    }
  }, [isOpen]);

  // Auto-close after 4 seconds
  useEffect(() => {
    if (isOpen && resetModal) {
      const timer = setTimeout(() => {
        resetModal();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, resetModal]);

  try {
    if (typeof window != "undefined" && isOpen) {
      return (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            pointerEvents: "none",
            backgroundColor: "transparent",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lottie
              animationData={jumpCheerPotterAnimation}
              loop={true}
              style={{ width: 500, height: 500 }}
            />
          </div>
        </div>
      );
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
}
