import { Suspense } from "react";
import QuizReportClient from "./QuizReportClient";

export default function QuizReportPage() {
  return (
    <Suspense fallback={null}>
      <QuizReportClient />
    </Suspense>
  );
}
