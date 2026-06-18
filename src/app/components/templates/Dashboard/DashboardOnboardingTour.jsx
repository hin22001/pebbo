import React, { useEffect } from "react";
import { Stack, Typography, Box } from "@mui/material";
import Lottie from "lottie-react";
import { OnboardingTour } from "../../elements";
import potterWalkAnimation from "@/assets/animations/Potter_walk.json";
import deskPotterThinkAnimation from "@/assets/animations/sikao.json";
import deskBobbySleepAnimation from "@/assets/animations/xuexi.json";

const TourStepContent = ({ children, showHeader = true, animationData }) => (
  <Stack
    direction="column"
    spacing={0.5}
    sx={{
      pointerEvents: "none",
      alignItems: "flex-start",
      gap: 0.5,
      paddingLeft: 0,
      marginLeft: 0,
    }}
  >
    {}
    <Box
      sx={{
        width: "100%",
        background:
          "linear-gradient(135deg, #F8F8F8 0%, #F0F0FF 50%, #F8F8F8 100%)",
        borderRadius: "16px",
        padding: "10px 14px",
        position: "relative",
        pointerEvents: "none",
        border: "2px solid rgba(130, 100, 255, 0.3)",
        boxShadow: "0 2px 8px rgba(130, 100, 255, 0.1)",
        "&::before": {
          content: '""',
          position: "absolute",
          left: "20px",
          bottom: "-10px",
          width: 0,
          height: 0,
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderTop: "10px solid #F0F0FF",
          filter: "drop-shadow(0 2px 2px rgba(130, 100, 255, 0.1))",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          left: "20px",
          bottom: "-12px",
          width: 0,
          height: 0,
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderTop: "10px solid rgba(130, 100, 255, 0.3)",
        },
      }}
    >
      <Stack direction="column" spacing={0.3}>
        {showHeader && (
          <Typography
            sx={{
              fontSize: "15px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #8264ff 0%, #a084ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.5px",
              mb: 0.3,
            }}
          >
            👋 Let's explore!
          </Typography>
        )}
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 500,
            color: "#231F20",
            lineHeight: 1.3,
            letterSpacing: "0.1px",
          }}
        >
          {children}
        </Typography>
      </Stack>
    </Box>

    {}
    <Box
      sx={{
        flexShrink: 0,
        width: "220px",
        height: "220px",
        pointerEvents: "none",
        mt: 0.5,
        ml: -2,
        marginLeft: "-32px !important",
        transform: "translateX(-16px)",
      }}
    >
      <Lottie
        animationData={animationData || potterWalkAnimation}
        loop={true}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      />
    </Box>
  </Stack>
);

