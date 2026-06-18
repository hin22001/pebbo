import { Suspense } from "react";
import ClassReportClient from "./ClassReportClient";

export default function ClassReportPage() {
  return (
    <Suspense fallback={null}>
      <ClassReportClient />
    </Suspense>
  );
}
