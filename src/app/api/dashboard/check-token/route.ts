import { NextRequest, NextResponse } from "next/server";
import { createDashboardSession } from "@/lib/dashboard-auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ authenticated: false });

  try {
    // Check with FastAPI if bot confirmed this token
    const r = await fetch(`${process.env.TUMAN_API_URL || "https://api.tuman.help"}/api/dashboard/check-login?token=${token}`, { cache: "no-store" });
    if (!r.ok) return NextResponse.json({ authenticated: false });
    const data = await r.json();

    if (data.authenticated && data.user_id) {
      await createDashboardSession({ id: data.user_id, first_name: data.first_name || "User", username: data.username });
      return NextResponse.json({ authenticated: true });
    }
  } catch {}

  return NextResponse.json({ authenticated: false });
}
