import ClassroomDetailClient from "./ClassroomDetailClient";

export const metadata = { title: "Classroom · Pebbo Teacher" };

export default function ClassroomDetailPage({
  params,
}: {
  params: { classroomId: string };
}) {
  return <ClassroomDetailClient classroomId={params.classroomId} />;
}
