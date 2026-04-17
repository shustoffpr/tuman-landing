"use client";
import { useEffect, useState } from "react";

interface Monitor {
  name: string;
  status: number;
  uptime: string[];
}

const STATUS_TEXT: Record<number, { icon: string; label: string; color: string }> = {
  0: { icon: "⏸", label: "Paused", color: "#888" },
  1: { icon: "⚪", label: "Checking...", color: "#888" },
  2: { icon: "🟢", label: "Online", color: "#4ade80" },
  8: { icon: "🟡", label: "Seems Down", color: "#facc15" },
  9: { icon: "🔴", label: "Offline", color: "#f87171" },
};

export default function StatusPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/uptime");
        const data = await res.json();
        setMonitors(data.monitors || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen px-4 py-20" style={{ background: "#0A0A0A", color: "#ededed" }}>
      <div className="max-w-2xl mx-auto">
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "8px", fontFamily: "Unbounded,sans-serif" }}>
          Статус серверов
        </h1>
        <p style={{ color: "#888", marginBottom: "32px" }}>Данные UptimeRobot · обновляется каждую минуту</p>

        {loading ? (
          <p style={{ color: "#888" }}>Загрузка...</p>
        ) : monitors.length === 0 ? (
          <p style={{ color: "#888" }}>Нет данных</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {monitors.map(m => {
              const s = STATUS_TEXT[m.status] || STATUS_TEXT[1];
              return (
                <div key={m.name} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 600 }}>{m.name}</span>
                    <span style={{ color: s.color, fontSize: "14px" }}>{s.icon} {s.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#888" }}>
                    <span>7 дней: <b style={{ color: "#ccc" }}>{m.uptime[0]}%</b></span>
                    <span>30 дней: <b style={{ color: "#ccc" }}>{m.uptime[1]}%</b></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p style={{ color: "#555", fontSize: "12px", marginTop: "32px", textAlign: "center" }}>
          Мониторинг: UptimeRobot · TUMAN VPN
        </p>
      </div>
    </main>
  );
}
