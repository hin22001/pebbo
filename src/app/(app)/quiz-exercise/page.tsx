import QuizExerciseClient from "./QuizExerciseClient";

export const metadata = {
  title: "Quiz Exercise — Pebbo",
  description:
    "Manage quiz exercises. Create and run maths quizzes for your classroom on Pebbo.",
  openGraph: {
    title: "Quiz Exercise — Pebbo",
    description: "Quiz exercise management for Pebbo teachers.",
    siteName: "Pebbo",
  },
};

export const dynamic = "force-dynamic";

export default function QuizExercisePage() {
  return <QuizExerciseClient />;
}
