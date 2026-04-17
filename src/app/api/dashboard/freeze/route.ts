import { NextResponse } from "next/server";
import { getDashboardSession } from "@/lib/dashboard-auth";
export async function POST() {
  const s = await getDashboardSession(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: false, message: "Заморозка пока недоступна. Обратись в поддержку." });
}
