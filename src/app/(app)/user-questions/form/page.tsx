import UserQuestionsFormClient from "./UserQuestionsFormClient";

export const metadata = {
  title: "Question Form — Pebbo",
  description:
    "Add or edit a maths question. Create and update custom questions for your school on Pebbo.",
  openGraph: {
    title: "Question Form — Pebbo",
    description: "Add or edit question for Pebbo.",
    siteName: "Pebbo",
  },
};

export default function UserQuestionsFormPage() {
  return <UserQuestionsFormClient />;
}
