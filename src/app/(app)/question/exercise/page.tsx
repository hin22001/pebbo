import QuestionExerciseClient from "./QuestionExerciseClient";
import { cookies } from "next/headers";
import { getServerUser } from "@/app/lib/server-user";

export const metadata = {
  title: "Question Exercise — Pebbo",
  description:
    "Practice with AI-generated maths questions tailored to your level. Personalised practice for ages 6–12.",
  openGraph: {
    title: "Question Exercise — Pebbo",
    description: "AI-generated maths practice tailored to your level.",
    siteName: "Pebbo",
  },
};

export const dynamic = "force-dynamic";

export default async function QuestionExercisePage() {
  let initialEnabledCategories: number[] | null = null;
  let initialYear: number = 2;

  try {
    const cookieHeader = cookies().toString();
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "";
    const serverUser = await getServerUser(cookieHeader, baseUrl);
    const year = serverUser?.year;
    const educationLevel = serverUser?.education_level ?? "";

    initialYear =
      year != null && !Number.isNaN(Number(year)) ? Number(year) : 2;

    const categoriesUrl = new URL(
      `${baseUrl}/api/protected/student/user/getCategories`,
    );
    categoriesUrl.searchParams.set("year", String(initialYear));
    categoriesUrl.searchParams.set("education_level", educationLevel);

    const categoriesRes = await fetch(categoriesUrl.toString(), {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (categoriesRes.ok) {
      const json = await categoriesRes.json();
      initialEnabledCategories = json?.data?.enabled_categories ?? null;
    }
  } catch {
    initialEnabledCategories = null;
  }

  return (
    <QuestionExerciseClient
      initialEnabledCategories={initialEnabledCategories}
      initialYear={initialYear}
    />
  );
}
