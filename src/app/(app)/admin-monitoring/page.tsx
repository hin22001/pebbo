import AdminMonitoringClient from "./AdminMonitoringClient";
import { redirect } from "next/navigation";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";

export const metadata = {
  title: "Admin Monitoring - Pebbo",
  description:
    "Admin monitoring dashboard. View active users, timelines, top questions, network clusters, and speed metrics.",
  openGraph: {
    title: "Admin Monitoring - Pebbo",
    description: "Admin monitoring dashboard for Pebbo schools.",
    siteName: "Pebbo",
  },
};

export default async function AdminMonitoringPage() {
  let role = "";

  try {
    const _supabase = new Supabase();
    const authClient = _supabase.getAuthClient();
    const auth = new Auth(authClient);
    await auth.init();

    const userDAO = new UserDAO(_supabase.getServiceClient());
    const userData = await userDAO.getUser(auth.getUserId());
    role = String(userData.getRole() || "").toLowerCase();
  } catch {
    redirect("/dashboard");
  }

  if (role !== "admin" && role !== "system_admin") {
    redirect("/dashboard");
  }

  return <AdminMonitoringClient />;
}
