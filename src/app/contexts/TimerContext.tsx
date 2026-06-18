"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";

const STORAGE_KEY_SECONDS = "pebbo_daily_study_seconds";
const STORAGE_KEY_DATE = "pebbo_study_date";
const SAVE_INTERVAL_MS = 5000; // Save to localStorage every 5 seconds

interface TimerContextValue {
  elapsedSeconds: number;
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

export function useTimer(): TimerContextValue {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}

interface TimerProviderProps {
  children: ReactNode;
}

export function TimerProvider({ children }: TimerProviderProps) {
  // Get today's date string for daily reset
  const getTodayString = () => new Date().toISOString().split("T")[0];

  // Initialize accumulated seconds from localStorage (resets daily)
  const getStoredSeconds = (): number => {
    try {
      if (typeof window === "undefined") return 0;

      const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
      const today = getTodayString();

      // If stored date is not today, reset to 0
      if (storedDate !== today) {
        localStorage.setItem(STORAGE_KEY_DATE, today);
        localStorage.setItem(STORAGE_KEY_SECONDS, "0");
        return 0;
      }

      const stored = localStorage.getItem(STORAGE_KEY_SECONDS);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  };

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const secondsRef = useRef(0);
  const lastSaveRef = useRef(Date.now());
  const isInitialized = useRef(false);

  // Initialize on mount (client-side only)
  useEffect(() => {
    if (!isInitialized.current) {
      const storedSeconds = getStoredSeconds();
      secondsRef.current = storedSeconds;
      setElapsedSeconds(storedSeconds);
      isInitialized.current = true;
    }
  }, []);

  // Save to localStorage
  const saveProgress = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(STORAGE_KEY_SECONDS, secondsRef.current.toString());
      localStorage.setItem(STORAGE_KEY_DATE, getTodayString());
    } catch (error) {
      console.warn("Failed to save timer progress:", error);
    }
  }, []);

  // Handle visibility change (pause when tab is hidden)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible";
      setIsActive(visible);
      if (!visible) {
        // Save immediately when leaving
        saveProgress();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Save on beforeunload (browser close/refresh)
    const handleBeforeUnload = () => {
      saveProgress();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Save on unmount
      saveProgress();
    };
  }, [saveProgress]);

  // Active time tracking - only count when tab is visible
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      secondsRef.current += 1;
      setElapsedSeconds(secondsRef.current);

      // Save to localStorage periodically
      if (Date.now() - lastSaveRef.current >= SAVE_INTERVAL_MS) {
        saveProgress();
        lastSaveRef.current = Date.now();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, saveProgress]);

  return (
    <TimerContext.Provider value={{ elapsedSeconds }}>
      {children}
    </TimerContext.Provider>
  );
}