export default function DashboardOnboardingTour({
  loader,
  isInitializing,
  runTour,
  setRunTour,
  showStreakPopup,
}) {
  const tourSteps = [
    {
      target: ".dashboard-page-profile-stats-wrapper",
      content: (
        <TourStepContent animationData={deskPotterThinkAnimation}>
          Track your progress! Collect streaks, earn XP, and gather coins.
        </TourStepContent>
      ),
      placement: "right",
      disableBeacon: true,
    },
    {
      target: ".dashboard-page-section2-activity-btn2",
      content: (
        <TourStepContent
          showHeader={false}
          animationData={deskBobbySleepAnimation}
        >
          Start practicing here! Answer questions to improve and level up.
        </TourStepContent>
      ),
      placement: "left",
      disableBeacon: true,
    },
    {
      target: ".dashboard-page-profile-ava-wrapper",
      content: (
        <TourStepContent
          showHeader={false}
          animationData={deskPotterThinkAnimation}
        >
          Watch yourself grow! Level up with each question you answer.
        </TourStepContent>
      ),
      placement: "right",
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status, type, action } = data;

    if (type === "step:before" && data.step?.target) {
      try {
        setTimeout(() => {
          const targetElement = document.querySelector(data.step.target);
          if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            const padding = 8;

            const overlay = document.querySelector(".react-joyride__overlay");
            if (overlay) {
              overlay.style.clipPath = `polygon(
                0% 0%,
                0% 100%,
                ${((rect.left - padding) / window.innerWidth) * 100}% 100%,
                ${((rect.left - padding) / window.innerWidth) * 100}% ${((rect.top - padding) / window.innerHeight) * 100}%,
                ${((rect.right + padding) / window.innerWidth) * 100}% ${((rect.top - padding) / window.innerHeight) * 100}%,
                ${((rect.right + padding) / window.innerWidth) * 100}% ${((rect.bottom + padding) / window.innerHeight) * 100}%,
                ${((rect.left - padding) / window.innerWidth) * 100}% ${((rect.bottom + padding) / window.innerHeight) * 100}%,
                ${((rect.left - padding) / window.innerWidth) * 100}% 100%,
                100% 100%,
                100% 0%
              )`;
            }

            const computedStyle = window.getComputedStyle(targetElement);
            const originalBg = computedStyle.backgroundColor;
            const originalPadding = computedStyle.padding;
            const originalBorderRadius = computedStyle.borderRadius;
            const originalWidth = computedStyle.width;
            const originalDisplay = computedStyle.display;
            const originalJustify = computedStyle.justifyContent;
            const originalAlign = computedStyle.alignItems;

            targetElement.style.cssText += `
              z-index: 10001 !important;
              position: relative !important;
              opacity: 1 !important;
              filter: none !important;
              mix-blend-mode: normal !important;
              isolation: isolate !important;
              will-change: transform !important;
              transform: translateZ(0) !important;
              backdrop-filter: none !important;
              background-color: ${originalBg} !important;
              padding: ${originalPadding} !important;
              border-radius: ${originalBorderRadius} !important;
              width: ${originalWidth} !important;
              display: ${originalDisplay} !important;
              justify-content: ${originalJustify} !important;
              align-items: ${originalAlign} !important;
            `;

            const childElements = targetElement.querySelectorAll("*");
            childElements.forEach((child) => {
              const childComputed = window.getComputedStyle(child);
              const childBg = childComputed.backgroundColor;
              const childColor = childComputed.color;

              child.style.cssText += `
                opacity: 1 !important;
                filter: none !important;
                mix-blend-mode: normal !important;
                isolation: isolate !important;
                backdrop-filter: none !important;
                background-color: ${childBg} !important;
                color: ${childColor} !important;
              `;
            });

            targetElement.setAttribute("data-joyride-highlighted", "true");

            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }, 150);
      } catch (error) {}
    }

    if (type === "step:after" && data.step?.target) {
      try {
        const targetElement = document.querySelector(data.step.target);
        if (targetElement) {
          const overlay = document.querySelector(".react-joyride__overlay");
          if (overlay) {
            overlay.style.clipPath = "";
          }

          targetElement.removeAttribute("data-joyride-highlighted");

          targetElement.style.zIndex = "";
          targetElement.style.position = "";
          targetElement.style.opacity = "";
          targetElement.style.filter = "";
          targetElement.style.mixBlendMode = "";
          targetElement.style.isolation = "";
          targetElement.style.willChange = "";
          targetElement.style.transform = "";
          targetElement.style.backdropFilter = "";

          const childElements = targetElement.querySelectorAll("*");
          childElements.forEach((child) => {
            child.style.opacity = "";
            child.style.filter = "";
            child.style.mixBlendMode = "";
            child.style.isolation = "";
            child.style.backdropFilter = "";
          });
        }
      } catch (error) {}
    }

    if (type === "tour:end" || status === "finished" || status === "skipped") {
      try {
        const overlay = document.querySelector(".react-joyride__overlay");
        if (overlay) {
          overlay.style.clipPath = "";
        }

        tourSteps.forEach((step) => {
          const targetElement = document.querySelector(step.target);
          if (targetElement) {
            targetElement.removeAttribute("data-joyride-highlighted");

            targetElement.style.zIndex = "";
            targetElement.style.position = "";
            targetElement.style.opacity = "";
            targetElement.style.filter = "";
            targetElement.style.mixBlendMode = "";
            targetElement.style.isolation = "";
            targetElement.style.willChange = "";
            targetElement.style.transform = "";
            targetElement.style.backdropFilter = "";

            const childElements = targetElement.querySelectorAll("*");
            childElements.forEach((child) => {
              child.style.opacity = "";
              child.style.filter = "";
              child.style.mixBlendMode = "";
              child.style.isolation = "";
              child.style.backdropFilter = "";
            });
          }
        });
      } catch (error) {}
    }

    if (typeof window !== "undefined") {
      const isUserAction =
        action === "skip" ||
        action === "close" ||
        (action === "next" && status === "finished");

      if (isUserAction && (status === "finished" || status === "skipped")) {
        localStorage.setItem("pebbo_onboarding_completed", "true");
        setRunTour(false);
        return;
      }

      if (isUserAction && type === "tour:end") {
        localStorage.setItem("pebbo_onboarding_completed", "true");
        setRunTour(false);
        return;
      }

      if (status === "finished" || status === "skipped") {
        setRunTour(false);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !loader && !isInitializing) {
      const onboardingCompleted = localStorage.getItem(
        "pebbo_onboarding_completed",
      );
      const hasSeenStreakPopup = localStorage.getItem("hasSeenStreakPopup");
      if (
        (!onboardingCompleted || onboardingCompleted !== "true") &&
        hasSeenStreakPopup === "true"
      ) {
        const startTour = () => {
          const firstStepTarget = document.querySelector(
            ".dashboard-page-profile-ava-wrapper",
          );
          if (firstStepTarget) {
            window.scrollTo({ top: 0, behavior: "instant" });

            setTimeout(() => {
              setRunTour(true);
            }, 500);
          } else {
            setTimeout(startTour, 500);
          }
        };

        setTimeout(startTour, 1000);
      }
    }
  }, [loader, isInitializing, showStreakPopup, setRunTour]);

  return (
    <OnboardingTour
      steps={tourSteps}
      run={runTour}
      callback={handleJoyrideCallback}
    />
  );
}
