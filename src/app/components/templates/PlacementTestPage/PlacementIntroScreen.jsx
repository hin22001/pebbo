"use client";
import React, { useMemo } from "react";
import { Box, Stack, Typography, Button as ButtonMUI } from "@mui/material";
import Image from "next/image";

const reinforcementGifs = [
  "/images/animation/bobby_smart.gif",
  "/images/animation/luna_recovered.gif",
  "/images/animation/zippy_full_speed.gif",
];

/**
 * The intro screen shown before the placement test starts.
 * Shows what to expect and has a single CTA to begin.
 */
export default function PlacementIntroScreen({ onStart }) {
  const heroGif = useMemo(() => {
    const idx = Math.floor(Math.random() * reinforcementGifs.length);
    return reinforcementGifs[idx];
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        background: "linear-gradient(160deg, #F8FAFF 0%, #EEF3FF 100%)",
        px: 3,
      }}
    >
      <Stack
        alignItems="center"
        spacing={3}
        maxWidth={480}
        width="100%"
        textAlign="center"
      >
        {/* Mascot / Illustration */}
        <Box
          sx={{
            width: 176,
            height: 176,
            borderRadius: "50%",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 16px 40px rgba(130, 100, 255, 0.25)",
            overflow: "hidden",
          }}
        >
          <Image
            src={heroGif}
            alt="Placement encouragement"
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
              background: "linear-gradient(90deg, #8264FF 0%, #00CDD2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Placement Test
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>
            Let&apos;s find your perfect starting level
          </Typography>
        </Stack>

        {/* Info pills */}
        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          justifyContent="center"
        >
          {[
            { icon: "🎯", label: "10 Questions" },
            { icon: "⏱️", label: "~10 minutes" },
            { icon: "🏆", label: "Personalised path" },
          ].map(({ icon, label }) => (
            <Box
              key={label}
              sx={{
                px: 2,
                py: 1,
                borderRadius: "20px",
                background: "#fff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography fontSize="1.1rem">{icon}</Typography>
              <Typography
                fontSize="0.85rem"
                fontWeight={500}
                color="text.primary"
              >
                {label}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Typography color="text.secondary" fontSize="0.95rem" px={2}>
          Answer each question as best you can. There&apos;s no time limit —
          take your time and do your best!
        </Typography>

        <ButtonMUI
          variant="contained"
          size="large"
          onClick={onStart}
          sx={{
            mt: 1,
            px: 6,
            py: 1.8,
            borderRadius: "14px",
            background: "linear-gradient(90deg, #8264FF 0%, #6D52E6 100%)",
            boxShadow: "0 8px 24px rgba(130, 100, 255, 0.4)",
            fontSize: "1.1rem",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              background: "linear-gradient(90deg, #7055EE 0%, #5D44D6 100%)",
              boxShadow: "0 10px 28px rgba(130, 100, 255, 0.5)",
            },
          }}
        >
          Start Test →
        </ButtonMUI>
      </Stack>
    </Box>
  );
}
