/**
 * Reset Password Page (/reset-password) — App Router
 * Thin server shell: metadata only. All UI logic in ResetPasswordClient.
 */
import type { Metadata } from "next";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: "Reset Password — Pebbo",
  description:
    "Securely set a new password for your Pebbo account and continue your child’s personalised AI math journey.",
  openGraph: {
    title: "Reset Pebbo Password",
    description:
      "Choose a new Pebbo password and restore access to your child’s AI-powered math practice and progress.",
    siteName: "Pebbo",
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
