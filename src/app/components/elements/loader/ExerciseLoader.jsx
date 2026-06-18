"use client";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import React from "react";
import { ModalScreen } from "../../modules";
import { getLabel } from "@/locale";
import Lottie from "lottie-react";
import potterThinkAnimation from "@/assets/animations/Desk_Potter_Think.json";
import bobbySleepAnimation from "@/assets/animations/Desk_Bobby_Sleep.json";

export default function ExerciseLoader(props) {
  try {
    if (typeof window != "undefined") {
      const { isOpen, resetModal } = props;

      const label = "Pebbo AI is working";
      const mainClassName = "elements-custom-loader";

      return (
        <ModalScreen
          isOpen={isOpen}
          resetModal={resetModal}
          className={mainClassName}
          preventClose={true}
        >
          <div className={mainClassName + "-content"}>
            <div className={mainClassName + "-content-wrap-title"}>
              <Typography
                className="text-title"
                sx={{
                  fontFamily: "'Advercase', serif !important",
                  letterSpacing: "0.07rem",
                }}
              >
                {label}
              </Typography>
            </div>

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
              className={mainClassName + "-content-wrap-loader"}
            >
              <Box
                sx={{
                  width: 300,
                  height: 300,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lottie
                  animationData={potterThinkAnimation}
                  loop={true}
                  style={{
                    width: 300,
                    height: 300,
                    transform: "scale(1.3)",
                  }}
                />
              </Box>
              <Box
                sx={{
                  width: 300,
                  height: 300,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lottie
                  animationData={bobbySleepAnimation}
                  loop={true}
                  style={{
                    width: 300,
                    height: 300,
                    transform: "scale(1.3)",
                  }}
                />
              </Box>
            </Stack>
          </div>
        </ModalScreen>
      );
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
}
