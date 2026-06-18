import ClassroomStudentDetailClient from "./ClassroomStudentDetailClient";

export const metadata = {
  title: "Classroom Detail — Pebbo",
  description:
    "View classroom details, quizzes, and assignments. Your maths class on Pebbo.",
  openGraph: {
    title: "Classroom Detail — Pebbo",
    description: "Student classroom detail and assignments.",
    siteName: "Pebbo",
  },
};

export default function ClassroomStudentDetailPage() {
  return <ClassroomStudentDetailClient />;
}

