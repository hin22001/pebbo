"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import QuizExerciseForm from "@/app/components/templates/QuizExerciseForm/QuizExerciseForm";

export default function QuizExerciseFormClient() {
  const dispatch = useDispatch();
  return (
    <QuizExerciseForm
      assignMainLayout={(payload: any) => dispatch(assignMainLayout(payload))}
    />
  );
}
