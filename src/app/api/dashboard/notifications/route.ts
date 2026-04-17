import { NextRequest, NextResponse } from "next/server";
import { getDashboardSession } from "@/lib/dashboard-auth";
export async function GET() {
  const s = await getDashboardSession(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const r = await fetch(`${process.env.TUMAN_API_URL}/api/dashboard/notifications`, { headers: { "X-Telegram-ID": s.id.toString() }, cache: "no-store" }); if (r.ok) return NextResponse.json(await r.json()); } catch {}
  return NextResponse.json({ notify_before_days: 3, notifications_enabled: true });
}
export async function POST(req: NextRequest) {
  const s = await getDashboardSession(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  try { await fetch(`${process.env.TUMAN_API_URL}/api/dashboard/notifications`, { method: "POST", headers: { "X-Telegram-ID": s.id.toString(), "Content-Type": "application/json" }, body: JSON.stringify(body) }); } catch {}
  return NextResponse.json({ ok: true });
}
