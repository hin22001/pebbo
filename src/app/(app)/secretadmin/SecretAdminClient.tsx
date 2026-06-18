"use client";

import React, { useState } from "react";
import { Helpers } from "@/app/utils";
import QuestionsAPI from "@/app/data/api/QuestionsAPI";
import Loader from "@/elements/loader/Loader";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { getDataHead } from "@/app/data/head";
import AdminPreviewScreen from "./AdminPreviewScreen";
import * as QuestionPageUtils from "@/app/components/templates/QuestionPage/questionPageUtils";

// For admin preview we want the same experience as students:
// no correct answers or explanations should be visible until after submit.
// This helper mirrors the server-side placement sanitizer and strips
// solution-specific attributes from the question_object for the initial render.
function stripAnswersFromQuestionObject(rawQuestionObject: any): any {
  try {
    if (!rawQuestionObject) return rawQuestionObject;

    const root = structuredClone(rawQuestionObject);
    const stack = [root];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;

      if (current.content && Array.isArray(current.content)) {
        current.content.forEach((child: any) => stack.push(child));
      }

      if (current.attrs) {
        if (current.attrs.isCorrect !== undefined) {
          delete current.attrs.isCorrect;
        }

        if (current.attrs.explanation !== undefined) {
          current.attrs.explanation = "";
        }

        if (current.attrs.answer !== undefined) {
          current.attrs.answer = "";
        }

        if (current.attrs.answers !== undefined) {
          // Clear dropdown answers so the field behaves like a fresh input.
          current.attrs.answers = "[]";
          current.attrs.multiple = false;
        }
      }
    }

    return root;
  } catch {
    return rawQuestionObject;
  }
}

// For debugging in admin preview: extract the "correct" answers from a TipTap
// question_object so we can log them alongside the user's submitted answers.
function extractAnswersFromQuestionObject(rawQuestionObject: any) {
  const result: Array<{
    type: "answer" | "answers";
    value: any;
  }> = [];

  try {
    if (!rawQuestionObject) return result;

    // Question objects can come back as JSON strings from the DB.
    let source = rawQuestionObject;
    if (typeof source === "string") {
      try {
        source = JSON.parse(source);
      } catch {
        return result;
      }
    }

    const root = structuredClone(source);
    const stack = [root];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;

      if (current.content && Array.isArray(current.content)) {
        current.content.forEach((child: any) => stack.push(child));
      }

      if (current.attrs) {
        if (current.attrs.answer !== undefined) {
          result.push({ type: "answer", value: current.attrs.answer });
        }
        if (current.attrs.answers !== undefined) {
          result.push({ type: "answers", value: current.attrs.answers });
        }
      }
    }
  } catch {
    // best-effort only
  }

  return result;
}


