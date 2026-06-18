import AddQuizClient from "./AddQuizClient";

export const metadata = {
  title: "Add Quiz — Pebbo",
  description:
    "Add a quiz to your classroom. Create and assign maths quizzes for your students on Pebbo.",
  openGraph: {
    title: "Add Quiz — Pebbo",
    description: "Add quiz to your Pebbo classroom.",
    siteName: "Pebbo",
  },
};

export default function AddQuizPage() {
  return <AddQuizClient />;
}
