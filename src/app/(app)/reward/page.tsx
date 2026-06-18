import RewardClient from "./RewardClient";

export const metadata = {
  title: "Rewards — Pebbo",
  description:
    "View and redeem your Pebbo rewards. Exchange coins for boosters, avatars, and customization. Earn rewards through AI maths practice.",
  openGraph: {
    title: "Rewards — Pebbo",
    description: "Redeem coins for boosters and customization.",
    siteName: "Pebbo",
  },
};

export default async function RewardPage() {
  // TODO: Replace with real API when available
  const initialRewards = null;
  return <RewardClient initialRewards={initialRewards} />;
}