export default function SecretAdminClient() {
  const [questionIdInput, setQuestionIdInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [head, setHead] = useState<any>(null);

  // Load head on mount
  React.useEffect(() => {
    setHead(getDataHead({ name: "headQuestionPage" }));
  }, []);
  
  // State for AdminPreviewScreen
  const [dataQuestions, setDataQuestions] = useState<any[] | null>(null);
  const [dataQuestionsTab, setDataQuestionsTab] = useState<any[] | null>(null);
  const [activeTab, setActiveTab] = useState<any>(null);
  const [scoreResult, setScoreResult] = useState<any>(null);
  
  // Use refs for stability
  const refRichText = React.useRef<any>({});
  const submitButtonRef = React.useRef<any>(null);

  const handleFetchQuestion = async () => {
    if (!questionIdInput.trim()) return;

    console.log("Fetching question:", questionIdInput);
    setLoading(true);
    setScoreResult(null); // Reset score when fetching new
    refRichText.current = {}; // Reset editors
    try {
      const response = (await QuestionsAPI.getQuestionById({ question_id: questionIdInput })) as any;
      console.log("Fetch response:", response);
      const payload = response?.payload || response;
      if (payload?.status === 200 && payload?.data) {
        const item = payload.data;

        const sanitizedQuestionObject = stripAnswersFromQuestionObject(
          item?.question_object,
        );

        const qData = Helpers.filterObjectByKey(
          {
            ...(item || {}),
            // Use sanitized question for initial preview so the admin
            // does not see the correct answer/explanation before submit.
            question: sanitizedQuestionObject ?? item?.question_object,
          },
          "question_object"
        );

        setDataQuestions([qData]);
        setDataQuestionsTab([{ id: item.id, label: "Q1" }]);
        setActiveTab(item.id);
      } else {
        Helpers.openSnackbar({ message: "Question not found or error occurred." });
        setDataQuestions(null);
      }
    } catch (err: any) {
      console.error(err);
      Helpers.openSnackbar({ message: err?.message || "Error fetching question." });
      setDataQuestions(null);
    } finally {
      setLoading(false);
    }
  };

  // Inject user + correct answers back into the TipTap JSON with correctness flags
  function injectReviewData(
    content: any,
    userAnswers: any[],
    modelAnswers: Array<{ type: "answer" | "answers"; value: any }>,
    accuracy: number | boolean,
  ) {
    if (!content) return content;
    try {
      const isStr = typeof content === "string";
      const json = isStr ? JSON.parse(content) : structuredClone(content);
      if (!json?.content) return content;

      let userIdx = 0;
      let modelIdx = 0;
      const isCorrectOverall = accuracy === true || accuracy === 1;

      const parseModelValue = (entry: { type: string; value: any }) => {
        if (!entry) return { labels: [], raw: entry?.value };
        let v = entry.value;
        if (typeof v === "string") {
          try {
            const parsed = JSON.parse(v);
            if (Array.isArray(parsed)) {
              return {
                labels: parsed.map((x: any) =>
                  typeof x === "string" ? x : x?.label ?? x?.id ?? "",
                ),
                raw: parsed,
              };
            }
          } catch {
            // fall through
          }
        }
        const label = v != null ? String(v) : "";
        return { labels: [label], raw: v };
      };

      const walk = (nodes: any[]): any[] =>
        (nodes || []).map((n) => {
          if (!n) return n;
          let updated = { ...n };

          if (["dropdown", "textfield", "fractionField"].includes(n.type)) {
            const user = userAnswers[userIdx++] || null;
            const model = modelAnswers[modelIdx++] || null;

            const userValue =
              user?.attrs?.value ??
              (Array.isArray(user?.answers)
                ? user.answers[0]
                : user?.value ?? "");

            const { labels: correctLabels, raw: correctRaw } =
              model ? parseModelValue(model) : { labels: [], raw: null };

            const answersPayload =
              correctLabels.length > 0
                ? correctLabels.map((lbl) => ({ label: lbl, id: lbl }))
                : [];

            updated.attrs = {
              ...(n.attrs || {}),
              value: userValue,
              // correct answers as dropdown options
              answers:
                answersPayload.length > 0
                  ? JSON.stringify(answersPayload)
                  : n.attrs?.answers,
              // overall correctness flag for this blank
              isCorrect: isCorrectOverall,
              // preserve any existing explanation
              explanation: n.attrs?.explanation ?? "",
              // raw model value if needed for debugging
              correctRaw,
            };
          }

          if (n.content) {
            updated.content = walk(n.content);
          }
          return updated;
        });

      const result = { ...json, content: walk(json.content) };
      return isStr ? JSON.stringify(result) : result;
    } catch {
      return content;
    }
  }

  const handleCompleteQuestion = async () => {
    try {
      setLoading(true);

      // Collect answers from refs using the same logic as student flow
      const submissionData = dataQuestions?.map((q) => {
        // Try to get editor instance that was stored via refEditor callback
        const editorInstance = refRichText.current[q.id];

        let answerObjects: any[] = [];

        // Try reading from stored editor instance first
        if (editorInstance && editorInstance?.state?.doc?.toJSON) {
          const docJson = editorInstance.state.doc.toJSON();
          console.log("[SecretAdmin] docJson for Q" + q.id, docJson);
          answerObjects = Helpers.getAttributeRichText(docJson) || [];
          console.log("[SecretAdmin] answerObjects for Q" + q.id, answerObjects);
        }

        // Process answers in the same way as student flow
        const processedAnswers = answerObjects
          .filter((item: any) => !!item) // Filter out null/undefined
          .map((item: any) => {
            const val = item?.attrs?.value;
            const unit = item?.attrs?.unit;

            const sliceUnit = (u: string | undefined, label: string) => {
              if (u) return label.replace(" " + u, "");
              return label;
            };

            switch (item?.type) {
              case "DropdownReactComponent": {
                const isArray = Array.isArray(val);
                const answers = isArray
                  ? val.flatMap((v: any) => sliceUnit(unit, v?.label ?? ""))
                  : [sliceUnit(unit, val?.label ?? "")];
                return { answers, attrs: item?.attrs };
              }
              case "TextFieldReactComponent": {
                return {
                  answers: [val != null ? String(val) : ""],
                  attrs: item?.attrs,
                };
              }
              case "FractionReactComponent": {
                const numerator = val?.numerator ?? "";
                const denominator = val?.denominator ?? "";
                return {
                  answers: [`${numerator}/${denominator}`],
                  attrs: item?.attrs,
                };
              }
              default: {
                return { answers: [String(val || "")], attrs: item?.attrs };
              }
            }
          });

        console.log("[SecretAdmin] Answers collected for Q" + q.id, {
          editorInstanceFound: !!editorInstance,
          extractedAnswerCount: answerObjects.length,
          processedAnswerCount: processedAnswers.length,
          processedAnswers: processedAnswers,
        });

        return {
          question_id: Number(q.id),
          user_answers:
            processedAnswers && processedAnswers.length
              ? processedAnswers.map((a: any) => ({
                  answers: a?.answers || [""],
                }))
              : [{ answers: [""] }],
          time_taken: 10,
        };
      });

      console.log("[SecretAdmin] Submission payload", {
        questionCount: submissionData?.length,
        allAnswers: submissionData,
      });

      // Detailed view of the first answer item
      if (submissionData?.[0]) {
        console.log("[SecretAdmin] First answer detailed:", {
          question_id: submissionData[0].question_id,
          user_answers: submissionData[0].user_answers,
          user_answers_structure: submissionData[0].user_answers?.[0],
          time_taken: submissionData[0].time_taken,
        });
      }

      const body = { all_answers: submissionData };
      const response = (await QuestionsAPI.postSecretAdminCompleteQuestion(
        {},
        body,
      )) as any;

      console.log("[SecretAdmin] API Response", { success: response?.success, status: response?.status });

      if (response?.success) {
        const dataQuestionsRes = response?.data || response?.payload?.data;
        const totalQuestion = dataQuestionsRes?.length || 1;
        let overallScore = 0;

        const refactorDataQuestions = dataQuestionsRes?.map((item: any, index: number) => {
          const accuracy = item?.accuracy || 0;
          overallScore = overallScore + accuracy;

          // Get the answers we submitted to reconstruct the rich text with feedback
          const subItem = submissionData?.[index]; // Use index to match order
          if (!subItem) {
            console.warn("[SecretAdmin] No submission data found for question at index", index);
          }

          const userAnswersArray = subItem?.user_answers || [];

          // Extract correct answers from original question_object
          const modelAnswers = extractAnswersFromQuestionObject(
            item?.question_object,
          );

          const isCorrectOverall = accuracy === 1 || accuracy === true;

          // Log exactly what you asked for
          console.log("[SecretAdmin] Question review", {
            questionId: item?.id,
            "my answer": userAnswersArray,
            "correct answer": modelAnswers,
            correct: isCorrectOverall,
          });

          // Inject user + correct answers and correctness flags into question_object
          const question = injectReviewData(
            item?.question_object,
            userAnswersArray,
            modelAnswers,
            accuracy,
          );

          return Helpers.filterObjectByKey(
            {
              ...(item || {}),
              question,
              elementKey: "question-key-admin-" + item?.id,
              accuracy: accuracy,
            },
            "question_object"
          );
        });

        const percentage = totalQuestion > 0 ? Math.round((overallScore / totalQuestion) * 100) : 0;

        setScoreResult({
          success: response?.success,
          status: response?.status,
          message: response?.message,
          coins_awarded: response?.coins_awarded || response?.payload?.coins_awarded || 0,
          overallScore,
          totalQuestion,
          percentage,
          type: percentage > 50 ? "great" : "notGreat",
          dataQuestion: refactorDataQuestions,
          data: dataQuestionsRes,
        });
      } else {
        const errMessage = response?.message || "Failed to submit answer.";
        console.error("[SecretAdmin] Submission failed", { response, errMessage });
        Helpers.openSnackbar({ message: errMessage });
      }
    } catch (err: any) {
      console.error("[SecretAdmin] Exception during submission", err);
      Helpers.openSnackbar({ message: err?.message || "Error submitting answer." });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminEvent = async (params: any) => {
    switch (params.type) {
      case "submit":
        await handleCompleteQuestion();
        break;
      case "switch-tab":
        setActiveTab(params.value);
        break;
      case "back":
        setScoreResult(null);
        break;
    }
  };

  const onRefRichText = (id: number, instance: any) => {
    if (instance) {
      refRichText.current[id] = instance;
    }
  };


  return (
    <Box sx={{ p: 4, width: "100%", maxWidth: "1400px", margin: "0 auto", minHeight: "100vh" }}>
      <Typography variant="h4" mb={2}>Secret Admin Question Preview</Typography>
      
      <Paper sx={{ p: 3, mb: 4, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="Question ID"
          variant="outlined"
          value={questionIdInput}
          onChange={(e) => setQuestionIdInput(e.target.value)}
          size="small"
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleFetchQuestion}
          disabled={loading || !questionIdInput}
        >
          Fetch Question
        </Button>
      </Paper>

      {loading && <Box my={4}><Loader isOpen={loading} /></Box>}

      {dataQuestions && dataQuestionsTab && (
          <AdminPreviewScreen
            head={head || {}}
            activeTab={activeTab}
            dataQuestions={dataQuestions}
            dataQuestionsTab={dataQuestionsTab}
            scoreResult={scoreResult}
            dataCategory={[]}
            onRefRichText={onRefRichText}
            handleEvent={handleAdminEvent}
            refRichText={refRichText}
            submitButtonRef={submitButtonRef}
            getAccuracyGif={QuestionPageUtils.getAccuracyGif}
            getCategoryLabel={QuestionPageUtils.getCategoryLabel}
            getDifficultyLabel={QuestionPageUtils.getDifficultyLabel}
            onIssueReport={(id: number) => alert(`Reported issue for question ${id}`)}
          />
      )}
    </Box>
  );
}

