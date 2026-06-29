"use client";

import { useState, useCallback } from "react";
import _ from "lodash";
import { Helpers } from "@/src/app/utils";
import { Auth } from "@/src/app/data/local";
import UserAPI from "@/src/app/data/api/UserAPI";
import { locale } from "@/app/data/locale";
import { getDataHead as getDataHeadDefault } from "@/app/data/head";
import * as QuestionPageUtils from "../questionPageUtils";

// ---------------------------------------------------------------------------
// assignDataAnswerCore - Pure validation/refactor logic extracted from class
// ---------------------------------------------------------------------------

const MAIN_CLASS_NAME = "template-question-page";

function sliceUnit(unit: string | undefined, label: string): string {
  if (unit) return label.replace(" " + unit, "");
  return label;
}

export type AssignDataAnswerContext = {
  dataAnswer: Array<Record<string, unknown>> | null;
  activeTab: string | number | null;
  refRichText: Record<string, unknown>;
  activeScreen: string;
  mainClassName?: string;
};

export type AssignDataAnswerResult = {
  dataAnswer: Array<Record<string, unknown>>;
  isInvalid: boolean;
} | null;

/**
 * Pure validation and answer-refactor logic. Mirrors legacy assignDataAnswer.
 * Returns refactored dataAnswer and isInvalid; triggers no side effects.
 */
export function assignDataAnswerCore(
  ctx: AssignDataAnswerContext,
  shouldValidate: boolean
): AssignDataAnswerResult {
  const {
    dataAnswer,
    activeTab,
    refRichText,
    activeScreen,
    mainClassName = MAIN_CLASS_NAME,
  } = ctx;

  if (!dataAnswer || activeTab == null) return null;

  const foundIndex = dataAnswer.findIndex((item: Record<string, unknown>) => item.id == activeTab);
  let value: unknown =
    _.has(refRichText, String(activeTab))
      ? refRichText[String(activeTab)]
      : dataAnswer[foundIndex]?.["question"] as unknown;

  if (!value && activeScreen === "question") {
    const questionWrapper = document.querySelector(`.${mainClassName}-wrapper.active`);
    if (questionWrapper) {
      const richTextEditor = questionWrapper.querySelector(".ProseMirror");
      if (richTextEditor) {
        try {
          const editor = (richTextEditor as Record<string, unknown>).__prosemirrorView;
          if (editor && (editor as { state?: { doc?: { toJSON?: () => unknown } } }).state?.doc) {
            value = (editor as { state: { doc: { toJSON: () => unknown } } }).state.doc.toJSON();
          }
        } catch {
          // ignore
        }
      }
      if (!value && dataAnswer[foundIndex]) {
        value = (dataAnswer[foundIndex] as Record<string, unknown>).question;
      }
    }
  }

  if (!value) return null;

  let isInvalid = false;
  const arrAnswer = Helpers.getAttributeRichText(value) as Array<Record<string, unknown>>;
  const refactorDataAnswer = [...(dataAnswer || [])];

  if (foundIndex >= 0 && arrAnswer) {
    const refactorArrAnswer = arrAnswer.map((item: Record<string, unknown>, index: number) => {
      const val = (item?.attrs as Record<string, unknown>)?.value;
      const unit = (item?.attrs as Record<string, unknown>)?.unit as string | undefined;

      if (val) {
        switch (item?.type) {
          case "DropdownReactComponent": {
            const isArray = Array.isArray(val);
            const labelVal = isArray
              ? (val as Array<{ label?: string }>).flatMap((it) =>
                  sliceUnit(unit as string | undefined, (it?.label ?? "").toString())
                )
              : [sliceUnit(unit, ((val as { label?: string })?.label ?? "").toString())];
            return { answers: labelVal, attrs: item.attrs };
          }
          case "TextFieldReactComponent":
            return { answers: [val], attrs: item.attrs };
          case "FractionReactComponent":
            return { answers: [val], attrs: item.attrs };
          default:
            return { answers: [val], attrs: item.attrs };
        }
      }
      isInvalid = true;
      return null;
    });

    const validAnswers = refactorArrAnswer.filter((item) => item !== null);
    const totalFields = arrAnswer?.length || 0;

    if (validAnswers.length > 0 && validAnswers.length === totalFields) {
      (refactorDataAnswer[foundIndex] as Record<string, unknown>).answer = validAnswers;
      isInvalid = false;
    } else {
      isInvalid = true;
    }

    (refactorDataAnswer[foundIndex] as Record<string, unknown>).isInvalid = isInvalid;
  } else {
    isInvalid = true;
  }

  return { dataAnswer: refactorDataAnswer, isInvalid };
}

