import MathLibraryClient from "./MathLibraryClient";
import { cookies } from "next/headers";
import { getSessionFromCookies } from "@/app/lib/auth-server";

export const metadata = {
  title: "Math Library — Pebbo",
  description:
    "Explore Pebbo's math library. Browse maths concepts, definitions, and examples for ages 6–12. AI-powered personalised learning.",
  openGraph: {
    title: "Math Library — Pebbo",
    description:
      "Explore maths concepts, definitions, and examples for ages 6–12.",
    siteName: "Pebbo",
  },
};

export default async function MathLibraryPage() {
  let initialAssets: any[] = [];
  let initialYear = 1;

  try {
    const cookieStore = cookies();
    const session = getSessionFromCookies(cookieStore);
    // Use year from session (navbar selection) when available; else fall back to profile
    const sessionYear = session?.year;
    const cookieHeader = cookieStore.toString();
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "";

    if (sessionYear != null && !Number.isNaN(sessionYear)) {
      initialYear = sessionYear;
    } else {
      const profileRes = await fetch(
        `${baseUrl}/api/protected/student/user/getProfile`,
        {
          headers: { cookie: cookieHeader },
          cache: "no-store",
        },
      );
      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        initialYear = parseInt(profileJson?.data?.year) || 1;
      }
    }

    const assetsRes = await fetch(
      `${baseUrl}/api/protected/student/mathLibrary/getAssets?year=${initialYear}`,
      {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      },
    );

    if (assetsRes.ok) {
      const assetsJson = await assetsRes.json();
      initialAssets = assetsJson?.data?.assets ?? [];
    }
  } catch {
    initialAssets = [];
    initialYear = 1;
  }

  return (
    <MathLibraryClient
      initialAssets={initialAssets}
      initialYear={initialYear}
    />
  );
}
