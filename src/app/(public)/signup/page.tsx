/**
 * Signup Page (/signup) — App Router
 * Thin server shell: metadata only. All UI and auth logic in SignupClient.
 */
import type { Metadata } from "next";
import SignupClient from "./SignupClient";

export const metadata: Metadata = {
  title: "Sign Up — Pebbo Student Portal",
  description:
    "Create your Pebbo account and start your personalised AI math learning journey for children aged 6–12 today.",
  openGraph: {
    title: "Create Pebbo Account — Sign Up",
    description:
      "Sign up to Pebbo to unlock AI-powered math practice, progress tracking, and rewards for primary school students.",
    siteName: "Pebbo",
  },
};

export default function SignupPage() {
  return <SignupClient />;
}
