import QuizReportClient from "./QuizReportClient";

export const metadata = {
  title: "Quiz Report — Pebbo",
  description:
    "View quiz reports and results. See how your students performed on maths quizzes.",
  openGraph: {
    title: "Quiz Report — Pebbo",
    description: "Quiz report and results for Pebbo teachers.",
    siteName: "Pebbo",
  },
};

export default function QuizReportPage() {
  return <QuizReportClient />;
}