// ---------------------------------------------------------------------------
// injectReviewData - Injects answers/explanation into question content
// ---------------------------------------------------------------------------

function injectReviewData(
  content: unknown,
  answers: unknown[],
  explanation: unknown,
  accuracy: unknown
): unknown {
  if (!content) return content;
  try {
    const isStr = typeof content === "string";
    const json = isStr ? (JSON.parse(content as string) as Record<string, unknown>) : (content as Record<string, unknown>);
    if (!json?.content) return content;

    let idx = 0;
    const walk = (nodes: unknown[]): unknown[] =>
      (nodes || []).map((n) => {
        if (!n) return n;
        const node = n as Record<string, unknown>;
        let updated = { ...node };
        if (["dropdown", "textfield", "fractionField"].includes((node.type as string) || "")) {
          const ansArr = Array.isArray(answers) ? answers : [];
          const ans = ansArr[idx++] as Record<string, unknown> | undefined;
          const userValue =
            (node.attrs as Record<string, unknown>)?.value ||
            (ans?.attrs as Record<string, unknown>)?.value ||
            (node.type === "textfield" ? (ans?.answers as unknown[])?.[0] : null);
          updated.attrs = {
            ...((node.attrs as Record<string, unknown>) || {}),
            value: userValue,
            answers: ans?.answers
              ? JSON.stringify(
                  ((ans.answers as unknown[]) || []).map((a) => ({ label: a, id: a }))
                )
              : (node.attrs as Record<string, unknown>)?.answers,
            explanation: explanation ?? (node.attrs as Record<string, unknown>)?.explanation,
            isCorrect: (ans as Record<string, unknown>)?.isCorrect ?? (accuracy === true || accuracy === 1),
          };
        }
        if (node.content) updated.content = walk(node.content as unknown[]);
        return updated;
      });

    return { ...json, content: walk(json.content as unknown[]) };
  } catch {
    return content;
  }
}

// ---------------------------------------------------------------------------
// updateTabQuestion - Applies correct/wrong styling to tabs
// ---------------------------------------------------------------------------

function updateTabQuestion(
  dataQuestionsTab: Array<Record<string, unknown>> | null,
  resultQuestion: Array<Record<string, unknown>> | undefined,
  head: Record<string, unknown> | null
): Array<Record<string, unknown>> {
  if (!dataQuestionsTab || !resultQuestion || !head) return dataQuestionsTab || [];
  const tabStatus = (head?.tabs as Record<string, Record<string, Record<string, unknown>>>)?.status;
  if (!tabStatus) return dataQuestionsTab;

  return dataQuestionsTab.map((item) => {
    const currentValidation = resultQuestion.find((v) => v.id == item?.id);
    const status = currentValidation?.accuracy ? "correct" : "wrong";
    const statusConfig = tabStatus[status]?.tabItem;
    return { ...item, ...statusConfig };
  });
}

// ---------------------------------------------------------------------------
// useQuestionResults
// ---------------------------------------------------------------------------

export type UseQuestionResultsOptions = {
  postCompleteQuestion: (params: {
    dataAnswer: Array<Record<string, unknown>>;
    dataTime: unknown[];
  }) => Promise<Record<string, unknown> | undefined>;
  assignMainLayout?: (payload: Record<string, unknown>) => void | Promise<void>;
  getDataHead?: () => Record<string, unknown> | null;
  onPlayAlertSound?: () => void;
  onPlayResultSound?: (percentage: number) => void;
  onInvalidAnswer?: (mainClassName: string) => void;
};

