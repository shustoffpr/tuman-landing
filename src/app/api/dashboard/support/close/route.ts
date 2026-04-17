import { NextRequest, NextResponse } from "next/server";
import { getDashboardSession } from "@/lib/dashboard-auth";

export async function POST(req: NextRequest) {
  const s = await getDashboardSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  try {
    const r = await fetch(`${process.env.TUMAN_API_URL || "https://api.tuman.help"}/api/dashboard/support/close`, {
      method: "POST",
      headers: { "X-Telegram-ID": s.id.toString(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json());
  } catch { return NextResponse.json({ error: "API error" }, { status: 500 }); }
}
