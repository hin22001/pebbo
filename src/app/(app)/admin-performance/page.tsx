import AdminPerformanceClient from "./AdminPerformanceClient";

export const metadata = {
  title: "Admin Performance — Pebbo",
  description:
    "Admin performance dashboard. Monitor school-wide metrics and usage for Pebbo.",
  openGraph: {
    title: "Admin Performance — Pebbo",
    description: "Admin performance dashboard for Pebbo schools.",
    siteName: "Pebbo",
  },
};

export default function AdminPerformancePage() {
  return <AdminPerformanceClient />;
}
