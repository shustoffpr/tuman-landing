import { getDashboardSession } from "@/lib/dashboard-auth";
import { redirect } from "next/navigation";
import DashboardView from "./DashboardView";

export default async function DashboardPage() {
  const session = await getDashboardSession();
  if (!session) redirect("/dashboard/login");
  return <DashboardView session={session} />;
}
