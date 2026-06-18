import DownloadClient from "./DownloadClient";

export const metadata = {
  title: "Download Mobile App — Pebbo",
  description:
    "Download the Pebbo mobile app. AI maths practice for ages 6–12 on the go.",
  openGraph: {
    title: "Download Mobile App — Pebbo",
    description: "Get the Pebbo mobile app for AI maths practice.",
    siteName: "Pebbo",
  },
};

export default function DownloadPage() {
  return <DownloadClient />;
}

