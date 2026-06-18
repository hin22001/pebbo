import QuizEditClient from "./QuizEditClient";

export const metadata = { title: "Edit Quiz · Pebbo Teacher" };

export default function EditQuizPage({
  params,
}: {
  params: { quizId: string };
}) {
  return <QuizEditClient quizId={params.quizId} />;
}
