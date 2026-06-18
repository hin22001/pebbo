import ClassroomStudentQuizClient from "./ClassroomStudentQuizClient";

export const metadata = {
  title: "Classroom Quiz — Pebbo",
  description:
    "Complete your classroom maths quiz. Answer questions and track your progress on Pebbo.",
  openGraph: {
    title: "Classroom Quiz — Pebbo",
    description: "Complete your classroom quiz on Pebbo.",
    siteName: "Pebbo",
  },
};

export default function ClassroomStudentQuizPage() {
  return <ClassroomStudentQuizClient />;
}