export type SubmitContext = {
  dataAnswer: Array<Record<string, unknown>> | null;
  dataTime: unknown[] | null;
  activeTab: string | number | null;
  dataQuestions: Array<Record<string, unknown>> | null;
  dataQuestionsTab: Array<Record<string, unknown>> | null;
  head: Record<string, unknown> | null;
  refRichText: Record<string, unknown>;
  activeScreen: string;
  mainClassName: string;
};

export type SubmitSuccessUpdates = {
  showResult: boolean;
  scoreResult: Record<string, unknown>;
  openScoreResult: boolean;
  modalDrawer: Record<string, unknown>;
  dataQuestionsTab: Array<Record<string, unknown>>;
  dataQuestions: Array<Record<string, unknown>>;
  activeTab: number;
  dataAnswer?: Array<Record<string, unknown>>;
};

export type UseQuestionResultsResult = {
  scoreResult: Record<string, unknown> | null;
  openScoreResult: boolean;
  openScoreResultModal: () => void;
  closeScoreResultModal: () => void;
  handleSubmit: (
    ctx: SubmitContext,
    opts?: { onSuccess: (updates: SubmitSuccessUpdates) => void }
  ) => Promise<SubmitSuccessUpdates | null>;
  assignDataAnswer: (
    ctx: AssignDataAnswerContext,
    shouldValidate: boolean
  ) => AssignDataAnswerResult;
};

