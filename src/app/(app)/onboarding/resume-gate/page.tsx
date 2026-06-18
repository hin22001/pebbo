import ResumeGateClient from "./ResumeGateClient";

export const metadata = {
  title: "Resume Gate — Pebbo",
  description:
    "Resume your Pebbo onboarding journey and pick up your child’s AI-powered math placement where you left off.",
  openGraph: {
    title: "Resume Pebbo Onboarding",
    description:
      "Continue the Pebbo onboarding flow to finish setup and unlock personalised math practice.",
    siteName: "Pebbo",
  },
};

export const dynamic = "force-dynamic";

export default function ResumeGatePage() {
  return <ResumeGateClient />;
}

