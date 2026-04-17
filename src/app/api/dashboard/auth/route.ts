import { NextRequest, NextResponse } from "next/server";
import { verifyTelegramAuth, createDashboardSession } from "@/lib/dashboard-auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (!verifyTelegramAuth(data)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  await createDashboardSession({ id: parseInt(data.id), first_name: data.first_name, username: data.username, photo_url: data.photo_url });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete("dashboard_session");
  return NextResponse.json({ ok: true });
}
