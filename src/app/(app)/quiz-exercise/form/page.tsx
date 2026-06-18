import QuizExerciseFormClient from "./QuizExerciseFormClient";

export const metadata = {
  title: "Quiz Exercise Form — Pebbo",
  description:
    "Edit quiz questions and configure your maths quiz. Customise exercises for your students on Pebbo.",
  openGraph: {
    title: "Quiz Exercise Form — Pebbo",
    description: "Edit quiz questions for Pebbo classroom quizzes.",
    siteName: "Pebbo",
  },
};

export const dynamic = "force-dynamic";

export default function QuizExerciseFormPage() {
  return <QuizExerciseFormClient />;
}
