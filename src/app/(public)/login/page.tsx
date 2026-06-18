/**
 * Login Page (/login) — App Router
 * Thin server shell: metadata only. All UI and auth logic in LoginClient.
 */
import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login — Pebbo Student Portal",
  description:
    "Sign in to your Pebbo account to continue your personalised AI math learning journey for children aged 6–12.",
  openGraph: {
    title: "Login — Pebbo Student Portal",
    description:
      "Secure login to Pebbo’s AI-powered math practice portal for primary school students.",
    siteName: "Pebbo",
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
