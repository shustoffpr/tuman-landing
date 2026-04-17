import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: "u3425555-8afb4b6c4e0543a571e005a4",
        format: "json",
        custom_uptime_ratios: "7-30",
      }),
      next: { revalidate: 60 },
    });

    const data = await res.json();
    const monitors = (data.monitors || []).map((m: Record<string, unknown>) => ({
      name: m.friendly_name,
      status: m.status,
      uptime: (m.custom_uptime_ratio as string || "0-0").split("-"),
    }));

    return NextResponse.json({ monitors });
  } catch {
    return NextResponse.json({ monitors: [] }, { status: 500 });
  }
}
