import { NextResponse } from "next/server";
import { getDashboardSession } from "@/lib/dashboard-auth";

export async function GET() {
  const session = await getDashboardSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const r = await fetch(`${process.env.TUMAN_API_URL || "https://api.tuman.help"}/api/dashboard/me`, { headers: { "X-Telegram-ID": session.id.toString() }, cache: "no-store" });
    if (!r.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = await r.json();
    return NextResponse.json({ ...data, session_user: { first_name: session.first_name, username: session.username, photo_url: session.photo_url } });
  } catch {
    return NextResponse.json({ error: "API unavailable" }, { status: 500 });
  }
}
