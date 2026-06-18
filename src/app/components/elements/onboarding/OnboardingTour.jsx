"use client";
import React from "react";
import Joyride from "react-joyride";

export default function OnboardingTour({ steps, run, callback }) {
  return (
    <Joyride
      steps={steps}
      run={run}
      callback={callback}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      hideCloseButton={true}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#8264ff",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          mixBlendMode: "normal",
          animation: "fadeIn 0.3s ease-in-out",
          transition: "opacity 0.3s ease-in-out",
        },
        spotlight: {
          borderRadius: "12px",
          backgroundColor: "transparent !important",
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
          mixBlendMode: "normal",
          pointerEvents: "none",
          zIndex: 9998,
          opacity: 1,
        },
        spotlightContainer: {
          zIndex: 9998,
        },
        spotlightOpening: {
          borderRadius: "12px",
        },
        spotlightLegacy: {
          borderRadius: "12px",
          backgroundColor: "transparent !important",
        },
        tooltip: {
          borderRadius: "24px",
          padding: "0",
          border: "none",
          maxWidth: "600px",
          pointerEvents: "auto",
          position: "relative",
          boxShadow: "none",
          background: "transparent",
          animation: "fadeInScale 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transition: "all 0.3s ease",
        },
        tooltipContainer: {
          textAlign: "left",
          pointerEvents: "auto",
        },
        tooltipContent: {
          pointerEvents: "none",
        },
        buttonNext: {
          backgroundColor: "#8264ff",
          borderRadius: "12px",
          textTransform: "none",
          fontSize: "15px",
          fontWeight: 600,
          padding: "12px 32px",
          cursor: "pointer",
          pointerEvents: "auto !important",
          zIndex: 10001,
          position: "relative",
          visibility: "visible",
          opacity: "1",
          color: "#ffffff",
          boxShadow:
            "0 4px 16px rgba(130, 100, 255, 0.5), 0 2px 8px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            backgroundColor: "#6d52e6",
            boxShadow:
              "0 6px 24px rgba(130, 100, 255, 0.6), 0 4px 12px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-2px)",
          },
          "&:active": {
            transform: "translateY(0)",
            boxShadow: "0 2px 8px rgba(130, 100, 255, 0.4)",
          },
        },
        buttonSkip: {
          color: "#8264ff",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "12px",
          textTransform: "none",
          fontSize: "15px",
          fontWeight: 600,
          padding: "12px 32px",
          cursor: "pointer",
          pointerEvents: "auto",
          zIndex: 10001,
          border: "2px solid #8264ff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            backgroundColor: "#ffffff",
            borderColor: "#6d52e6",
            color: "#6d52e6",
            boxShadow: "0 4px 12px rgba(130, 100, 255, 0.3)",
            transform: "translateY(-2px)",
          },
          "&:active": {
            transform: "translateY(0)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          },
        },
        tooltipFooter: {
          pointerEvents: "auto",
          zIndex: 10001,
          position: "relative",
        },
        buttonBack: {
          display: "none",
        },
        tooltipTitle: {
          color: "#231F20",
          fontSize: "24px",
          fontWeight: 700,
          marginBottom: "16px",
          background: "linear-gradient(135deg, #8264ff 0%, #a084ff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        },
      }}
      floaterProps={{
        disableAnimation: false,
        placement: "auto",
        disableOverlayClose: false,
      }}
      disableOverlayClose={false}
      disableScrollLock={false}
      disableOverlay={false}
      spotlightClicks={true}
    />
  );
}
