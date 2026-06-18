/**
 * Pricing Page (/pricing) — App Router
 * Thin server shell: metadata + server-safe getDataHead only. All UI logic in PricingClient.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { getDataHead } from "@/app/data/head";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing — Pebbo Elite Plan",
  description:
    "Pebbo Elite Plan: 14 days to see improvement. Tailored AI math practice for primary school students aged 6-12.",
  openGraph: {
    title: "Pebbo Pricing",
    description: "Affordable plans to unlock your child's full math potential.",
    siteName: "Pebbo",
  },
};

export default function PricingPage() {
  const head = getDataHead({ name: "headLandingPage" });
  return (
    <Suspense fallback={null}>
      <PricingClient head={head} />
    </Suspense>
  );
}
