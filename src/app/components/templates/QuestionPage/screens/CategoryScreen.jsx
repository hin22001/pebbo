import React from "react";
import dynamic from "next/dynamic";
import { Stack, Typography } from "@mui/material";
import { getLabel } from "@/app/data/locale";
import { Button } from "@/components/elements";
import loadingAnimation from "@/assets/animations/Loading_Screen_Bobby_Surfing.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import ExerciseAnimationController from "@/app/utils/ExerciseAnimationController";

export default function CategoryScreen({
  mainClassName,
  dataCategory,
  loadingButtonSaveCategory,
  categoryCardsRefs,
  startButtonRef,
  onCategoryChange,
  isCategorySelected,
  getCategoryEmoji,
  onStartExercise,
}) {
  return (
    <Stack spacing={3} sx={{ position: "relative" }}>
      {loadingButtonSaveCategory && (
        <Stack
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "10px",
          }}
        >
          <Stack
            justifyContent="center"
            alignItems="center"
            sx={{ width: "100%", height: "100%" }}
          >
            <Lottie
              animationData={loadingAnimation}
              loop={true}
              style={{ width: 300, height: 300 }}
            />
          </Stack>
        </Stack>
      )}
      <Typography
        className="text-h2"
        component={"h2"}
        sx={{
          fontFamily: "'Advercase', serif !important",
          letterSpacing: "0.07rem",
        }}
      >
        {getLabel({ name: "selectCategory" })}
      </Typography>

      <Stack
        className={mainClassName + "-category"}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1.25rem",
          "@media (max-width: 768px)": {
            gridTemplateColumns: "1fr",
          },
        }}
      >
        {dataCategory?.map((val, i) => {
          if (isCategorySelected(val?.id)) {
            return (
              <Stack
                onClick={(e) => onCategoryChange(val?.id, e.currentTarget)}
                key={i}
                className={mainClassName + "-category-row-active"}
                ref={(el) => (categoryCardsRefs[i] = el)}
                onMouseEnter={(e) =>
                  ExerciseAnimationController.animateCategoryCardHover(
                    e.currentTarget,
                    true,
                    true,
                  )
                }
                onMouseLeave={(e) =>
                  ExerciseAnimationController.animateCategoryCardHover(
                    e.currentTarget,
                    false,
                    true,
                  )
                }
              >
                <Typography
                  className={mainClassName + "-category-emoji"}
                  sx={{ fontSize: "1.5rem" }}
                >
                  {getCategoryEmoji(val)}
                </Typography>
                <Typography
                  className={mainClassName + "-category-txt-active"}
                >
                  {val?.label}
                </Typography>
                <Stack
                  className={mainClassName + "-category-bullet-active"}
                />
              </Stack>
            );
          }
          return (
            <Stack
              onClick={(e) => onCategoryChange(val?.id, e.currentTarget)}
              key={i}
              className={mainClassName + "-category-row"}
              ref={(el) => (categoryCardsRefs[i] = el)}
              onMouseEnter={(e) =>
                ExerciseAnimationController.animateCategoryCardHover(
                  e.currentTarget,
                  true,
                  false,
                )
              }
              onMouseLeave={(e) =>
                ExerciseAnimationController.animateCategoryCardHover(
                  e.currentTarget,
                  false,
                  false,
                )
              }
            >
              <Typography
                className={mainClassName + "-category-emoji"}
                sx={{ fontSize: "1.5rem" }}
              >
                {getCategoryEmoji(val)}
              </Typography>
              <Typography className={mainClassName + "-category-txt"}>
                {val?.label}
              </Typography>
              <Stack className={mainClassName + "-category-bullet"} />
            </Stack>
          );
        })}
      </Stack>

      <Button
        ref={startButtonRef}
        label={getLabel({ name: "startExercise" })}
        handleClick={onStartExercise}
        sx={{
          backgroundColor: "rgba(130,100,255, 0.8) !important",
          "&:hover": {
            backgroundColor: "rgba(0, 205, 210, 0.8) !important",
          },
          "&.MuiButton-root": {
            border: "none !important",
          },
          "&.element-button": {
            border: "none !important",
          },
          fontSize: "1.25rem !important",
        }}
      />
    </Stack>
  );
}
