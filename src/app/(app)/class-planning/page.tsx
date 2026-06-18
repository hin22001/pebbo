import ClassPlanningClient from "./ClassPlanningClient";

export const metadata = {
  title: "Class Planning — Pebbo",
  description:
    "Plan and schedule your maths classes. Organise lessons and assignments for your students on Pebbo.",
  openGraph: {
    title: "Class Planning — Pebbo",
    description: "Class planning and scheduling for Pebbo teachers.",
    siteName: "Pebbo",
  },
};

export default function ClassPlanningPage() {
  return <ClassPlanningClient />;
}
