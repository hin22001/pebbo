import React, { useCallback, useEffect, useRef } from "react";
import { Stack, Typography } from "@mui/material";
import { ImageHandler } from "../../elements";
import { locale } from "@/src/app/data/locale";

export default function DashboardActivityCards({
  mainClassName,
  getTimeOfDay,
  handleReportIconHover,
  reportIconRef,
  handleButtonClick,
  router,
  head,
  handleQuestionIconHover,
  questionIconRef,
  buttonRefs,
}) {
  const didIdlePrefetchRef = useRef(false);

  const prefetchExercise = useCallback(() => {
    try {
      router?.prefetch?.("/question/exercise");
    } catch {
      // ignore
    }
  }, [router]);

  // Best-effort background prefetch once (after dashboard is interactive)
  useEffect(() => {
    if (didIdlePrefetchRef.current) return;
    didIdlePrefetchRef.current = true;

    const idleCb =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? window.requestIdleCallback
        : null;

    if (idleCb) {
      const id = idleCb(() => prefetchExercise(), { timeout: 2000 });
      return () => {
        try {
          window.cancelIdleCallback?.(id);
        } catch {
          // ignore
        }
      };
    }

    const t = setTimeout(() => prefetchExercise(), 1200);
    return () => clearTimeout(t);
  }, [prefetchExercise]);

  return (
    <Stack className={mainClassName + "-flex-item-right"}>
      <Stack
        className={
          mainClassName + `-flex-item-right-content1 ${getTimeOfDay()}`
        }
        onMouseEnter={() => handleReportIconHover(true)}
        onMouseLeave={() => handleReportIconHover(false)}
      >
        <div ref={reportIconRef} style={{ display: "inline-block" }}>
          <ImageHandler
            src={require("@/images/icon/icon-new-report.svg")}
            alt="question"
            className={mainClassName + "-section2-activity-illustration"}
            width={85}
            height={83}
          />
        </div>
        <ImageHandler
          src={require("@/images/icon/icon-new-report.svg")}
          alt="question"
          className={mainClassName + "-section2-activity-illustration-small"}
          width={85}
          height={83}
        />
        <Stack alignItems="center" maxWidth={"150px"} width={"100%"}>
          <Stack
            onClick={() =>
              handleButtonClick("newReport", () =>
                router.push("/reports/daily"),
              )
            }
            className={mainClassName + "-section2-activity-btn1"}
            ref={(el) => (buttonRefs.current.newReport = el)}
          >
            <Typography
              fontSize={16}
              fontWeight={500}
              color="#fff"
              textAlign="center"
              sx={{
                fontFamily: "'Advercase', serif !important",
                letterSpacing: "0.07rem",
              }}
            >
              {locale(head?.newReport)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      <Stack
        className={
          mainClassName + `-flex-item-right-content2 ${getTimeOfDay()}`
        }
        onMouseEnter={() => handleQuestionIconHover(true)}
        onMouseLeave={() => handleQuestionIconHover(false)}
      >
        <div ref={questionIconRef} style={{ display: "inline-block" }}>
          <ImageHandler
            src={require("@/images/icon/icon-new-question.svg")}
            alt="question"
            className={mainClassName + "-section2-activity-illustration"}
            width={85}
            height={83}
          />
        </div>
        <ImageHandler
          src={require("@/images/icon/icon-new-question.svg")}
          alt="question"
          className={mainClassName + "-section2-activity-illustration-small"}
          width={85}
          height={83}
        />
        <Stack alignItems="center" maxWidth={"150px"} width={"100%"}>
          <Stack
            onClick={() =>
              handleButtonClick("startExercise", () =>
                router.push("/question/exercise"),
              )
            }
            onMouseEnter={prefetchExercise}
            className={mainClassName + "-section2-activity-btn2"}
            ref={(el) => (buttonRefs.current.startExercise = el)}
          >
            <Typography
              fontSize={16}
              fontWeight={500}
              color="#fff"
              textAlign="center"
              sx={{
                fontFamily: "'Advercase', serif !important",
                letterSpacing: "0.07rem",
              }}
            >
              {locale(head?.startExercise)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
