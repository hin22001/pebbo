import ClassReportClient from "./ClassReportClient";

export const metadata = {
  title: "Class Report — Pebbo",
  description:
    "View class-wide reports and analytics. Track student progress and performance across your maths classes on Pebbo.",
  openGraph: {
    title: "Class Report — Pebbo",
    description: "Class report and analytics for Pebbo teachers.",
    siteName: "Pebbo",
  },
};

export default function ClassReportPage() {
  return <ClassReportClient />;
}
