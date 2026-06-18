/**
 * Landing Page (/) — App Router
 * Thin server shell: metadata + server-safe getDataHead only. All UI logic in LandingClient.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { getDataHead } from "@/app/data/head";
import LandingClient from "./LandingClient";

export const metadata: Metadata = {
  title:
    "Pebbo - Let's start this journey together and explore, learn, and grow in the Pebbo world!",
  description:
    "Tailoring Mathematics, Shaping New Learning Ecosystem with AI and create a fun and personalized profile for your little learner on Pebbo.",
  openGraph: {
    title: "Pebbo — AI Math Platform for Kids",
    description:
      "20 Minutes a Day, 30% Improvement in Grades. Designed for ages 6-12.",
    siteName: "Pebbo",
  },
};

export default function LandingPage() {
  const head = getDataHead({ name: "headLandingPage" });
  return (
    <Suspense fallback={null}>
      <LandingClient head={head} />
    </Suspense>
  );
}
