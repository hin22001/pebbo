"use client";

import { useState, useCallback, useRef } from "react";
import ttsManager from "@/app/utils/TextToSpeechManager";
import QuestionsAPI from "@/app/data/api/QuestionsAPI";
import ExerciseAnimationController from "@/app/utils/ExerciseAnimationController";
import {
  sound0Result,
  sound20_40Result,
  sound60_80Result,
  sound100Result,
  soundNextExercise,
  soundAskPotter,
  soundIncorrectAnswer,
  soundAlert,
} from "../questionPageConstants";

// ---------------------------------------------------------------------------
// Audio refs - stored in refs to avoid re-creating on each render
// ---------------------------------------------------------------------------

function getResultAudioRef(
  audioRefs: {
    ref0: HTMLAudioElement | null;
    ref20_40: HTMLAudioElement | null;
    ref60_80: HTMLAudioElement | null;
    ref100: HTMLAudioElement | null;
  },
  percentage: number
): { ref: HTMLAudioElement | null; path: string } {
  const accuracy = percentage || 0;
  if (accuracy === 0) {
    return { ref: audioRefs.ref0, path: sound0Result };
  }
  if (accuracy >= 90) {
    return { ref: audioRefs.ref100, path: sound100Result };
  }
  if (accuracy >= 50) {
    return { ref: audioRefs.ref60_80, path: sound60_80Result };
  }
  return { ref: audioRefs.ref20_40, path: sound20_40Result };
}

// ---------------------------------------------------------------------------
// useExerciseEffects
// ---------------------------------------------------------------------------

export type PotterChatItem = {
  type: "left" | "right";
  date?: string;
  msg?: string;
};

export type PotterClickPosition = { x: number; y: number } | null;

export type UseExerciseEffectsResult = {
  // Sounds
  playResultSound: (percentage: number) => void;
  playNextExerciseSound: () => void;
  playAskPotterSound: () => void;
  playAlertSound: () => void;
  playIncorrectAnswerSound: () => void;

  // TTS
  handleTTSToggle: (activeTab: string | number | null) => void;
  stopTTS: () => void;
  isSpeaking: boolean;

  // Potter modal
  openPotterModal: boolean;
  potterHistoryChat: PotterChatItem[] | null;
  loadingPotterInit: boolean;
  potterClickPosition: PotterClickPosition;
  setOpenPotterModal: (isOpen: boolean) => void;
  openPotterModalAction: (event?: React.MouseEvent) => Promise<void>;

  // Animation helpers (pass-through to ExerciseAnimationController)
  animateSubmitButton: (
    ref: HTMLElement | null,
    onComplete?: () => void
  ) => void;
  animateIncompleteAnswer: (target: HTMLElement) => void;
  animateCategoryCardSelection: (
    cardElement: HTMLElement,
    isSelected: boolean
  ) => void;
  animateCategoriesFadeOut: (refs: (HTMLElement | null)[]) => void;
  stopStartButtonPulse: (ref: HTMLElement | null) => void;
  animateStartButtonClick: (
    ref: HTMLElement | null,
    onComplete?: () => void
  ) => void;
  animateCategoryCardsReveal: (refs: (HTMLElement | null)[]) => void;
  animateStartButtonPulse: (ref: HTMLElement | null) => void;
  animateQuestionTransition: (containerRef: HTMLElement | null) => void;
  animateResultsEntrance: (
    mascotRef: HTMLElement | null,
    scoreElement: HTMLElement | null,
    overallScore: unknown,
    percentageRef: HTMLElement | null,
    roundedPercentage: number
  ) => void;
  animateResultsStats: (
    timeStatsRef: HTMLElement | null,
    accuracyStatsRef: HTMLElement | null,
    starsStatsRef: HTMLElement | null
  ) => void;
  animateCategoryCardHover: (
    cardElement: HTMLElement | null,
    isHovering: boolean
  ) => void;
};

