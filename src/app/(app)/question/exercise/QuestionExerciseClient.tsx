"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import QuestionExercisePage from "@/app/components/templates/QuestionExercisePage/QuestionExercisePage";

type QuestionExerciseClientProps = {
  initialEnabledCategories?: number[] | null;
  initialYear?: number;
};

export default function QuestionExerciseClient({
  initialEnabledCategories,
  initialYear = 2,
}: QuestionExerciseClientProps) {
  const dispatch = useDispatch();

  const assignMainLayoutAction = (payload: any) =>
    dispatch(assignMainLayout(payload));

  return (
    <QuestionExercisePage
      assignMainLayout={assignMainLayoutAction}
      initialEnabledCategories={initialEnabledCategories}
      initialYear={initialYear}
    />
  );
}
