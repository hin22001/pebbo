"use client";
import React from "react";
import Lottie from "lottie-react";
import potterWalkAnimation from "@/assets/animations/Potter_walk.json";
import { Box, Stack, Typography, Button } from "@mui/material";

export default function CustomTooltip({
  step,
  index,
  size,
  primaryProps,
  skipProps,
  tooltipProps,
}) {
  const currentStep = index + 1;
  const totalSteps = size;

  return (
    <Box
      {...tooltipProps}
      sx={{
        backgroundColor: "#fff",
        borderRadius: "24px",
        padding: "28px",
        boxShadow:
          "0 12px 40px rgba(130, 100, 255, 0.25), 0 4px 16px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        width: "100%",
        border: "2px solid #8264ff",
        position: "relative",
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.98) 50%, rgba(248, 248, 255, 1) 100%)",
        animation: "fadeInScale 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transition: "all 0.3s ease",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-2px",
          left: "-2px",
          right: "-2px",
          bottom: "-2px",
          borderRadius: "24px",
          background:
            "linear-gradient(135deg, rgba(130, 100, 255, 0.4) 0%, rgba(130, 100, 255, 0.2) 50%, rgba(130, 100, 255, 0.1) 100%)",
          zIndex: -1,
          opacity: 0.8,
        },
      }}
    >
      {/* Progress Bar */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#8264ff",
          }}
        >
          {currentStep} / {totalSteps}
        </Typography>
        <Box
          sx={{
            flex: 1,
            height: "6px",
            backgroundColor: "#E6E6E6",
            borderRadius: "4px",
            mx: 2,
            overflow: "hidden",
            position: "relative",
            boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box
            sx={{
              width: `${(currentStep / totalSteps) * 100}%`,
              height: "100%",
              background:
                "linear-gradient(90deg, #8264ff 0%, #a084ff 50%, #8264ff 100%)",
              borderRadius: "4px",
              transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              boxShadow: "0 0 8px rgba(130, 100, 255, 0.6)",
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                animation: "progressShine 2s ease-in-out infinite",
              },
            }}
          />
        </Box>
      </Stack>

      {/* Header */}
      <Typography
        sx={{
          fontSize: "26px",
          fontWeight: 700,
          mb: 2,
          textAlign: "center",
          background: "linear-gradient(135deg, #8264ff 0%, #a084ff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.5px",
        }}
      >
        👋 Let's explore Pebbo together!
      </Typography>

      {/* Content Container */}
      <Stack direction="row" spacing={3} alignItems="flex-start">
        {/* Left: Lottie Animation */}
        <Box
          sx={{
            flexShrink: 0,
            width: "160px",
            height: "160px",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-8px",
              left: "-8px",
              right: "-8px",
              bottom: "-8px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(130, 100, 255, 0.2), rgba(160, 132, 255, 0.1))",
              zIndex: 0,
              animation: "pulseGlow 2s ease-in-out infinite",
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              height: "100%",
            }}
          >
            <Lottie
              animationData={potterWalkAnimation}
              loop={true}
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
        </Box>

        {/* Right: Dialogue Bubble */}
        <Box
          sx={{
            flex: 1,
            background:
              "linear-gradient(135deg, #F8F8F8 0%, #F0F0FF 50%, #F8F8F8 100%)",
            borderRadius: "18px",
            padding: "20px",
            position: "relative",
            border: "1px solid rgba(130, 100, 255, 0.15)",
            boxShadow: "0 2px 8px rgba(130, 100, 255, 0.1)",
            "&::after": {
              content: '""',
              position: "absolute",
              left: "-12px",
              top: "24px",
              width: 0,
              height: 0,
              borderTop: "12px solid transparent",
              borderBottom: "12px solid transparent",
              borderRight: "12px solid #F0F0FF",
              filter: "drop-shadow(-2px 0 4px rgba(130, 100, 255, 0.1))",
            },
          }}
        >
          <Typography
            sx={{
              fontSize: "17px",
              fontWeight: 500,
              color: "#231F20",
              lineHeight: 1.7,
              letterSpacing: "0.2px",
            }}
          >
            {step.content}
          </Typography>
        </Box>
      </Stack>

      {/* Footer: Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
        <Button
          {...skipProps}
          variant="outlined"
          sx={{
            borderColor: "#8264ff",
            color: "#8264ff",
            fontWeight: 600,
            borderRadius: "12px",
            textTransform: "none",
            px: 3.5,
            py: 1,
            borderWidth: "2px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              borderColor: "#8264ff",
              backgroundColor: "rgba(130, 100, 255, 0.12)",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(130, 100, 255, 0.2)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
        >
          Skip
        </Button>
        <Button
          {...primaryProps}
          variant="contained"
          sx={{
            backgroundColor: "#8264ff",
            color: "#fff",
            fontWeight: 600,
            borderRadius: "12px",
            textTransform: "none",
            px: 3.5,
            py: 1,
            boxShadow: "0 4px 16px rgba(130, 100, 255, 0.4)",
            background:
              "linear-gradient(135deg, #8264ff 0%, #6d52e6 100%)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: "#6d52e6",
              boxShadow: "0 6px 24px rgba(130, 100, 255, 0.5)",
              transform: "translateY(-2px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
        >
          {index === size - 1 ? "Get Started" : "Next"}
        </Button>
      </Stack>
    </Box>
  );
}

// Add animations
if (typeof document !== "undefined") {
  const existingStyle = document.getElementById("onboarding-animations");
  if (!existingStyle) {
    const style = document.createElement("style");
    style.id = "onboarding-animations";
    style.textContent = `
      @keyframes fadeInScale {
        0% {
          opacity: 0;
          transform: scale(0.95);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes progressShine {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
      @keyframes pulseGlow {
        0%, 100% {
          opacity: 0.6;
          transform: scale(1);
        }
        50% {
          opacity: 0.8;
          transform: scale(1.05);
        }
      }
    `;
    document.head.appendChild(style);
  }
}
