"use client";
import React, { useMemo } from "react";
import { Box, Stack, Typography, Button as ButtonMUI } from "@mui/material";
import Image from "next/image";

const encouragementGifs = [
  "/images/animation/bobby_smart.gif",
  "/images/animation/potter_well_done.gif",
  "/images/animation/luna_recovered.gif",
  "/images/animation/zippy_full_speed.gif",
];

/**
 * Encouragement screen shown after question 5 (the midpoint).
 */
export default function EncouragementScreen({
  onContinue,
  questionsAnswered,
  totalQuestions,
}) {
  const heroGif = useMemo(() => {
    const idx = Math.floor(Math.random() * encouragementGifs.length);
    return encouragementGifs[idx];
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        background: "linear-gradient(160deg, #F0FFF8 0%, #E8F5FF 100%)",
        px: 3,
      }}
    >
      <Stack
        alignItems="center"
        spacing={3}
        maxWidth={460}
        width="100%"
        textAlign="center"
      >
        {/* Celebration emoji */}
        <Box
          sx={{
            width: 176,
            height: 176,
            borderRadius: "50%",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 16px 40px rgba(0, 205, 210, 0.35)",
            overflow: "hidden",
          }}
        >
          <Image
            src={heroGif}
            alt="Great job!"
            width={148}
            height={148}
            style={{ objectFit: "contain" }}
            unoptimized
          />
        </Box>

        <Stack spacing={1}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: "linear-gradient(90deg, #00CDD2 0%, #00A8AC 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Halfway There!
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>
            You&apos;re doing amazing — keep it up!
          </Typography>
        </Stack>

        {/* Progress bar */}
        <Box width="100%" px={2}>
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography fontSize="0.8rem" color="text.secondary">
              Progress
            </Typography>
            <Typography fontSize="0.8rem" fontWeight={600} color="#00CDD2">
              {questionsAnswered}/{totalQuestions}
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 10,
              borderRadius: "10px",
              background: "#E0F7F8",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${(questionsAnswered / totalQuestions) * 100}%`,
                background: "linear-gradient(90deg, #00CDD2, #00A8AC)",
                borderRadius: "10px",
                transition: "width 0.5s ease",
              }}
            />
          </Box>
        </Box>

        <Typography color="text.secondary" fontSize="0.95rem">
          Just {totalQuestions - questionsAnswered} more questions to go.
          You&apos;ve got this! 💪
        </Typography>

        <ButtonMUI
          variant="contained"
          size="large"
          onClick={onContinue}
          sx={{
            mt: 1,
            px: 6,
            py: 1.8,
            borderRadius: "14px",
            background: "linear-gradient(90deg, #00CDD2 0%, #00A8AC 100%)",
            boxShadow: "0 8px 24px rgba(0, 205, 210, 0.4)",
            fontSize: "1.1rem",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              background: "linear-gradient(90deg, #00B8BC 0%, #008F93 100%)",
            },
          }}
        >
          Continue →
        </ButtonMUI>
      </Stack>
    </Box>
  );
}
