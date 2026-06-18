"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "@/app/hooks/useActivityTracker";

const SUPPORTED_WEB_VITALS = new Set(["LCP", "INP", "TTFB", "FCP", "CLS"]);

function formatMetricValue(name: string, value: number): number {
  if (name === "CLS") {
    return Number(value.toFixed(4));
  }
  return Math.round(value);
}

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!SUPPORTED_WEB_VITALS.has(metric.name)) return;

    trackEvent("web_vital", {
      metadata: {
        name: metric.name,
        value: formatMetricValue(metric.name, metric.value),
        rating: metric.rating,
        navigationType: metric.navigationType,
      },
    });
  });

  return null;
}
