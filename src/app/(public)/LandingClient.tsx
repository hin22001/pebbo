"use client";

/**
 * LandingClient — client boundary for the Landing Page.
 * The legacy LandingPage class component uses window.innerWidth
 * and addEventListener, so it must stay a client component.
 */
import { LandingPage } from "@/templates";

export default function LandingClient({ head }: { head: any }) {
  return <LandingPage head={head} />;
}
