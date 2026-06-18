/**
 * Forgot Password Page (/forgot) — App Router
 * Thin server shell: metadata only. All UI logic in ForgotClient.
 */
import type { Metadata } from "next";
import ForgotClient from "./ForgotClient";

export const metadata: Metadata = {
  title: "Forgot Password — Pebbo",
  description:
    "Forgot your Pebbo password? Request a secure reset link to regain access to your child’s AI math learning account.",
  openGraph: {
    title: "Forgot Pebbo Password",
    description:
      "Reset your Pebbo account password safely and get back to personalised AI-powered math practice.",
    siteName: "Pebbo",
  },
};

export default function ForgotPage() {
  return <ForgotClient />;
}
