import { Suspense } from "react";
import QuizInsightsClient from "./QuizInsightsClient";

export default function QuizInsightsPage({
  params,
}: {
  params: { quizId: string };
}) {
  return (
    <Suspense fallback={null}>
      <QuizInsightsClient quizId={params.quizId} />
    </Suspense>
  );
}
