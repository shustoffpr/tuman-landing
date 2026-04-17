import { NextResponse } from "next/server";
import { getDashboardSession } from "@/lib/dashboard-auth";

export async function GET() {
  const s = await getDashboardSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const r = await fetch(`${process.env.TUMAN_API_URL || "https://api.tuman.help"}/api/dashboard/support/tickets`, {
      headers: { "X-Telegram-ID": s.id.toString() },
      cache: "no-store",
    });
    return NextResponse.json(await r.json());
  } catch { return NextResponse.json({ tickets: [] }); }
}
