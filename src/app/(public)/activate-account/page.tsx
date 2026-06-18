import ActivateAccountClient from "./ActivateAccountClient";

export const metadata = {
  title: "Activate Account — Pebbo",
  description:
    "Activate your Pebbo account with an activation key or subscribe to unlock full access to AI-powered math practice.",
  openGraph: {
    title: "Activate Pebbo Account",
    description:
      "Use your activation key or choose a subscription to start your child’s personalised Pebbo math learning journey.",
    siteName: "Pebbo",
  },
};

export default function ActivateAccountPage() {
  return <ActivateAccountClient />;
}
