"use client";
import { CircularProgress, Stack, Typography } from "@mui/material";
import React from "react";
import { ModalScreen } from "../../modules";
import { getLabel } from "@/locale";
import Lottie from "lottie-react";
import loadingAnimation from "@/assets/animations/Loading_Screen_Bobby_Surfing.json";

export default function Loader(props) {
  try {
    if (typeof window != "undefined") {
      const { isOpen, resetModal } = props;

      const label = getLabel({ name: "pleaseWait" });
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

            <Stack className={mainClassName + "-content-wrap-loader"}>
              <Lottie
                animationData={loadingAnimation}
                loop={true}
                style={{ width: 200, height: 200 }}
              />
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
