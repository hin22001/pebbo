/**
 * About Page (/about) — App Router
 * Thin server shell: metadata + server-safe getDataHead only. All UI logic in AboutClient.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { getDataHead } from "@/app/data/head";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Pebbo — AI Math Platform for Kids",
  description:
    "Pebbo is a next-generation education technology company founded by technologists, educators, and innovators, incubated at HKUST and HKSTP.",
  openGraph: {
    title: "About Pebbo",
    description:
      "Learn about Pebbo's mission to transform math education for children aged 6-12.",
    siteName: "Pebbo",
  },
};

export default function AboutPage() {
  const head = getDataHead({ name: "headLandingPage" });
  return (
    <Suspense fallback={null}>
      <AboutClient head={head} />
    </Suspense>
  );
}
