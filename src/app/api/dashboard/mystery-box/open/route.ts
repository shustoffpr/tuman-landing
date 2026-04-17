import { NextResponse } from "next/server";
import { getDashboardSession } from "@/lib/dashboard-auth";

export async function POST() {
  const s = await getDashboardSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const r = await fetch(`${process.env.TUMAN_API_URL || "https://api.tuman.help"}/api/dashboard/mystery-box/open`, {
      method: "POST",
      headers: { "X-Telegram-ID": s.id.toString() },
    });
    return NextResponse.json(await r.json());
  } catch {
    return NextResponse.json({ error: "API error" }, { status: 500 });
  }
}
