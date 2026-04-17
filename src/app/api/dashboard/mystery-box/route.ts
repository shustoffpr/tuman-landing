import { NextResponse } from "next/server";
import { getDashboardSession } from "@/lib/dashboard-auth";
export async function GET() {
  const s = await getDashboardSession(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const r = await fetch(`${process.env.TUMAN_API_URL}/api/dashboard/mystery-box`, { headers: { "X-Telegram-ID": s.id.toString() }, cache: "no-store" }); if (r.ok) return NextResponse.json(await r.json()); } catch {}
  return NextResponse.json({ can_open: false, days_until: 30, last_prize: null });
}
