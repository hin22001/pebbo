/**
 * Contact Page (/contact) — App Router
 * Thin server shell: metadata + server-safe getDataHead only. All UI logic in ContactClient.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { getDataHead } from "@/app/data/head";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Pebbo — Let's Talk",
  description:
    "Get in touch with the Pebbo team. Reach us at hello@pebbo.io or via WhatsApp.",
  openGraph: {
    title: "Contact Pebbo",
    description:
      "We'd love to hear from you. Start your child's journey today.",
    siteName: "Pebbo",
  },
};

export default function ContactPage() {
  const head = getDataHead({ name: "headLandingPage" });
  return (
    <Suspense fallback={null}>
      <ContactClient head={head} />
    </Suspense>
  );
}
