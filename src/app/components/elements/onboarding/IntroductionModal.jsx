"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Modal,
  Typography,
  Stack,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { Close, ArrowBack, ArrowForward } from "@mui/icons-material";
import Lottie from "lottie-react";
import potterWalkAnimation from "@/app/assets/animations/Walk_Potter.json";
import bobbyWalkAnimation from "@/app/assets/animations/Walk_Bobby.json";
import lunaSilentAnimation from "@/assets/animations/Luna_正面走路_slient.json";
import backgroundMusicManager from "@/app/utils/BackgroundMusicManager";

// Default sub-scene duration in ms (adjustable)
const DEFAULT_SUBSCENE_DURATION = 3000;

// Dashboard onboarding: 5 slides with auto-playing sub-scenes
export const dashboardIntroSlides = [
  // ========== SLIDE 1: Opening ==========
  {
    id: 0,
    title: "Welcome to Pebbo Land",
    mascot: null, // No specific mascot yet
    animation: null, // Will use bg visuals
    bgColor: "#E8F9FF",
    subScenes: [
      {
        id: 1,
        visualCue: "fade-in-forest",
        dialogue: "Welcome to Pebbo Land. Your adventure begins here.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 2,
        visualCue: "sunlight-forest",
        dialogue: "This is a world where learning feels like an adventure.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 3,
        visualCue: "campsite-clearing",
        dialogue: "You won't travel alone.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 4,
        visualCue: "campsite-wind",
        dialogue: "Let me introduce your new friends.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
    ],
  },
  // ========== SLIDE 2: Potter — Exercise ==========
  {
    id: 1,
    title: "Meet Potter",
    mascot: "Potter",
    animation: potterWalkAnimation,
    bgColor: "#E8F9FF",
    subScenes: [
      {
        id: 5,
        visualCue: "potter-walks-in",
        dialogue: "Hi, I'm Potter.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 6,
        visualCue: "xp-stars-appear",
        dialogue: "I love solving challenging questions.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 7,
        visualCue: "exercise-highlight",
        dialogue: "Here, we practice by answering questions.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 8,
        visualCue: "xp-stars-rise",
        dialogue: "Every question you try gives you XP — stars you collect.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 9,
        visualCue: "coin-sparkle",
        dialogue: "When you answer correctly, you earn coins too.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
    ],
  },
  // ========== SLIDE 3: Bobby — Shop & Energy ==========
  {
    id: 2,
    title: "Meet Bobby",
    mascot: "Bobby",
    animation: bobbyWalkAnimation,
    bgColor: "#FFF9E8",
    subScenes: [
      {
        id: 10,
        visualCue: "bobby-slides-in",
        dialogue: "Hey, I'm Bobby!",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 11,
        visualCue: "energy-bar-dip",
        dialogue: "Getting answers wrong can make you tired.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 12,
        visualCue: "shop-icons-appear",
        dialogue: "The shop helps you recover energy.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 13,
        visualCue: "coins-animate-shop",
        dialogue: "You can also buy tools to earn more coins and XP.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 14,
        visualCue: "bobby-confident",
        dialogue: "Keep practicing — the more you try, the stronger you get!",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
    ],
  },
  // ========== SLIDE 4: Zippy — Map & Puzzle ==========
  {
    id: 3,
    title: "Meet Potter",
    mascot: "Zippy",
    animation: potterWalkAnimation, // Placeholder: use Potter until Zippy animation exists
    bgColor: "#E8FFE8",
    subScenes: [
      {
        id: 15,
        visualCue: "zippy-hops-in",
        dialogue: "Hi, I'm Potter!",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 16,
        visualCue: "map-fades-in",
        dialogue: "I love exploring new places.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 17,
        visualCue: "xp-coins-float-map",
        dialogue: "Everything you earn helps us explore Pebbo Land.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 18,
        visualCue: "puzzle-glow",
        dialogue: "When you level up, you earn puzzle pieces.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 19,
        visualCue: "grid-shown",
        dialogue: "There are 100 pieces to discover.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 20,
        visualCue: "map-brightens",
        dialogue: "Let's collect them all and see what's ahead!",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
    ],
  },
  // ========== SLIDE 5: Closing — Reunion & CTA ==========
  {
    id: 4,
    title: "Let's Go!",
    mascot: "All",
    animation: potterWalkAnimation, // Use Potter as main visual
    bgColor: "#FFF0E8",
    subScenes: [
      {
        id: 21,
        visualCue: "all-reunite",
        dialogue: "Together, we learn. Together, we explore.",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 22,
        visualCue: "campfire-lights",
        dialogue: "Ready?",
        duration: 2000,
      },
      {
        id: 23,
        visualCue: "characters-forward",
        dialogue: "Let's go on an adventure!",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
      {
        id: 24,
        visualCue: "button-fades-in",
        dialogue: "Start Pebbo Adventure",
        duration: DEFAULT_SUBSCENE_DURATION,
      },
    ],
  },
];

// Math Library intro (unchanged)
export const introScenes = {
  "/math-library": [
    {
      id: 0,
      mascot: "Luna",
      title: "Welcome to Math Library!",
      dialogue:
        "Hi! I'm Luna. Here you can explore all the math models you've learned. It's a great place to review before your next exercise!",
      previewPanel: {
        title: "Library Assets",
        items: [
          { type: "asset", text: "3-digit Numbers" },
          { type: "asset", text: "Angles & Lines" },
        ],
      },
      buttonText: "Next",
      animation: lunaSilentAnimation,
      bgColor: "#F0F4FF",
    },
    {
      id: 1,
      mascot: "Luna",
      title: "Navigating Categories",
      dialogue:
        "Use the sidebar to pick a chapter. You can also switch between different years to see more advanced topics!",
      previewPanel: {
        title: "Navigation",
        items: [
          { type: "sidebar", text: "Chapter Selection" },
          { type: "dropdown", text: "Year Selection" },
        ],
      },
      buttonText: "Next",
      animation: lunaSilentAnimation,
      bgColor: "#EEF7FE",
    },
    {
      id: 2,
      mascot: "Luna",
      title: "Interactive Features",
      dialogue:
        "Click the speaker icon to hear the descriptions out loud. Use the arrows at the bottom to flip through the library cards!",
      previewPanel: {
        title: "Tools",
        items: [
          { type: "button", text: "TTS Speaker" },
          { type: "button", text: "Slide Navigation" },
        ],
      },
      buttonText: "Finish",
      animation: lunaSilentAnimation,
      bgColor: "#E8F4F8",
    },
  ],
};

// Calculate total sub-scenes for progress bar
const TOTAL_SUBSCENES = dashboardIntroSlides.reduce(
  (acc, slide) => acc + slide.subScenes.length,
  0,
);

const IntroductionModal = ({
  isOpen,
  onClose,
  onComplete,
  pageContext = "default",
}) => {
  // Determine if using new dashboard slides or legacy scenes
  const useDashboardSlides =
    pageContext === "default" || pageContext === "/dashboard";
  const legacyScenes = introScenes[pageContext];

  // ========== STATE ==========
  // Dashboard slides mode
  const [slideIndex, setSlideIndex] = useState(0);
  const [subSceneIndex, setSubSceneIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Legacy mode (for math-library etc.)
  const [legacySceneIndex, setLegacySceneIndex] = useState(0);

  const autoPlayTimerRef = useRef(null);

  // ========== DERIVED STATE ==========
  const currentSlide = useDashboardSlides
    ? dashboardIntroSlides[slideIndex]
    : null;
  const currentSubScene = currentSlide?.subScenes[subSceneIndex];

  // Calculate global progress (across all sub-scenes)
  const getGlobalSubSceneIndex = useCallback(() => {
    if (!useDashboardSlides) return 0;
    let count = 0;
    for (let i = 0; i < slideIndex; i++) {
      count += dashboardIntroSlides[i].subScenes.length;
    }
    return count + subSceneIndex;
  }, [slideIndex, subSceneIndex, useDashboardSlides]);

  const progress = useDashboardSlides
    ? ((getGlobalSubSceneIndex() + 1) / TOTAL_SUBSCENES) * 100
    : 0;

  // Track if we're on the last sub-scene of the current slide (waiting for user to click Next)
  const isLastSubScene =
    useDashboardSlides && currentSlide
      ? subSceneIndex >= currentSlide.subScenes.length - 1
      : false;

  // ========== AUTO-PLAY LOGIC ==========
  useEffect(() => {
    if (!useDashboardSlides || !isOpen || isPaused) return;

    const scene = currentSlide?.subScenes[subSceneIndex];
    if (!scene) return;

    // Don't auto-advance if on the last sub-scene of the slide
    // (wait for user to click "Next" to advance to next slide)
    const isLastSubScene = subSceneIndex >= currentSlide.subScenes.length - 1;
    if (isLastSubScene) return;

    autoPlayTimerRef.current = setTimeout(() => {
      setSubSceneIndex((prev) => prev + 1);
    }, scene.duration);

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [
    slideIndex,
    subSceneIndex,
    isOpen,
    isPaused,
    useDashboardSlides,
    currentSlide,
  ]);

  // ========== HANDLERS ==========
  const handleNextSlide = () => {
    if (!useDashboardSlides) {
      // Legacy mode
      if (legacySceneIndex < legacyScenes.length - 1) {
        setLegacySceneIndex(legacySceneIndex + 1);
      } else {
        handleComplete();
      }
      return;
    }

    // Dashboard slides mode
    if (slideIndex < dashboardIntroSlides.length - 1) {
      setSlideIndex(slideIndex + 1);
      setSubSceneIndex(0);
    } else {
      handleComplete();
    }
  };

  const handlePrevSlide = () => {
    if (!useDashboardSlides) {
      if (legacySceneIndex > 0) {
        setLegacySceneIndex(legacySceneIndex - 1);
      }
      return;
    }

    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
      setSubSceneIndex(0);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    if (typeof window !== "undefined") {
      const isDefault = !introScenes[pageContext];
      const storageKey = isDefault
        ? "intro_completed"
        : `intro_completed_${pageContext}`;

      localStorage.setItem(storageKey, "true");
      localStorage.setItem(
        `${storageKey}_last_shown_at`,
        new Date().toISOString(),
      );

      window.dispatchEvent(
        new CustomEvent("pebbo-onboarding-finished", {
          detail: { pageContext },
        }),
      );
    }

    if (backgroundMusicManager) {
      backgroundMusicManager.stopIntro(true);
    }

    onComplete?.();
    onClose?.();
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSlideIndex(0);
      setSubSceneIndex(0);
      setLegacySceneIndex(0);
      setIsPaused(false);

      if (backgroundMusicManager) {
        backgroundMusicManager.playIntro();
      }
    }
  }, [isOpen]);

  // ========== RENDER: DASHBOARD SLIDES MODE ==========
  if (useDashboardSlides) {
    return (
      <Modal open={isOpen} onClose={handleSkip}>
        <Box
          className="introduction-modal"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95vw", md: "85vw" },
            maxWidth: "950px",
            bgcolor: "#fff",
            borderRadius: "32px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            overflow: "hidden",
            outline: "none",
          }}
        >
          {/* Progress Bar */}
          <Box sx={{ px: 4, pt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#6B4DE6",
                  borderRadius: 4,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                display: "block",
                textAlign: "right",
                mt: 0.5,
                color: "#888",
              }}
            >
              {getGlobalSubSceneIndex() + 1} / {TOTAL_SUBSCENES}
            </Typography>
          </Box>

          {/* Close Button */}
          <IconButton
            onClick={handleSkip}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10,
              bgcolor: "rgba(255,255,255,0.8)",
              "&:hover": { bgcolor: "rgba(255,255,255,1)" },
            }}
          >
            <Close />
          </IconButton>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              pt: 2,
              pb: 1,
              fontWeight: 900,
              color: "#6B4DE6",
              fontFamily: "'Advercase', serif !important",
            }}
          >
            {currentSlide.title}
          </Typography>

          {/* Content Area */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              p: { xs: 2, md: 4 },
              gap: 3,
              bgcolor: currentSlide.bgColor,
              minHeight: "350px",
              position: "relative",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Mascot Animation */}
            {currentSlide.animation && (
              <Box sx={{ width: 200, height: 200, flexShrink: 0 }}>
                <Lottie animationData={currentSlide.animation} loop={true} />
              </Box>
            )}

            {/* Dialogue Bubble */}
            <Box
              sx={{
                flex: 1,
                p: 4,
                bgcolor: "rgba(255,255,255,0.95)",
                borderRadius: "24px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                maxWidth: "500px",
                minHeight: "150px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#333",
                  lineHeight: 1.6,
                  textAlign: "center",
                  fontWeight: 500,
                }}
              >
                {currentSubScene?.dialogue || "..."}
              </Typography>

              {/* Auto-play Progress Indicator */}
              {!isLastSubScene && (
                <Box
                  sx={{
                    width: "80%",
                    height: 4,
                    bgcolor: "#e0e0e0",
                    borderRadius: 2,
                    overflow: "hidden",
                    mt: 1,
                  }}
                >
                  <Box
                    key={`${slideIndex}-${subSceneIndex}`}
                    sx={{
                      height: "100%",
                      bgcolor: "#6B4DE6",
                      borderRadius: 2,
                      animation: `fillProgress ${currentSubScene?.duration || 3000}ms linear forwards`,
                      "@keyframes fillProgress": {
                        from: { width: "0%" },
                        to: { width: "100%" },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>

          {/* Sub-scene Indicators (within slide) */}
          <Stack
            direction="row"
            justifyContent="center"
            spacing={0.5}
            sx={{ py: 1 }}
          >
            {currentSlide.subScenes.map((_, idx) => (
              <Box
                key={idx}
                sx={{
                  width: idx === subSceneIndex ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: idx <= subSceneIndex ? "#6B4DE6" : "#ddd",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Stack>

          {/* Navigation Controls */}
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
            sx={{ py: 3 }}
          >
            {/* Prev Button */}
            <IconButton
              onClick={handlePrevSlide}
              disabled={slideIndex === 0}
              sx={{
                bgcolor: slideIndex === 0 ? "#eee" : "#f0f0f0",
                "&:hover": { bgcolor: "#e0e0e0" },
              }}
            >
              <ArrowBack />
            </IconButton>

            {/* Slide Indicators */}
            <Stack direction="row" spacing={1}>
              {dashboardIntroSlides.map((_, idx) => (
                <Box
                  key={idx}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor:
                      idx === slideIndex
                        ? "#6B4DE6"
                        : idx < slideIndex
                          ? "#a78bfa"
                          : "#ddd",
                    border: idx === slideIndex ? "2px solid #4c1d95" : "none",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Stack>

            {/* Next / CTA Button with Indicator */}
            <Stack alignItems="center" spacing={0.5}>
              {isLastSubScene &&
                slideIndex < dashboardIntroSlides.length - 1 && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#6B4DE6",
                      fontWeight: 600,
                      animation: "fadeInOut 1.5s ease-in-out infinite",
                      "@keyframes fadeInOut": {
                        "0%, 100%": { opacity: 0.6 },
                        "50%": { opacity: 1 },
                      },
                    }}
                  >
                    Click Next to continue ↓
                  </Typography>
                )}
              <Box
                component="button"
                onClick={handleNextSlide}
                sx={{
                  px: 4,
                  py: 1.5,
                  bgcolor: "#6B4DE6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "30px",
                  fontWeight: 700,
                  fontSize: "16px",
                  cursor: "pointer",
                  boxShadow: isLastSubScene
                    ? "0 0 0 4px rgba(107, 77, 230, 0.3), 0 4px 16px rgba(107, 77, 230, 0.4)"
                    : "0 4px 16px rgba(107, 77, 230, 0.4)",
                  transition: "all 0.2s ease",
                  animation: isLastSubScene
                    ? "pulse 1.5s ease-in-out infinite"
                    : "none",
                  "@keyframes pulse": {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.05)" },
                  },
                  "&:hover": {
                    transform: "scale(1.08)",
                    boxShadow: "0 6px 20px rgba(107, 77, 230, 0.5)",
                  },
                }}
              >
                {slideIndex === dashboardIntroSlides.length - 1
                  ? "Start Adventure →"
                  : "Next →"}
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    );
  }

  // ========== RENDER: LEGACY MODE (Math Library, etc.) ==========
  const currentLegacyScene = legacyScenes?.[legacySceneIndex];
  if (!currentLegacyScene) return null;

  return (
    <Modal open={isOpen} onClose={handleSkip}>
      <Box
        className="introduction-modal"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95vw", md: "80vw" },
          maxWidth: "900px",
          bgcolor: "#fff",
          borderRadius: "32px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
          outline: "none",
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={handleSkip}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            bgcolor: "rgba(255,255,255,0.8)",
            "&:hover": { bgcolor: "rgba(255,255,255,1)" },
          }}
        >
          <Close />
        </IconButton>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            pt: 4,
            pb: 2,
            fontWeight: 900,
            color: "#6B4DE6",
            fontFamily: "'Advercase', serif !important",
          }}
        >
          {currentLegacyScene.title}
        </Typography>

        {/* Content Area */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            p: { xs: 2, md: 4 },
            gap: 3,
            bgcolor: currentLegacyScene.bgColor,
            borderRadius: "0 0 32px 32px",
            minHeight: "400px",
            position: "relative",
          }}
        >
          {/* Left: Mascot & Dialogue */}
          <Stack
            sx={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box sx={{ width: 180, height: 180 }}>
              <Lottie
                animationData={currentLegacyScene.animation}
                loop={true}
              />
            </Box>
            <Box
              sx={{
                mt: 2,
                p: 3,
                bgcolor: "rgba(255,255,255,0.95)",
                borderRadius: "20px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                maxWidth: "350px",
              }}
            >
              <Typography
                variant="body1"
                sx={{ color: "#333", lineHeight: 1.6 }}
              >
                {currentLegacyScene.dialogue}
              </Typography>
            </Box>
          </Stack>

          {/* Right: Feature Preview */}
          <Box
            sx={{
              flex: 1,
              bgcolor: "#fff",
              borderRadius: "20px",
              p: 3,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, color: "#333" }}
            >
              {currentLegacyScene.previewPanel.title}
            </Typography>
            <Stack spacing={1.5}>
              {currentLegacyScene.previewPanel.items.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1.5,
                    bgcolor: "#f5f5f5",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                >
                  {item.text}
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Navigation Controls */}
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
          sx={{ py: 3 }}
        >
          {/* Prev Button */}
          <IconButton
            onClick={handlePrevSlide}
            disabled={legacySceneIndex === 0}
            sx={{
              bgcolor: legacySceneIndex === 0 ? "#eee" : "#f0f0f0",
              "&:hover": { bgcolor: "#e0e0e0" },
            }}
          >
            <ArrowBack />
          </IconButton>

          {/* Scene Indicators */}
          <Stack direction="row" spacing={1}>
            {legacyScenes.map((_, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: idx === legacySceneIndex ? "#6B4DE6" : "#ddd",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Stack>

          {/* Next / CTA Button */}
          <Box
            component="button"
            onClick={handleNextSlide}
            sx={{
              px: 4,
              py: 1.5,
              bgcolor: "#6B4DE6",
              color: "#fff",
              border: "none",
              borderRadius: "30px",
              fontWeight: 700,
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(107, 77, 230, 0.4)",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 6px 20px rgba(107, 77, 230, 0.5)",
              },
            }}
          >
            {currentLegacyScene.buttonText} →
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

export default IntroductionModal;
