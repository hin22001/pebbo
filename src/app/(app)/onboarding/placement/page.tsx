import OnboardingPlacementClient from "./OnboardingPlacementClient";
import { cookies } from "next/headers";

export const metadata = {
  title: "Placement Test — Pebbo",
  description:
    "Take a short AI-powered placement test so Pebbo can personalise math practice for your child aged 6–12.",
  openGraph: {
    title: "Pebbo Placement Test",
    description:
      "Start the Pebbo onboarding placement test to find the right math level and roadmap for your child.",
    siteName: "Pebbo",
  },
};

export const dynamic = "force-dynamic";

export default async function OnboardingPlacementPage() {
  let initialQuestions: any[] = [];

  const cookieHeader = cookies().toString();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "";

  console.log("🔍 [placement/page] baseUrl:", baseUrl);
  console.log("🔍 [placement/page] cookieHeader exists:", !!cookieHeader);

  try {
    const url = `${baseUrl}/api/protected/student/placement/getQuestions`;
    console.log("🔍 [placement/page] fetching:", url);

    const res = await fetch(url, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    console.log("🔍 [placement/page] res.ok:", res.ok, "status:", res.status);

    if (res.ok) {
      const json = await res.json();
      initialQuestions = json?.data ?? [];
      console.log("🔍 [placement/page] initialQuestions count:", initialQuestions?.length);
      console.log("🔍 [placement/page] initialQuestions[0]?.id:", initialQuestions?.[0]?.id);
      console.log("🔍 [placement/page] initialQuestions[0]?.question_object type:", typeof initialQuestions?.[0]?.question_object);
    } else {
      const text = await res.text();
      console.log("🔍 [placement/page] error response:", text?.slice(0, 500));
    }
  } catch (err) {
    console.log("🔍 [placement/page] fetch error:", err);
    initialQuestions = [];
  }

  console.log("🔍 [placement/page] passing initialQuestions count:", initialQuestions?.length);

  return <OnboardingPlacementClient initialQuestions={initialQuestions} />;
}

