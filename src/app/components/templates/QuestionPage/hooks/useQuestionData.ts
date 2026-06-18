import { useState, useCallback } from "react";
import dayjs, { Dayjs } from "dayjs";

type QuestionId = string | number;

export type Question = {
  id: QuestionId;
  time_taken?: number | null;
  [key: string]: any;
};

export type QuestionTab = {
  id: QuestionId;
  label: string;
  [key: string]: any;
};

export type TimeEntry = {
  id: QuestionId;
  timeStart: Dayjs | null;
  timeEnd: Dayjs | null;
  duration?: number | null;
};

export type AnswerEntry = Question & {
  time_taken: number;
};

export type InitialQuestionState = {
  dataQuestions: Question[];
  dataQuestionsTab: QuestionTab[];
  dataAnswer: AnswerEntry[];
  dataTime: TimeEntry[];
  activeTab: QuestionId;
};

export type BuildInitialQuestionStateParams = {
  questions: Question[] | null | undefined;
  tabs: QuestionTab[] | null | undefined;
  /**
   * If provided, this tab id is treated as the active one when seeding
   * `dataTime`. If omitted, the first tab id is used.
   */
  initialActiveTab?: QuestionId | null;
};

/**
 * Shared helper that encapsulates the logic for building:
 * - `dataTime`: per-question timing entries with `timeStart`/`timeEnd`
 * - `dataAnswer`: flattened question objects with `time_taken`
 *
 * This mirrors the behaviour that previously lived inline inside the
 * `handleEvent("start-excercise")` and `handleEvent("try-again")` branches of
 * the legacy `QuestionPage` class.
 */
export function buildInitialQuestionState(
  params: BuildInitialQuestionStateParams,
): InitialQuestionState | null {
  const { questions, tabs, initialActiveTab } = params;

  if (!questions || !tabs || questions.length === 0 || tabs.length === 0) {
    return null;
  }

  const firstTabId = tabs[0]?.id;
  const activeTab = initialActiveTab ?? firstTabId;

  const dataTime: TimeEntry[] = [];

  const dataAnswer: AnswerEntry[] = questions.map((item) => {
    const id = item?.id;
    dataTime.push({
      id,
      timeStart: id === activeTab ? dayjs() : null,
      timeEnd: null,
      duration: null,
    });

    return {
      ...(item || {}),
      time_taken: item?.time_taken || 0,
    };
  });

  return {
    dataQuestions: questions,
    dataQuestionsTab: tabs,
    dataAnswer,
    dataTime,
    activeTab,
  };
}

export type UseQuestionDataOptions = {
  initialQuestions?: Question[] | null;
  initialTabs?: QuestionTab[] | null;
};

export type UseQuestionDataResult = {
  dataQuestions: Question[] | null;
  dataQuestionsTab: QuestionTab[] | null;
  dataAnswer: AnswerEntry[] | null;
  dataTime: TimeEntry[] | null;
  activeTab: QuestionId | null;
  /**
   * Seed all question-related state from a fresh API payload. This should be
   * called after `getQuestion` resolves.
   */
  seedFromPayload: (payload: {
    dataQuestions: Question[];
    dataQuestionsTab: QuestionTab[];
  }) => void;
  /**
   * Imperatively override the active tab id – primarily useful for navigation
   * flows that need to jump to a specific question.
   */
  setActiveTab: (id: QuestionId) => void;
};

/**
 * Hook-based owner for question list, per-question answer state, and timing
 * metadata. This is intentionally small and focused so it can be adopted
 * gradually by `QuestionPageV2` without changing API behaviour.
 */
export function useQuestionData(
  options: UseQuestionDataOptions = {},
): UseQuestionDataResult {
  const [dataQuestions, setDataQuestions] = useState<Question[] | null>(
    options.initialQuestions ?? null,
  );
  const [dataQuestionsTab, setDataQuestionsTab] = useState<QuestionTab[] | null>(
    options.initialTabs ?? null,
  );
  const [dataAnswer, setDataAnswer] = useState<AnswerEntry[] | null>(null);
  const [dataTime, setDataTime] = useState<TimeEntry[] | null>(null);
  const [activeTab, setActiveTabState] = useState<QuestionId | null>(null);

  const seedFromPayload = useCallback(
    (payload: { dataQuestions: Question[]; dataQuestionsTab: QuestionTab[] }) => {
      const seeded = buildInitialQuestionState({
        questions: payload.dataQuestions,
        tabs: payload.dataQuestionsTab,
      });

      if (!seeded) {
        setDataQuestions(null);
        setDataQuestionsTab(null);
        setDataAnswer(null);
        setDataTime(null);
        setActiveTabState(null);
        return;
      }

      setDataQuestions(seeded.dataQuestions);
      setDataQuestionsTab(seeded.dataQuestionsTab);
      setDataAnswer(seeded.dataAnswer);
      setDataTime(seeded.dataTime);
      setActiveTabState(seeded.activeTab);
    },
    [],
  );

  const setActiveTab = useCallback((id: QuestionId) => {
    setActiveTabState(id);
  }, []);

  return {
    dataQuestions,
    dataQuestionsTab,
    dataAnswer,
    dataTime,
    activeTab,
    seedFromPayload,
    setActiveTab,
  };
}

