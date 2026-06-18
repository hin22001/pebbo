"use client";
import React, { Component } from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  Button as ButtonMUI,
} from "@mui/material";
import Alert from "@/elements/alert/Alert";
import Button from "@/elements/button/Button";
import Loader from "@/elements/loader/Loader";
import ContentLayout from "@/components/layouts/ContentLayout/ContentLayout";
import { RichText } from "../../sections";
import QuestionsAPI from "@/app/data/api/QuestionsAPI";
import { Helpers } from "@/src/app/utils";
import { withAppRouter } from "@/app/utils/withAppRouter";
import _ from "lodash";
import PlacementIntroScreen from "./PlacementIntroScreen";
import EncouragementScreen from "./EncouragementScreen";
import { useExerciseEffects } from "@/app/components/templates/QuestionPage/hooks/useExerciseEffects";
import useDashboardSounds from "@/app/components/templates/Dashboard/hooks/useDashboardSounds";

// Show encouragement after this question index (0-based)
const ENCOURAGEMENT_AFTER_INDEX = 4; // After Q5

class PlacementTestPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // stage: 'intro' | 'quiz' | 'encouragement' | 'submitting'
      stage: "intro",
      isLoading: true,
      questions: [],
      currentQuestionIndex: 0,
      paginationIndex: 0, // Start of the window of 5 buttons
      answers: {}, // Map of questionId -> answer
      isSubmitting: false,
      error: null,
      encouragementShown: false, // Don't show twice
    };
    this.editorInstance = null;
  }

  componentDidMount() {
    const { initialQuestions } = this.props;
    console.log("🔍 [PlacementTestPage] componentDidMount");
    console.log("🔍 [PlacementTestPage] initialQuestions count:", initialQuestions?.length);
    console.log("🔍 [PlacementTestPage] initialQuestions[0]?.id:", initialQuestions?.[0]?.id);
    console.log("🔍 [PlacementTestPage] initialQuestions[0]?.question_object type:", typeof initialQuestions?.[0]?.question_object);
    if (initialQuestions?.[0]?.question_object) {
      console.log("🔍 [PlacementTestPage] initialQuestions[0].question_object snippet:", JSON.stringify(initialQuestions[0].question_object)?.slice(0, 500));
    }

    if (initialQuestions?.length > 0) {
      this.setState({
        questions: initialQuestions,
        isLoading: false,
      });
    } else {
      console.log("🔍 [PlacementTestPage] no initialQuestions, calling fetchQuestions()");
      this.fetchQuestions();
    }
    // Disable body scroll for this page
    document.body.style.overflow = "hidden";
  }

  componentWillUnmount() {
    // Re-enable body scroll
    document.body.style.overflow = "auto";
  }

  async fetchQuestions() {
    try {
      const response = await QuestionsAPI.getPlacementQuestions();

      if (response.success && response?.payload?.data) {
        this.setState({
          questions: response.payload.data,
          isLoading: false,
        });
      } else {
        throw new Error(
          response?.message ||
            response?.payload?.message ||
            "Failed to fetch questions",
        );
      }
    } catch (err) {
      console.error("Error fetching placement questions:", err);
      this.setState({
        isLoading: false,
        error: "Unable to load placement test. Please try again.",
      });
    }
  }

  handleRefEditor = (editor) => {
    this.editorInstance = editor;
  };

  saveCurrentAnswer = () => {
    const { currentQuestionIndex, questions, answers } = this.state;
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return answers;

    let currentAnswer = null;
    if (this.editorInstance) {
      const json = this.editorInstance.getJSON();
      const extractedNodes = Helpers.getAttributeRichText(json);

      if (extractedNodes && extractedNodes.length > 0) {
        currentAnswer = extractedNodes.map((node) => ({
          id: node.attrs?.id,
          type: node.type,
          value: node.attrs?.value,
        }));
      }
    }

    const newAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
    this.setState({ answers: newAnswers });
    return newAnswers;
  };

  handleSwitchQuestion = (index) => {
    this.saveCurrentAnswer();
    this.setState({ currentQuestionIndex: index });
  };

  handlePaginationNext = () => {
    const { paginationIndex, questions } = this.state;
    if (paginationIndex + 5 < questions.length) {
      this.setState({ paginationIndex: paginationIndex + 5 });
    }
  };

  handlePaginationPrev = () => {
    const { paginationIndex } = this.state;
    if (paginationIndex - 5 >= 0) {
      this.setState({ paginationIndex: paginationIndex - 5 });
    }
  };

  handleStart = () => {
    if (this.props.playStartExerciseSound) {
      this.props.playStartExerciseSound();
    }
    this.setState({ stage: "quiz" });
  };

  handleNext = () => {
    const { currentQuestionIndex, questions, encouragementShown } = this.state;

    if (this.props.playNextExerciseSound) {
      this.props.playNextExerciseSound();
    }
    const newAnswers = this.saveCurrentAnswer();

    // Show encouragement screen after the midpoint question (if not shown yet)
    if (
      currentQuestionIndex === ENCOURAGEMENT_AFTER_INDEX &&
      !encouragementShown
    ) {
      this.setState({ stage: "encouragement", encouragementShown: true });
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      this.setState({
        currentQuestionIndex: currentQuestionIndex + 1,
      });
      // Adjust pagination window if next question is out of current view
      const { paginationIndex } = this.state;
      if (currentQuestionIndex + 1 >= paginationIndex + 5) {
        this.setState({ paginationIndex: paginationIndex + 5 });
      }
    } else {
      this.submitTest(newAnswers);
    }
  };

  handleEncouragementContinue = () => {
    const { currentQuestionIndex } = this.state;
    this.setState({
      stage: "quiz",
      currentQuestionIndex: currentQuestionIndex + 1,
    });
    // Advance pagination window if needed
    if (currentQuestionIndex + 1 >= this.state.paginationIndex + 5) {
      this.setState({ paginationIndex: this.state.paginationIndex + 5 });
    }
  };

  submitTest = async (finalAnswers) => {
    const answers = finalAnswers || this.state.answers;

    // Ensure ALL questions are represented in the answers object
    const allAnswers = { ...answers };
    this.state.questions.forEach((q) => {
      if (!allAnswers[q.id]) {
        allAnswers[q.id] = null;
      }
    });

    this.setState({ isSubmitting: true, stage: "submitting" });

    try {
      const response = await QuestionsAPI.submitPlacementTest(
        {},
        { answers: allAnswers },
      );

      if (response.success && response?.payload?.data) {
        const { score, total, percentile, gradeLevel } = response.payload.data;
        this.props.router.push({
          pathname: "/onboarding/results",
          query: { score, total, percentile, grade_level: gradeLevel },
        });
      } else {
        throw new Error(response?.payload?.message || "Failed to submit test");
      }
    } catch (err) {
      console.error("Error submitting placement test:", err);
      this.setState({
        isSubmitting: false,
        stage: "quiz",
        error: "Failed to submit answers. Please try again.",
      });
    }
  };

  renderPagination() {
    const { questions, currentQuestionIndex, paginationIndex } = this.state;
    const visibleQuestions = questions.slice(
      paginationIndex,
      paginationIndex + 5,
    );

    return (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
        mt={3}
      >
        <ButtonMUI
          onClick={this.handlePaginationPrev}
          disabled={paginationIndex === 0}
          sx={{
            minWidth: 40,
            height: 40,
            borderRadius: "8px",
            border: "1px solid #E0E0E0",
          }}
        >
          {"<"}
        </ButtonMUI>

        {visibleQuestions.map((q, idx) => {
          const actualIndex = paginationIndex + idx;
          const isActive = currentQuestionIndex === actualIndex;
          const isAnswered =
            this.state.answers[q.id] !== undefined &&
            this.state.answers[q.id] !== null;

          return (
            <ButtonMUI
              key={q.id}
              onClick={() => this.handleSwitchQuestion(actualIndex)}
              sx={{
                minWidth: 46,
                height: 46,
                borderRadius: "8px",
                backgroundColor: isActive
                  ? "#00CDD2"
                  : isAnswered
                    ? "#E0F7F8"
                    : "#F6F9FF",
                color: isActive ? "#fff" : "#231F20",
                border: isActive ? "none" : "1px solid #E0E0E0",
                fontWeight: isActive ? 600 : 500,
                fontSize: "1.1rem",
                "&:hover": {
                  backgroundColor: isActive ? "#00CDD2" : "#EDEDED",
                },
              }}
            >
              {actualIndex + 1}
            </ButtonMUI>
          );
        })}

        <ButtonMUI
          onClick={this.handlePaginationNext}
          disabled={paginationIndex + 5 >= questions.length}
          sx={{
            minWidth: 40,
            height: 40,
            borderRadius: "8px",
            border: "1px solid #E0E0E0",
          }}
        >
          {">"}
        </ButtonMUI>
      </Stack>
    );
  }

  render() {
    const {
      stage,
      isLoading,
      error,
      questions,
      currentQuestionIndex,
      isSubmitting,
    } = this.state;

    // --- Loading state ---
    if (isLoading) {
      return (
        <ContentLayout>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
          >
            <Loader />
          </Box>
        </ContentLayout>
      );
    }

    // --- Intro screen ---
    if (stage === "intro") {
      return (
        <PlacementIntroScreen onStart={this.handleStart} />
      );
    }

    // --- Encouragement screen ---
    if (stage === "encouragement") {
      return (
        <EncouragementScreen
          onContinue={this.handleEncouragementContinue}
          questionsAnswered={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      );
    }

    // --- Submitting overlay ---
    if (stage === "submitting") {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          sx={{
            background: "linear-gradient(160deg, #F8FAFF 0%, #EEF3FF 100%)",
          }}
        >
          <Stack alignItems="center" spacing={3}>
            <Loader />
            <Typography variant="h6" color="text.secondary">
              Calculating your results...
            </Typography>
          </Stack>
        </Box>
      );
    }

    // --- Error state ---
    if (error) {
      return (
        <ContentLayout>
          <Box p={4}>
            <Alert severity="error">{error}</Alert>
            <ButtonMUI onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              Retry
            </ButtonMUI>
          </Box>
        </ContentLayout>
      );
    }

    if (!questions || questions.length === 0) {
      return (
        <ContentLayout>
          <Box p={4} textAlign="center">
            <Typography variant="h5">No questions found.</Typography>
            <ButtonMUI onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              Retry
            </ButtonMUI>
          </Box>
        </ContentLayout>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];

    // --- Quiz stage ---
    return (
      <ContentLayout>
        <Stack
          sx={{
            height: "100vh",
            maxHeight: "100vh",
            overflow: "hidden",
            backgroundColor: "#F8FAFC",
            pt: 4,
            pb: 2,
          }}
        >
          <Box maxWidth="md" mx="auto" width="100%" px={2}>
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.08)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                height: "calc(100vh - 120px)",
              }}
            >
              <Box
                sx={{
                  p: 4,
                  flexGrow: 1,
                  overflowY: "auto",
                  backgroundColor: "#fff",
                }}
              >
                <Typography
                  color="#00CDD2"
                  fontWeight={600}
                  fontSize={28}
                  mb={2}
                  sx={{ fontFamily: "'Advercase', serif !important" }}
                >
                  Question {currentQuestionIndex + 1}
                  <Typography
                    component="span"
                    color="#8D8D8D"
                    fontSize={18}
                    fontWeight={400}
                    ml={1}
                  >
                    / {questions.length}
                  </Typography>
                </Typography>

                <Box
                  key={currentQuestion.id}
                  className="animate__animated animate__fadeIn"
                >
                  {(() => {
                    const savedAnswer = this.state.answers[currentQuestion.id];
                    const questionObject = savedAnswer
                      ? Helpers.completeRichTextValue(
                          currentQuestion.question_object,
                          savedAnswer,
                        )
                      : currentQuestion.question_object;

                    return (
                      <RichText
                        key={currentQuestion.id}
                        value={questionObject}
                        readOnly={true}
                        hideMenuBar={true}
                        refEditor={this.handleRefEditor}
                        questionId={currentQuestion.id}
                      />
                    );
                  })()}
                </Box>
              </Box>

              <Box
                sx={{
                  p: 3,
                  borderTop: "1px solid #F1F5F9",
                  backgroundColor: "#fff",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box flex={1}>{this.renderPagination()}</Box>

                  <Box ml={4}>
                    <Button
                      label={
                        currentQuestionIndex === questions.length - 1
                          ? "Finish Test"
                          : "Next"
                      }
                      handleClick={this.handleNext}
                      disabled={isSubmitting}
                      sx={{
                        minWidth: "160px",
                        height: "54px",
                        fontSize: "1.2rem !important",
                        borderRadius: "12px",
                        backgroundColor: "#8264FF",
                        "&:hover": { backgroundColor: "#6D52E6" },
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            </Card>
          </Box>
        </Stack>
      </ContentLayout>
    );
  }
}

function PlacementTestPageWithEffects(props) {
  const { playNextExerciseSound } = useExerciseEffects();
  const { playStartExerciseSound } = useDashboardSounds();
  return (
    <PlacementTestPage
      {...props}
      playNextExerciseSound={playNextExerciseSound}
      playStartExerciseSound={playStartExerciseSound}
    />
  );
}

export default withAppRouter(PlacementTestPageWithEffects);
