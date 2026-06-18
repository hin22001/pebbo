"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  Stack,
  Typography,
  Collapse,
  Box,
  Paper,
} from "@mui/material";
import { locale } from "@/app/data/locale";
import {
  Button,
  ImageHandler,
  IconButton,
} from "@/components/elements";
import { Tooltip } from "@/elements";
import { useQuestionFlow } from "@/app/components/templates/QuestionPage/hooks/useQuestionFlow";
import dayjs from "dayjs";

const RichText = dynamic(
  () =>
    import("@/app/components/sections/richText").then((m) => ({ default: m.RichText })),
  { ssr: false }
);

export default function AdminPreviewScreen({
  mainClassName = "template-question-page",
  head,
  activeTab,
  dataQuestions,
  dataQuestionsTab,
  scoreResult,
  dataCategory,
  refRichText,
  onRefRichText,
  submitButtonRef,
  handleEvent,
  getAccuracyGif,
  getCategoryLabel,
  getDifficultyLabel,
  onIssueReport,
}) {
  // Navigation hook (arrows, localStorage)
  useQuestionFlow({
    activeTab,
    tabs: dataQuestionsTab,
    onSwitchTab: (nextId) =>
      handleEvent({ type: "switch-tab", value: nextId }),
    onNextQuestion: () => handleEvent({ type: "next-question" }),
    onPreviousQuestion: () => handleEvent({ type: "previous-question" }),
  });

  return (
    <Stack
      style={{
        backgroundColor: "#fff",
        borderRadius: "10px",
        padding: "1.5rem 2.5rem",
        position: "relative",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
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
            {locale(head?.header?.title)} (ADMIN PREVIEW)
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
          gridTemplateColumns: "80px minmax(0, 2.2fr) 220px",
          columnGap: "2.5rem",
          rowGap: "1.5rem",
          // REMOVE TIMER/LAYOUT RESTRICTIONS: 
          // allow content to expand
          minHeight: "600px",
          alignItems: "start",
        }}
      >
        {/* LEFT SIDEBAR - Vertical Question Navigation */}
        <Stack sx={{ paddingTop: "20px", position: "sticky", top: 20 }}>
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
                        ? "#8264FF"
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
                        ? "none"
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
                        filter: "brightness(0.9)"
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

        {/* CENTER CONTENT - Questions + primary actions */}
        <Stack sx={{ padding: "20px" }}>
          <Stack className={mainClassName + "-question "}>
            {dataQuestions?.length > 0 &&
              dataQuestions?.map((item, index) => {
                const itemResult = scoreResult?.dataQuestion?.[index] || scoreResult?.data?.[index];

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
                        borderRadius: "10px",
                        paddingTop: "2rem",
                        paddingBottom: "3rem",
                        boxShadow:
                          "0px 4px 16px 0px rgba(0, 0, 0, 0.28) !important",
                        minHeight: "500px",
                        backgroundColor: "#f6f9ff",
                      }}
                      className={mainClassName + "-wrapper"}
                    >
                      <Stack
                        pt={5}
                        style={{
                          marginBottom: "-75px",
                          zIndex: 1,
                        }}
                        width="100%"
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
                          </Typography>
                        )}
                        <Stack mt={1} direction="row" width="100%" flexWrap="wrap" gap={1}>
                          {item?.id !== 1 && (
                            <>
                              <Stack direction="row" alignItems="center">
                                <Typography color="#8D8D8D" fontSize={14}>{locale(head?.category)}:</Typography>
                                <Box sx={{ ml: 1, px: 1, py: 0.5, bgcolor: "rgba(0,0,0,0.05)", borderRadius: 1 }}>
                                  <Typography fontSize={14}>
                                    {getCategoryLabel(item?.outer_category, dataCategory)}
                                  </Typography>
                                </Box>
                              </Stack>
                              <Stack direction="row" alignItems="center">
                                <Typography color="#8D8D8D" fontSize={14}>{locale(head?.difficulty)}:</Typography>
                                <Box sx={{ ml: 1, px: 1, py: 0.5, bgcolor: "rgba(0,0,0,0.05)", borderRadius: 1 }}>
                                  <Typography fontSize={14}>{getDifficultyLabel(item?.difficulty)}</Typography>
                                </Box>
                              </Stack>
                              <Stack direction="row" alignItems="center">
                                <Typography color="#8D8D8D" fontSize={14}>{locale(head?.questionId)}:</Typography>
                                <Box sx={{ ml: 1, px: 1, py: 0.5, bgcolor: "rgba(0,0,0,0.05)", borderRadius: 1 }}>
                                  <Typography fontSize={14}>{item.id}</Typography>
                                </Box>
                                {scoreResult && (
                                  <Tooltip title="Report Issue">
                                    <IconButton
                                      icon="flag"
                                      size="sm"
                                      handleClick={() => onIssueReport?.(item.id)}
                                      sx={{ ml: 1 }}
                                    />
                                  </Tooltip>
                                )}
                              </Stack>
                            </>
                          )}
                        </Stack>
                      </Stack>

                      {item?.id !== 1 ? (
                        <Box sx={{ width: "90%", mt: 10 }}>
                          {scoreResult ? (
                            <RichText
                              // Use elementKey (when present) or fall back to id
                              // so that fetching a new question ID remounts the
                              // editor and does not reuse stale content.
                              key={itemResult?.elementKey || `result-${item.id}`}
                              value={
                                itemResult?.question ||
                                itemResult?.question_object ||
                                item?.question ||
                                item?.question_object
                              }
                              readOnly={true}
                              questionId={item.id}
                            />
                          ) : (
                            <RichText
                              key={`preview-${item.id}`}
                              refEditor={(instance) => {
                                if (instance && onRefRichText) {
                                  onRefRichText(item.id, instance);
                                }
                              }}
                              value={item?.question}
                              readOnly={true}
                              questionId={item.id}
                            />
                          )}
                        </Box>
                      ) : (
                        <Stack sx={{ p: 4, alignItems: "center" }}>
                           {getAccuracyGif && (
                             <img src={getAccuracyGif(scoreResult?.percentage)} alt="result" width={180} />
                           )}
                           <Typography variant="h5" mt={2}>{scoreResult?.overallScore} / {scoreResult?.totalQuestion}</Typography>
                           <Typography variant="h6" color="primary">{scoreResult?.percentage}% Accuracy</Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Collapse>
                );
              })}
          </Stack>

          {/* Primary action centered below the card */}
          {!scoreResult && (
            <Box
              sx={{
                mt: 4,
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                ref={submitButtonRef}
                theme="orange"
                size="lg"
                handleClick={() => handleEvent({ type: "submit" })}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: "1.8rem",
                  borderRadius: "12px",
                  boxShadow: "0px 8px 0px #C63E00",
                }}
              >
                {locale(head?.submitAll || "Submit All")}
              </Button>
            </Box>
          )}

          {scoreResult && (
            <Box
              sx={{
                mt: 4,
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                theme="light"
                size="lg"
                handleClick={() => handleEvent({ type: "back" })}
                sx={{ px: 5, py: 2, borderRadius: "12px" }}
              >
                Reset Preview
              </Button>
            </Box>
          )}
        </Stack>

        {/* RIGHT SIDEBAR - SUBMIT ONLY, NO TIMER */}
        <Stack
          spacing={4}
          width="100%"
          sx={{ paddingTop: "20px", position: "sticky", top: 20 }}
        />
      </Stack>
    </Stack>
  );
}
