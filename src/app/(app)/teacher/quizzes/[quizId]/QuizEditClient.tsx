"use client";

import QuizAuthoringClient from "../new/QuizAuthoringClient";

export default function QuizEditClient({ quizId }: { quizId: string }) {
  return <QuizAuthoringClient quizId={quizId} isEdit />;
}