export function useQuestionResults(
  options: UseQuestionResultsOptions
): UseQuestionResultsResult {
  const {
    postCompleteQuestion,
    assignMainLayout,
    getDataHead,
    onPlayAlertSound,
    onPlayResultSound,
    onInvalidAnswer,
  } = options;

  const [scoreResult, setScoreResult] = useState<Record<string, unknown> | null>(null);
  const [openScoreResult, setOpenScoreResult] = useState(false);

  const openScoreResultModal = useCallback(() => setOpenScoreResult(true), []);
  const closeScoreResultModal = useCallback(() => setOpenScoreResult(false), []);

  const handleSubmit = useCallback(
    async (
      ctx: SubmitContext,
      opts?: { onSuccess: (updates: SubmitSuccessUpdates) => void }
    ): Promise<SubmitSuccessUpdates | null> => {
      const {
        dataAnswer,
        dataTime,
        activeTab,
        dataQuestions,
        dataQuestionsTab,
        head,
        refRichText,
        activeScreen,
        mainClassName,
      } = ctx;

      const dataTimeComputed = QuestionPageUtils.getTimeDuration(dataTime, activeTab);
      const assignResult = assignDataAnswerCore(
        { dataAnswer, activeTab, refRichText, activeScreen, mainClassName },
        true
      );

      if (!assignResult) return null;
      const { dataAnswer: refactoredDataAnswer, isInvalid } = assignResult;

      if (isInvalid) {
        onPlayAlertSound?.();
        Helpers.openSnackbar({ name: "incompleteForm" });
        onInvalidAnswer?.(mainClassName);
        return null;
      }

      if (!postCompleteQuestion) return null;

      const result = await postCompleteQuestion({
        dataAnswer: refactoredDataAnswer,
        dataTime: dataTimeComputed,
      });

      const apiResponse = (result as Record<string, unknown>)?.payload || result;
      if (!apiResponse) return null;

      const questionsRaw =
        (apiResponse.dataQuestion as Array<Record<string, unknown>>) ||
        (apiResponse.data as Array<Record<string, unknown>>) ||
        [];
      const questionsEnriched = Array.isArray(questionsRaw)
        ? questionsRaw.map((q: Record<string, unknown>) => {
            const content = q.question || q.question_object;
            return {
              ...q,
              question: injectReviewData(
                content,
                (q.answer || q.answers) as unknown[],
                q.explanation,
                q.accuracy
              ),
              elementKey: q.elementKey || `review-key-${q.id || Math.random()}`,
            };
          })
        : [];

      const scoreResultShape: Record<string, unknown> = {
        ...apiResponse,
        dataQuestion:
          questionsEnriched.length > 0 ? questionsEnriched : questionsRaw,
        percentage:
          (apiResponse.percentage as number) ||
          Math.round(
            ((refactoredDataAnswer?.filter((a) => (a as Record<string, unknown>)?.isCorrect)?.length || 0) /
              (refactoredDataAnswer?.length || 1)) *
              100
          ),
      };

      if (typeof window !== "undefined" && (window as Record<string, unknown>).triggerCoinIncrement) {
        const coinsAwarded = (apiResponse.coins_awarded as number) || 0;
        // Land the chip on the authoritative DB total (already includes the
        // award) instead of blindly adding — keeps it in sync, no drift.
        const totalCoins = apiResponse.total_coins as number | undefined;
        if (coinsAwarded > 0) {
          ((window as Record<string, unknown>).triggerCoinIncrement as (
            n: number,
            target?: number,
          ) => void)(coinsAwarded, totalCoins);
        }
      }

      // Update the star chip instantly to the authoritative DB total.
      const totalStars = apiResponse.total_stars as number | undefined;
      if (totalStars != null) {
        Auth.syncStars(totalStars);
      }

      const todayStr = new Date().toISOString().split("T")[0];
      UserAPI.postUpdateTodos(["exercise"], todayStr).catch((e) =>
        console.error("Failed to sync exercise todo:", e)
      );

      const headData =
        head ||
        (getDataHead ? getDataHead() : null) ||
        getDataHeadDefault({ name: "headQuestionPage" });
      const modalDrawerTitle =
        (headData?.modalDrawer as Record<string, unknown>)?.title ||
        (headData?.cardQuestionTryAgain as Record<string, unknown>)?.title;
      const refactorModalDrawer = {
        ...((headData?.modalDrawer as Record<string, unknown>) || {}),
        isOpen: _.uniqueId(),
        title: locale(modalDrawerTitle as Record<string, string>, {
          value: refactoredDataAnswer?.length,
        }),
      };

      const refactorQuestionTab = updateTabQuestion(
        dataQuestionsTab,
        scoreResultShape.dataQuestion as Array<Record<string, unknown>>,
        headData
      );

      let newDataQuest = [...(dataQuestions || [])];
      let newDataQuestTab = [...refactorQuestionTab];

      newDataQuest.push({
        id: 1,
        difficulty: 1,
        outer_category: 1,
        question: null,
      });
      newDataQuestTab.push({
        id: 1,
        label: locale((headData?.result as Record<string, string>) || "Result"),
        className: "",
        icon: "result",
        iconPosition: "start",
        iconSize: "sm",
      });

      const updates: SubmitSuccessUpdates = {
        showResult: true,
        scoreResult: scoreResultShape,
        openScoreResult: true,
        modalDrawer: refactorModalDrawer,
        dataQuestionsTab: newDataQuestTab,
        dataQuestions: newDataQuest,
        activeTab: 1,
        dataAnswer: refactoredDataAnswer,
      };

      setScoreResult(scoreResultShape);
      setOpenScoreResult(true);

      onPlayResultSound?.(scoreResultShape.percentage as number);

      const dataUser = await Auth.refreshCurrentUser();
      if (assignMainLayout && dataUser) {
        await assignMainLayout({
          type: "ASSIGN_UPDATE_USER_INFO",
          value: dataUser,
        });
      }

      opts?.onSuccess?.(updates);
      return updates;
    },
    [
      postCompleteQuestion,
      assignMainLayout,
      getDataHead,
      onPlayAlertSound,
      onPlayResultSound,
      onInvalidAnswer,
    ]
  );

  return {
    scoreResult,
    openScoreResult,
    openScoreResultModal,
    closeScoreResultModal,
    handleSubmit,
    assignDataAnswer: (ctx, shouldValidate) =>
      assignDataAnswerCore(ctx, shouldValidate),
  };
}
