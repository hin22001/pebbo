import OnboardingResultsClient from "./OnboardingResultsClient";

export const metadata = {
  title: "Onboarding Results — Pebbo",
  description:
    "View Pebbo onboarding results to understand your child’s starting math level and recommended learning path.",
  openGraph: {
    title: "Pebbo Onboarding Results",
    description:
      "Review placement outcomes and see how Pebbo will personalise AI math practice for your child.",
    siteName: "Pebbo",
  },
};

export const dynamic = "force-dynamic";

export default function OnboardingResultsPage() {
  return <OnboardingResultsClient />;
}

