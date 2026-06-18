import React from "react";
import dynamic from "next/dynamic";
import { Stack } from "@mui/material";
import { getLabel } from "@/app/data/locale";
import { Button, LoaderGraph, ScrollingText } from "@/components/elements";
import loadingAnimation from "@/assets/animations/Loading_Screen_Bobby_Surfing.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function LoadingScreen({
  activeScreen,
  questionReady,
  loadingButtonStartExercise,
  refreshLoader,
  onBack,
  onShowExercise,
  setLoadingExerciseBtn,
}) {
  const isLoading = activeScreen === "loading";

  return (
    <Stack
      spacing={1}
      height={"100%"}
      width={"100%"}
      sx={
        isLoading
          ? {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              zIndex: 1000,
              minHeight: "calc(100vh - 200px)",
              flexGrow: 1,
            }
          : {}
      }
    >
      <Stack
        direction={"row"}
        spacing={1}
        justifyContent={"space-between"}
      >
        <Button
          startIcon="ArrowBackIosNew"
          label={getLabel({ name: "back" })}
          handleClick={onBack}
          sx={{
            gridAutoFlow: "column",
            width: "fit-content",
          }}
          theme="secondary"
        />
        <Button
          className={
            !questionReady || loadingButtonStartExercise
              ? "visibility-off"
              : "visibility-on"
          }
          startIcon="ArrowForwardIosNew"
          label={getLabel({ name: "startExercise" })}
          handleClick={onShowExercise}
          sx={{
            gridAutoFlow: "column",
            width: "fit-content",
          }}
          theme="primary"
        />
      </Stack>
      {isLoading && (
        <Stack className={"element-loader-graph card-flat"}>
          <Stack
            justifyContent="center"
            alignItems="center"
            mb={2}
          >
            <Lottie
              animationData={loadingAnimation}
              loop={true}
              style={{ width: 200, height: 200 }}
            />
          </Stack>
          <LoaderGraph
            startLoader={isLoading ? refreshLoader : null}
            handleClick={onShowExercise}
            sx={{
              minHeight: "500px",
            }}
            isFinish={isLoading ? questionReady : null}
            setLoadingExerciseBtn={setLoadingExerciseBtn}
          />
          <ScrollingText />
        </Stack>
      )}
    </Stack>
  );
}
