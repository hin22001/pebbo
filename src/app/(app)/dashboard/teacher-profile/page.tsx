import TeacherProfileClient from "./TeacherProfileClient";
import { cookies } from "next/headers";

export const metadata = {
  title: "Teacher Profile — Pebbo",
  description:
    "Manage your Pebbo teacher profile and settings. AI-powered maths teaching for ages 6–12.",
  openGraph: {
    title: "Teacher Profile — Pebbo",
    description: "Teacher profile and settings for Pebbo educators.",
    siteName: "Pebbo",
  },
};

export default async function TeacherProfilePage() {
  // Resolve the teacher's identity server-side (mirrors the student profile
  // page). The teacher endpoint reads the role-agnostic `users` row, so unlike
  // the student getProfile it does not 500 for teachers.
  let initialProfileData: any = null;

  try {
    const cookieHeader = cookies().toString();
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "";

    const res = await fetch(
      `${baseUrl}/api/protected/teacher/user/getProfile`,
      {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      },
    );

    if (res.ok) {
      const json = await res.json();
      initialProfileData = json?.data ?? null;
    }
  } catch {
    initialProfileData = null;
  }

  return <TeacherProfileClient initialProfileData={initialProfileData} />;
}
