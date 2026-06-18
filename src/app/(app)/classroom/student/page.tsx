import ClassroomStudentClient from "./ClassroomStudentClient";

export const metadata = {
  title: "Classroom — Pebbo",
  description:
    "Student classroom overview. View your classes, quizzes, and assignments. AI-powered maths learning for ages 6–12.",
  openGraph: {
    title: "Classroom — Pebbo",
    description: "Student classroom overview and quizzes.",
    siteName: "Pebbo",
  },
};

export default function ClassroomStudentPage() {
  return <ClassroomStudentClient />;
}

