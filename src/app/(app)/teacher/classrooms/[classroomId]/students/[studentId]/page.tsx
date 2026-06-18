import StudentDetailClient from "./StudentDetailClient";

export const metadata = { title: "Student · Pebbo Teacher" };

export default function StudentDetailPage({
  params,
}: {
  params: { classroomId: string; studentId: string };
}) {
  return (
    <StudentDetailClient
      classroomId={params.classroomId}
      studentId={params.studentId}
    />
  );
}
