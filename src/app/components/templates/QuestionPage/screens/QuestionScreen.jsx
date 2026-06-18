import React from "react";
import dynamic from "next/dynamic";
import {
  Stack,
  Typography,
  Collapse,
  Box,
} from "@mui/material";
import { locale } from "@/app/data/locale";
import {
  Button,
  ImageHandler,
  IconButton,
} from "@/components/elements";
import { ModalConfirm } from "@/components/modules";
import Tooltip from "@/elements/tooltip/Tooltip";
import { QuestionTimer } from "..";
import ProgressBar from "../ProgressBar";
import { fieryHoverSx } from "@/components/elements/styles/fieryHover";
import dayjs from "dayjs";
import sikaoAnimation from "@/assets/animations/xuexi.json";
import { useQuestionFlow } from "../hooks/useQuestionFlow";
import { useQuestionTimer } from "../hooks/useQuestionTimer";

const RichText = dynamic(
  () =>
    import("../../../sections/richText").then((m) => ({ default: m.RichText })),
  { ssr: false }
);

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function QuestionScreen({
  mainClassName,
  head,
  activeTab,
  dataQuestions,
  dataQuestionsTab,
  scoreResult,
  dataCategory,
  dataAnswer,
  timeStart,
  timeEnd,
  startTimer,
  refRichText,
  onRefRichText,
  mascotRef,
  percentageRef,
  timeStatsRef,
  accuracyStatsRef,
  starsStatsRef,
  submitButtonRef,
  nextButtonRef,
  questionTabsRefs,
  questionContainerRef,
  handleEvent,
  getAccuracyGif,
  getCharacterName,
  roundScore,
  getCategoryLabel,
  getDifficultyLabel,
  formatStartEndTime,
  formatTime,
  getTimeDuration,
  onPlayAlertSound,
  onIssueReport,
  onOpenPotterModal,
}) {
  const startRes = formatStartEndTime(timeStart);
  const endRes = formatStartEndTime(timeEnd);

  // Hook-based flow side effects: localStorage + keyboard navigation
  useQuestionFlow({
    activeTab,
    tabs: dataQuestionsTab,
    onSwitchTab: (nextId) =>
      handleEvent({ type: "switch-tab", value: nextId }),
    onNextQuestion: () => handleEvent({ type: "next-question" }),
    onPreviousQuestion: () => handleEvent({ type: "previous-question" }),
  });

  // Hook-based timer mirror – keeps a derived timer in sync with the legacy
  // fields so we can gradually migrate ownership without changing behaviour.
  useQuestionTimer({ running: startTimer });

  return (
    <Stack
      style={{
        backgroundColor: "#fff",
        borderRadius: "10px",
        padding: "1rem 2rem",
        position: "relative",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* 🎬 Lottie Animation Placeholders - Side Mascots */}
      <Stack
        className="lottie-placeholder-mascot-left"
        sx={{
          position: "absolute",
          left: "-160px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "120px",
          height: "150px",
          border: "2px dashed #8264FF",
          borderRadius: "12px",
          backgroundColor: "rgba(130, 100, 255, 0.05)",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#8264FF",
          gap: 1,
          zIndex: 10,
        }}
        data-animation-type="mascot-left"
      >
        <Typography fontSize={32}>🎬</Typography>
        <Typography fontSize={10} fontWeight={500} textAlign="center" px={1}>
          Left Mascot Animation
        </Typography>
      </Stack>

      <Stack
        className="lottie-placeholder-mascot-right"
        sx={{
          position: "absolute",
          right: "-160px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "120px",
          height: "150px",
          border: "2px dashed #8264FF",
          borderRadius: "12px",
          backgroundColor: "rgba(130, 100, 255, 0.05)",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#8264FF",
          gap: 1,
          zIndex: 10,
        }}
        data-animation-type="mascot-right"
      >
        <Typography fontSize={32}>🎬</Typography>
        <Typography fontSize={10} fontWeight={500} textAlign="center" px={1}>
          Right Mascot Animation
        </Typography>
      </Stack>

      <Stack
        className={mainClassName + "-header-question"}
        sx={{ marginBottom: "0.5rem" }}
      >
        <Stack direction="row" alignItems={"center"} width="100%">
          <Typography
            className={mainClassName + "-title"}
            fontWeight={600}
            color="#231F20"
            sx={{
              fontFamily: "'Advercase', serif !important",
              letterSpacing: "0.07rem",
              marginRight: "0.4rem",
            }}
          >
            {locale(head?.header?.title)}
          </Typography>
          <Typography
            className={mainClassName + "-title"}
            fontWeight={400}
            color="#231F20"
            sx={{
              fontFamily: "'Advercase', serif !important",
              letterSpacing: "0.07rem",
            }}
          >
            {dayjs().format("DD MMM YYYY, h:mm A")}
          </Typography>
        </Stack>
      </Stack>

      <Stack
        className={mainClassName + "-body"}
        sx={{
          display: "grid",
          gridTemplateColumns: "100px 1fr 280px",
          columnGap: "2.5rem",
          rowGap: "1.5rem",
          height: "calc(100vh - 200px)",
          overflow: "hidden",
          flex: 1,
          alignItems: "start",
        }}
      >
        {/* LEFT SIDEBAR - Vertical Question Navigation */}
        <Stack sx={{ overflow: "hidden", paddingTop: "20px" }}>
          <Stack spacing={0.5}>
            {dataQuestionsTab?.map((tab, idx) => {
              const isActive = activeTab === tab?.id;
              let isCorrect = false;
              let isWrong = false;

              if (scoreResult && tab?.id !== 1) {
                const questionResult = scoreResult?.dataQuestion?.find(
                  (q) => q.id === tab?.id
                );
                const accuracy = Number(questionResult?.accuracy);
                isCorrect = accuracy === 1;
                isWrong =
                  accuracy < 1 && questionResult?.accuracy !== undefined;
              }

              if (!isCorrect && !isWrong) {
                isCorrect =
                  tab?.className?.includes("correct") ||
                  tab?.icon === "CheckCircleOutline";
                isWrong =
                  tab?.className?.includes("wrong") ||
                  tab?.icon === "HighlightOff";
              }

              const isResultButton = tab?.id === 1;

              return (
                <React.Fragment key={idx}>
                  {isResultButton && <Stack height="24px" />}
                  <Stack
                    onClick={() =>
                      handleEvent({ type: "switch-tab", value: tab?.id })
                    }
                    sx={{
                      marginTop: isResultButton ? "5rem" : "0",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "6px",
                      minHeight: "2.5rem",
                      backgroundColor: isResultButton
                        ? isActive
                          ? "#8264FF"
                          : "#8264FF"
                        : isActive
                          ? "#00CDD2"
                          : isCorrect
                            ? "#00CDD2"
                            : isWrong
                              ? "#FF5000"
                              : "#F6F9FF",
                      color:
                        isResultButton ||
                        isActive ||
                        isCorrect ||
                        isWrong
                          ? "#fff"
                          : "#231F20",
                      cursor: "pointer",
                      border: isResultButton
                        ? isActive
                          ? "none"
                          : "1px solid #8264FF"
                        : isActive
                          ? "none"
                          : isCorrect
                            ? "1px solid #00CDD2"
                            : isWrong
                              ? "1px solid #FF5000"
                              : "1px solid #E0E0E0",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "1.5rem",
                      justifyContent: "center",
                      alignItems: "center",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: isResultButton
                          ? "#8264FF"
                          : isActive
                            ? "#00CDD2"
                            : isCorrect
                              ? "#00CDD2"
                              : isWrong
                                ? "#FF5000"
                                : "#EDEDED",
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" gap={1}>
                      {isCorrect && (
                        <Typography sx={{ fontSize: "1.3rem" }}>✓</Typography>
                      )}
                      {isWrong && (
                        <Typography sx={{ fontSize: "1.3rem" }}>✗</Typography>
                      )}
                      {!isCorrect && !isWrong && (
                        <Typography sx={{ fontSize: "1rem" }}>○</Typography>
                      )}
                      <Typography
                        sx={{
                          fontSize: "1.5rem",
                          fontWeight: 500,
                          fontFamily: "'Advercase', serif !important",
                        }}
                      >
                        {tab?.label}
                      </Typography>
                    </Stack>
                  </Stack>
                </React.Fragment>
              );
            })}
          </Stack>
        </Stack>

        {/* CENTER CONTENT - Questions */}
        <Stack sx={{ padding: "20px", overflow: "hidden" }}>
          <Stack className={mainClassName + "-question "}>
            {dataQuestions?.length > 0 &&
              dataQuestions?.map((item, index) => {
                const itemResult = scoreResult?.dataQuestion[index];

                return (
                  <Collapse
                    key={mainClassName + "-question-" + index}
                    in={activeTab == item.id}
                    className={activeTab == item.id ? "active" : ""}
                  >
                    <Stack
                      spacing={2}
                      justifyContent={"flex-start"}
                      justifyItems={"center"}
                      alignItems={"center"}
                      sx={{
                        height: "calc(100vh - 240px)",
                        maxHeight: "calc(100vh - 240px)",
                        borderRadius: "10px",
                        paddingTop: "2rem",
                        overscrollBehavior: "contain",
                        overflow: "auto",
                        boxShadow:
                          "0px 4px 16px 0px rgba(0, 0, 0, 0.28) !important",
                      }}
                      backgroundColor="#f6f9ff"
                      className={mainClassName + "-wrapper"}
                    >
                      <Stack
                        pt={5}
                        style={{
                          marginBottom: "-75px",
                          zIndex: 1,
                        }}
                        width="85%"
                      >
                        {item?.id !== 1 && (
                          <Typography
                            color="#00CDD2"
                            fontWeight={600}
                            fontSize={36}
                            sx={{
                              fontFamily: "'Advercase', serif !important",
                            }}
                          >
                            Q{index + 1}
                            {dataQuestions?.length > 1
                              ? `/${scoreResult ? dataQuestions?.length - 1 : dataQuestions?.length}`
                              : ""}
                          </Typography>
                        )}
                        <Stack mt={1} direction="row" width="100%">
                          {item?.id !== 1 && (
                            <>
                              <Stack direction="row" alignItems="center">
                                <Typography
                                  color="#8D8D8D"
                                  fontSize={14}
                                  fontWeight={400}
                                >
                                  {locale(head?.category)}:
                                </Typography>
                                <Stack
                                  className={
                                    mainClassName + "-question-info-pil"
                                  }
                                >
                                  <Typography
                                    color="#231F20"
                                    fontSize={14}
                                    fontWeight={400}
                                  >
                                    {getCategoryLabel(
                                      item?.outer_category,
                                      dataCategory
                                    )}
                                  </Typography>
                                </Stack>
                              </Stack>
                              <Stack direction="row" alignItems="center">
                                <Typography
                                  color="#8D8D8D"
                                  fontSize={14}
                                  fontWeight={400}
                                >
                                  {locale(head?.difficulty)}:
                                </Typography>
                                <Stack
                                  className={
                                    mainClassName + "-question-info-pil"
                                  }
                                >
                                  <Typography
                                    color="#231F20"
                                    fontSize={14}
                                    fontWeight={400}
                                  >
                                    {getDifficultyLabel(item?.difficulty)}
                                  </Typography>
                                </Stack>
                              </Stack>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Typography
                                  color="#8D8D8D"
                                  fontSize={14}
                                  fontWeight={400}
                                >
                                  {locale(head?.questionId)}:
                                </Typography>
                                <Stack
                                  className={
                                    mainClassName + "-question-info-pil"
                                  }
                                >
                                  <Typography
                                    color="#231F20"
                                    fontSize={14}
                                    fontWeight={400}
                                  >
                                    {activeTab}
                                  </Typography>
                                </Stack>
                                {scoreResult && (
                                  <Tooltip
                                    title={locale(
                                      "Report an issue with this question"
                                    )}
                                  >
                                    <IconButton
                                      icon="flag"
                                      size="md"
                                      theme="light"
                                      handleClick={() => {
                                        onPlayAlertSound?.();
                                        onIssueReport?.(item.id);
                                      }}
                                      sx={{
                                        marginLeft: "8px",
                                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                                        "& .mui-icon": {
                                          fontSize: "1.2rem",
                                        },
                                        "&:hover": {
                                          backgroundColor:
                                            "rgba(0, 0, 0, 0.1)",
                                        },
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </Stack>
                            </>
                          )}
                        </Stack>
                      </Stack>

                      {item?.id !== 1 ? (
                        <>
                          {scoreResult ? (
                            <RichText
                              value={itemResult?.question}
                              readOnly={true}
                              key={itemResult?.elementKey}
                              questionId={item.id}
                            />
                          ) : (
                            <RichText
                              refEditor={(instance) => {
                                if (instance && onRefRichText) {
                                  onRefRichText(item.id, instance.getJSON());
                                }
                              }}
                              value={item?.question}
                              readOnly={true}
                              questionId={item.id}
                            />
                          )}
                        </>
                      ) : (
                        <Stack
                          className={mainClassName + "-result"}
                          sx={{
                            justifyContent: "center",
                            alignItems: "center",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Stack
                            ref={mascotRef}
                            style={{
                              opacity: 0,
                              transform: "translateY(100px) scale(0.5)",
                            }}
                          >
                            <img
                              src={getAccuracyGif(scoreResult?.percentage)}
                              alt="mascot"
                              width={220}
                              height={220}
                              style={{
                                width: "220px",
                                height: "220px",
                                objectFit: "contain",
                              }}
                            />
                          </Stack>
                          <Typography
                            mt={2}
                            color="#231F20"
                            fontWeight={700}
                            fontSize={19}
                            sx={{
                              fontFamily:
                                "'Advercase', serif !important",
                              letterSpacing: "0.07rem",
                            }}
                          >
                            {scoreResult?.percentage === 0
                              ? 'Bobby said: "I will never be this low ever again"'
                              : `${getCharacterName(scoreResult?.percentage)} said: ${
                                  scoreResult?.percentage > 50
                                    ? locale(head?.congrats)
                                    : locale(head?.tryHarder)
                                }`}
                          </Typography>
                          <Typography
                            mt={1}
                            color="#8D8D8D"
                            fontWeight={400}
                            fontSize={14}
                          >
                            {scoreResult?.percentage > 50
                              ? locale(head?.wishSuccess)
                              : locale(head?.doBetter)}
                          </Typography>

                          <Stack direction="row" mt={5} mb={5}>
                            <Stack
                              ref={timeStatsRef}
                              className={
                                mainClassName + "-result-with-time"
                              }
                              style={{
                                opacity: 0,
                                transform: "translateY(30px) scale(0.9)",
                              }}
                            >
                              <Typography
                                color="#fff"
                                fontSize={14}
                                mt={-1}
                                mb={1}
                                fontWeight={500}
                              >
                                {locale(head?.time)}
                              </Typography>
                              <Stack
                                className={mainClassName + "-result-inner"}
                              >
                                <ImageHandler
                                  src={require("@/images/icon/icon-clock-outline.svg")}
                                  width={30}
                                  height={30}
                                />
                                <Typography
                                  color="#8264FF"
                                  fontSize={24}
                                  fontWeight={600}
                                  sx={{
                                    fontFamily:
                                      "'Advercase', serif !important",
                                    letterSpacing: "0.07rem",
                                  }}
                                >
                                  {formatTime(
                                    Math.floor((timeEnd - timeStart) / 1000)
                                  )}
                                </Typography>
                              </Stack>
                            </Stack>

                            <Stack
                              ref={accuracyStatsRef}
                              className={
                                mainClassName + "-result-your-score"
                              }
                              style={{
                                opacity: 0,
                                transform: "translateY(30px) scale(0.9)",
                              }}
                            >
                              <Typography
                                color="#fff"
                                fontSize={14}
                                mt={-1}
                                mb={1}
                                fontWeight={500}
                              >
                                {locale(head?.yourScore)}
                              </Typography>
                              <Stack
                                className={mainClassName + "-result-inner"}
                              >
                                <Typography
                                  color="#00CDD2"
                                  fontSize={24}
                                  fontWeight={600}
                                  ref={percentageRef}
                                  sx={{
                                    fontFamily:
                                      "'Advercase', serif !important",
                                    letterSpacing: "0.07rem",
                                  }}
                                >
                                  {roundScore(scoreResult?.percentage)}%
                                </Typography>
                              </Stack>
                            </Stack>

                            <Stack
                              ref={starsStatsRef}
                              className={
                                mainClassName + "-result-star-coin"
                              }
                              style={{
                                opacity: 0,
                                transform: "translateY(30px) scale(0.9)",
                              }}
                            >
                              <Typography
                                color="#fff"
                                fontSize={14}
                                mt={-1}
                                mb={1}
                                fontWeight={500}
                              >
                                {locale(head?.rewards)}
                              </Typography>
                              <Stack
                                className={mainClassName + "-result-inner"}
                              >
                                {(() => {
                                  const coins =
                                    scoreResult?.coins_awarded ||
                                    scoreResult?.payload?.coins_awarded ||
                                    0;
                                  const stars =
                                    scoreResult?.dataQuestion?.length || 0;

                                  return (
                                    <Stack
                                      direction="row"
                                      justifyContent="center"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      <Stack
                                        direction="row"
                                        alignItems="center"
                                        gap={0}
                                      >
                                        <ImageHandler
                                          src={"/Coin.svg"}
                                          width={28}
                                          height={28}
                                        />
                                        <Typography
                                          color="#FF5000"
                                          fontSize={24}
                                          fontWeight={600}
                                          sx={{
                                            fontFamily:
                                              "'Advercase', serif !important",
                                            letterSpacing: "0.07rem",
                                          }}
                                        >
                                          {coins}
                                        </Typography>
                                      </Stack>
                                      <Stack
                                        direction="row"
                                        alignItems="center"
                                        gap={0}
                                      >
                                        <ImageHandler
                                          src={"/Star.svg"}
                                          width={28}
                                          height={28}
                                        />
                                        <Typography
                                          color="#FF5000"
                                          fontSize={24}
                                          fontWeight={600}
                                          sx={{
                                            fontFamily:
                                              "'Advercase', serif !important",
                                            letterSpacing: "0.07rem",
                                          }}
                                        >
                                          {stars}
                                        </Typography>
                                      </Stack>
                                    </Stack>
                                  );
                                })()}
                              </Stack>
                            </Stack>
                          </Stack>
                        </Stack>
                      )}
                    </Stack>
                  </Collapse>
                );
              })}
          </Stack>
        </Stack>

        {/* RIGHT SIDEBAR - Timer and Actions */}
        <Stack
          spacing={4}
          display="flex"
          flexDirection="column"
          alignItems="stretch"
          width="100%"
          sx={{ overflow: "hidden", paddingTop: "20px" }}
        >
          <Stack
            className={mainClassName + "-timer"}
            width="100%"
            sx={{
              borderRadius: "10px !important",
              backgroundColor: "#fff",
              overflow: "hidden",
            }}
          >
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              width="100%"
            >
              <Stack alignItems="center" width="100%">
                <Typography
                  color="#8D8D8D"
                  className={mainClassName + "-timer-txt-small"}
                  fontWeight={500}
                  textAlign="center"
                >
                  {locale(head?.spentTime)}
                </Typography>
                <QuestionTimer start={startTimer} />
              </Stack>
            </Stack>
            <Stack
              mt={3}
              direction="row"
              alignItems="center"
              justifyContent="center"
              width="100%"
              px={1}
            >
              <Stack flex={1} alignItems="center">
                <Typography
                  color="#8D8D8D"
                  className={mainClassName + "-timer-txt-small"}
                  fontWeight={400}
                  textAlign="center"
                >
                  Start time
                </Typography>
                <Stack direction="row" mt={1}>
                  <Stack
                    className={mainClassName + "-timer-time-wrapper"}
                  >
                    <Typography
                      className={mainClassName + "-timer-txt-regular"}
                      fontWeight={400}
                    >
                      {startRes?.hours?.[0]}
                    </Typography>
                  </Stack>
                  <Stack
                    className={mainClassName + "-timer-time-wrapper"}
                  >
                    <Typography
                      className={mainClassName + "-timer-txt-regular"}
                      fontWeight={400}
                    >
                      {startRes?.hours?.[1]}
                    </Typography>
                  </Stack>
                  <Typography
                    className={mainClassName + "-timer-txt-regular"}
                    fontWeight={400}
                  >
                    :
                  </Typography>
                  <Stack
                    className={mainClassName + "-timer-time-wrapper"}
                  >
                    <Typography
                      className={mainClassName + "-timer-txt-regular"}
                      fontWeight={400}
                    >
                      {startRes?.minutes?.[0]}
                    </Typography>
                  </Stack>
                  <Stack
                    className={mainClassName + "-timer-time-wrapper"}
                  >
                    <Typography
                      className={mainClassName + "-timer-txt-regular"}
                      fontWeight={400}
                    >
                      {startRes?.minutes?.[1]}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
              <Stack flex={1} alignItems="center">
                <Typography
                  className={mainClassName + "-timer-txt-small"}
                  fontWeight={600}
                  sx={{
                    fontFamily: "'Advercase', serif !important",
                    letterSpacing: "0.07rem",
                  }}
                >
                  {dayjs().format("h:mm A")}
                </Typography>
                <Stack
                  mt={1}
                  className={mainClassName + "-timer-progress"}
                >
                  <ProgressBar
                    startTime={timeStart}
                    running={startTimer}
                    maxDuration={20 * 60}
                  />
                </Stack>
              </Stack>
              <Stack flex={1} alignItems="center">
                <Typography
                  color="#8D8D8D"
                  className={mainClassName + "-timer-txt-small"}
                  fontWeight={400}
                  textAlign="center"
                >
                  End time
                </Typography>
                <Stack direction="row" mt={1}>
                  <Stack
                    className={mainClassName + "-timer-time-wrapper"}
                  >
                    <Typography
                      className={mainClassName + "-timer-txt-regular"}
                      fontWeight={400}
                    >
                      {endRes?.hours?.[0]}
                    </Typography>
                  </Stack>
                  <Stack
                    className={mainClassName + "-timer-time-wrapper"}
                  >
                    <Typography
                      className={mainClassName + "-timer-txt-regular"}
                      fontWeight={400}
                    >
                      {endRes?.hours?.[1]}
                    </Typography>
                  </Stack>
                  <Typography
                    className={mainClassName + "-timer-txt-regular"}
                    fontWeight={400}
                  >
                    :
                  </Typography>
                  <Stack
                    className={mainClassName + "-timer-time-wrapper"}
                  >
                    <Typography
                      className={mainClassName + "-timer-txt-regular"}
                      fontWeight={400}
                    >
                      {endRes?.minutes?.[0]}
                    </Typography>
                  </Stack>
                  <Stack
                    className={mainClassName + "-timer-time-wrapper"}
                  >
                    <Typography
                      className={mainClassName + "-timer-txt-regular"}
                      fontWeight={400}
                    >
                      {endRes?.minutes?.[1]}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          {scoreResult && <Stack sx={{ height: "20px" }} />}
          {scoreResult && (
            <Button
              className="submit-cta-effect"
              label={locale(head?.continue2)}
              handleClick={async () =>
                await handleEvent({ type: "try-again" })
              }
              sx={{
                width: "100%",
                mt: 0,
                mb: 0,
                fontSize: "1.5rem !important",
                fontFamily: "'Advercase', serif !important",
                letterSpacing: "0.07rem",
                lineHeight: 1,
              }}
            />
          )}
          {scoreResult && activeTab !== 1 && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: "-30px",
                position: "relative",
                zIndex: 1,
              }}
              style={{ marginTop: "-30px" }}
            >
              <Box
                onClick={onOpenPotterModal}
                sx={{
                  width: "300px",
                  height: "300px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  position: "relative",
                  "&:hover": {
                    opacity: 0.9,
                  },
                }}
              >
                <Lottie
                  animationData={sikaoAnimation}
                  loop={true}
                  style={{ width: "100%", height: "100%" }}
                />
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  right: "calc(50% - 120px)",
                  top: "20%",
                  transform: "rotate(30deg)",
                  animation: "bounce 2s ease-in-out infinite",
                  "@keyframes bounce": {
                    "0%, 100%": {
                      transform: "rotate(30deg) translateY(0)",
                    },
                    "50%": {
                      transform: "rotate(30deg) translateY(-8px)",
                    },
                  },
                  zIndex: 2,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#8264ff",
                    color: "#fff",
                    padding: "12px 20px",
                    borderRadius: "20px",
                    fontSize: "16px",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(130, 100, 255, 0.3)",
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: "-6px",
                      left: "15px",
                      transform: "rotate(-30deg)",
                      width: 0,
                      height: 0,
                      borderStyle: "solid",
                      borderWidth: "10px 6px 0 6px",
                      borderColor:
                        "#8264ff transparent transparent transparent",
                    },
                  }}
                >
                  Ask me!
                </Box>
              </Box>
            </Box>
          )}
          <Stack spacing={1} sx={{ width: "100%" }}>
            {(() => {
              const currentTabIndex = dataQuestionsTab?.findIndex(
                (tab) => tab.id === activeTab
              );
              const questionTabs = dataQuestionsTab?.filter(
                (tab) =>
                  tab?.id &&
                  !isNaN(parseInt(tab.id)) &&
                  tab.id !== "1"
              );
              const lastQuestionTab =
                questionTabs?.[questionTabs.length - 1];
              const isLastQuestion = activeTab === lastQuestionTab?.id;

              if (!scoreResult) {
                if (isLastQuestion) {
                  return (
                    <>
                      <Button
                        ref={submitButtonRef}
                        headType="submitAll"
                        className="submit-cta-effect"
                        handleClick={() =>
                          handleEvent({ type: "submit" })
                        }
                        sx={{
                          width: "100%",
                          fontSize: "1.5rem !important",
                          lineHeight: 1,
                          ...fieryHoverSx,
                          borderRadius: "10px",
                          "&::before": { borderRadius: "12px" },
                        }}
                      />
                      <ModalConfirm headType={"submitAnswer"} />
                    </>
                  );
                } else if (currentTabIndex >= 0 && !isLastQuestion) {
                  return (
                    <Button
                      ref={nextButtonRef}
                      headType={"next"}
                      handleClick={() => {
                        handleEvent({ type: "next-question" });
                      }}
                      sx={{
                        width: "100%",
                        borderRadius: "10px",
                        fontSize: "1.5rem !important",
                        lineHeight: 1,
                      }}
                    />
                  );
                }
              }

              return null;
            })()}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
