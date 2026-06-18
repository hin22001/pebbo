import StudentProfileClient from "./StudentProfileClient";
import { cookies } from "next/headers";

export const metadata = {
  title: "Student Profile — Pebbo",
  description:
    "Manage your Pebbo student profile, avatar, and account settings. Personalise your AI math learning experience.",
  openGraph: {
    title: "Student Profile — Pebbo",
    description:
      "Manage your Pebbo student profile, avatar, and account settings.",
    siteName: "Pebbo",
  },
};

export default async function StudentProfilePage() {
  let initialProfileData: any = null;
  let initialSummaryData: any = null;

  try {
    const cookieHeader = cookies().toString();
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "";

    const [profileRes, summaryRes] = await Promise.all([
      fetch(`${baseUrl}/api/protected/student/user/getProfile`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/protected/student/user/getSummary`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      }),
    ]);

    if (profileRes.ok) {
      const json = await profileRes.json();
      initialProfileData = json?.data ?? null;
    }
    if (summaryRes.ok) {
      const json = await summaryRes.json();
      initialSummaryData = json?.data ?? null;
    }
  } catch {
    initialProfileData = null;
    initialSummaryData = null;
  }

  return (
    <StudentProfileClient
      initialProfileData={initialProfileData}
      initialSummaryData={initialSummaryData}
    />
  );
}

