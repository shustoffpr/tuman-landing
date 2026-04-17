import { NextResponse } from "next/server";
import { getDashboardSession } from "@/lib/dashboard-auth";

export async function GET() {
  const session = await getDashboardSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const r = await fetch(`${process.env.TUMAN_API_URL || "https://api.tuman.help"}/api/admin/users?search=${session.id}`, { cache: "no-store" });
    const data = await r.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = data.users?.find((u: any) => u.telegram_id === session.id);
    if (!user) return NextResponse.json({ is_active: false });

    return NextResponse.json({
      plan: user.plan || "none",
      expires_at: user.expires_at || "",
      sub_url: "", // Will be fetched from Marzban
      days_left: user.expires_at ? Math.max(0, Math.floor((new Date(user.expires_at).getTime() - Date.now()) / 86400000)) : 0,
      is_active: user.subscription_status === "active" || user.subscription_status === "trial",
    });
  } catch {
    return NextResponse.json({ is_active: false });
  }
}