export function useExerciseEffects(): UseExerciseEffectsResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [openPotterModal, setOpenPotterModalState] = useState(false);
  const [potterHistoryChat, setPotterHistoryChat] =
    useState<PotterChatItem[] | null>(null);
  const [loadingPotterInit, setLoadingPotterInit] = useState(false);
  const [potterClickPosition, setPotterClickPosition] =
    useState<PotterClickPosition>(null);

  const audioRefs = useRef({
    ref0: null as HTMLAudioElement | null,
    ref20_40: null as HTMLAudioElement | null,
    ref60_80: null as HTMLAudioElement | null,
    ref100: null as HTMLAudioElement | null,
    nextExercise: null as HTMLAudioElement | null,
    askPotter: null as HTMLAudioElement | null,
    incorrectAnswer: null as HTMLAudioElement | null,
    alert: null as HTMLAudioElement | null,
  });

  const playResultSound = useCallback((percentage: number) => {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;

    const { ref, path } = getResultAudioRef(audioRefs.current, percentage || 0);
    let audioRef = ref;
    if (!audioRef) {
      audioRef = new Audio(path);
      const accuracy = percentage || 0;
      if (accuracy === 0) {
        audioRefs.current.ref0 = audioRef;
      } else if (accuracy >= 90) {
        audioRefs.current.ref100 = audioRef;
      } else if (accuracy >= 50) {
        audioRefs.current.ref60_80 = audioRef;
      } else {
        audioRefs.current.ref20_40 = audioRef;
      }
    }
    audioRef.currentTime = 0;
    audioRef.play().catch((err) => {
      console.error("Error playing result sound:", err, "Path:", path);
    });
  }, []);

  const playNextExerciseSound = useCallback(() => {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;
    if (!audioRefs.current.nextExercise) {
      audioRefs.current.nextExercise = new Audio(soundNextExercise);
    }
    audioRefs.current.nextExercise.currentTime = 0;
    audioRefs.current.nextExercise.play().catch((err) => {
      console.error("Error playing next exercise sound:", err);
    });
  }, []);

  const playAskPotterSound = useCallback(() => {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;
    if (!audioRefs.current.askPotter) {
      audioRefs.current.askPotter = new Audio(soundAskPotter);
    }
    audioRefs.current.askPotter.currentTime = 0;
    audioRefs.current.askPotter.play().catch((err) => {
      console.error("Error playing ask Potter sound:", err);
    });
  }, []);

  const playAlertSound = useCallback(() => {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;
    if (!audioRefs.current.alert) {
      audioRefs.current.alert = new Audio(soundAlert);
    }
    audioRefs.current.alert.currentTime = 0;
    audioRefs.current.alert.play().catch((err) => {
      console.error("Error playing alert sound:", err);
    });
  }, []);

  const playIncorrectAnswerSound = useCallback(() => {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;
    if (!audioRefs.current.incorrectAnswer) {
      audioRefs.current.incorrectAnswer = new Audio(soundIncorrectAnswer);
    }
    audioRefs.current.incorrectAnswer.currentTime = 0;
    audioRefs.current.incorrectAnswer.play().catch((err) => {
      console.error("Error playing incorrect answer sound:", err);
    });
  }, []);

  const stopTTS = useCallback(() => {
    ttsManager.stop();
    setIsSpeaking(false);
  }, []);

  const handleTTSToggle = useCallback(
    (activeTab: string | number | null) => {
      if (!ttsManager.isSupported()) return;

      if (isSpeaking) {
        stopTTS();
      } else {
        const activeQuestionElement = document.querySelector(
          `.section-rich-text-editor[data-question-id="${activeTab}"]`
        );
        const questionElement =
          activeQuestionElement ||
          document.querySelector(
            '.section-rich-text-editor:not([style*="display: none"])'
          ) ||
          document.querySelector(".section-rich-text-editor");

        if (questionElement) {
          const text =
            questionElement.textContent || questionElement.innerText || "";
          const cleanText = text.trim();
          if (cleanText) {
            ttsManager.onStateChange = (state: { speaking: boolean }) => {
              setIsSpeaking(state.speaking);
            };
            ttsManager.speak(cleanText);
          }
        }
      }
    },
    [isSpeaking, stopTTS]
  );

  const openPotterModalAction = useCallback(async (event?: React.MouseEvent) => {
    playAskPotterSound();

    if (event?.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = rect.left + rect.width / 2;
      const clickY = rect.top + rect.height / 2;
      setPotterClickPosition({ x: clickX, y: clickY });
    }

    const qid = localStorage.getItem("activeTab");
    if (potterHistoryChat === null && qid) {
      setLoadingPotterInit(true);
      try {
        const res = await QuestionsAPI.chatGetHistory(
          { question_id: qid },
          {}
        );
        const data = res?.payload?.data?.chatHistory;
        const chatData_: PotterChatItem[] = [];
        for (let i = 0; i < (data?.length ?? 0); i += 1) {
          chatData_.push({
            type: data[i]?.role === "user" ? "right" : "left",
            date: data[i]?.created_at,
            msg: data[i]?.message,
          });
        }
        setPotterHistoryChat(chatData_);
        setLoadingPotterInit(false);
        setOpenPotterModalState(true);
      } catch {
        setLoadingPotterInit(false);
      }
    } else {
      setOpenPotterModalState(true);
    }
  }, [potterHistoryChat, playAskPotterSound]);

  const setOpenPotterModal = useCallback((isOpen: boolean) => {
    setOpenPotterModalState(isOpen);
  }, []);

  return {
    playResultSound,
    playNextExerciseSound,
    playAskPotterSound,
    playAlertSound,
    playIncorrectAnswerSound,
    handleTTSToggle,
    stopTTS,
    isSpeaking,
    openPotterModal,
    potterHistoryChat,
    loadingPotterInit,
    potterClickPosition,
    setOpenPotterModal,
    openPotterModalAction,

    animateSubmitButton: (ref, onComplete) =>
      ExerciseAnimationController.animateSubmitButton(ref, onComplete ?? (() => {})),
    animateIncompleteAnswer: (target) =>
      ExerciseAnimationController.animateIncompleteAnswer(target),
    animateCategoryCardSelection: (cardElement, isSelected) =>
      ExerciseAnimationController.animateCategoryCardSelection(
        cardElement,
        isSelected
      ),
    animateCategoriesFadeOut: (refs) =>
      ExerciseAnimationController.animateCategoriesFadeOut(refs),
    stopStartButtonPulse: (ref) =>
      ExerciseAnimationController.stopStartButtonPulse(ref),
    animateStartButtonClick: (ref, onComplete) =>
      ExerciseAnimationController.animateStartButtonClick(
        ref,
        onComplete ?? (() => {})
      ),
    animateCategoryCardsReveal: (refs) =>
      ExerciseAnimationController.animateCategoryCardsReveal(refs),
    animateStartButtonPulse: (ref) =>
      ExerciseAnimationController.animateStartButtonPulse(ref),
    animateQuestionTransition: (containerRef) =>
      ExerciseAnimationController.animateQuestionTransition(containerRef),
    animateResultsEntrance: (
      mascotRef,
      scoreElement,
      overallScore,
      percentageRef,
      roundedPercentage
    ) =>
      ExerciseAnimationController.animateResultsEntrance(
        mascotRef,
        scoreElement,
        overallScore,
        percentageRef,
        roundedPercentage
      ),
    animateResultsStats: (timeStatsRef, accuracyStatsRef, starsStatsRef) =>
      ExerciseAnimationController.animateResultsStats(
        timeStatsRef,
        accuracyStatsRef,
        starsStatsRef
      ),
    animateCategoryCardHover: (cardElement, isHovering) =>
      ExerciseAnimationController.animateCategoryCardHover(
        cardElement,
        isHovering
      ),
  };
}
