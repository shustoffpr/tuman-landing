"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { Calendar, Tag, Key, Shield, Gamepad2, Smartphone } from "lucide-react";

interface DashData {
  user: { id: number; username: string; first_name: string; created_at: string };
  subscription: { status: string; plan_id: string; expires_at: string; days_left: number } | null;
  sub_url: string | null;
  payments: Array<{ id: number; amount_rub: number; plan_id: string; payment_method: string; created_at: string }>;
  referrals: { total: number; paid: number; bonus_days: number; ref_link: string };
  member_since_days: number;
  session_user: { first_name: string; username?: string; photo_url?: string };
}

interface Session { id: number; first_name: string; username?: string; photo_url?: string }
interface Achievements { earned: string[]; xp: number; level: number; progress: { refs_total: number; refs_paid: number; days_subscribed: number } }
interface MysteryBoxHistoryItem { opened_at: string | null; prize_type: string; prize_value: string }
interface MysteryBoxData {
  can_open: boolean;
  days_until: number;
  last_prize: MysteryBoxHistoryItem | null;
  available?: boolean;
  next_available_at?: string | null;
  last_opened_at?: string | null;
  history?: MysteryBoxHistoryItem[];
}

const LVL_NAMES = ["", "Новичок", "Опытный", "Ветеран", "Легенда"];
const LVL_COLORS = ["", "#888", "#6B8CFF", "#8B6FFF", "#FFD700"];
const LVL_XP = [0, 0, 500, 2000, 5000];

const PN: Record<string, string> = { trial: "Триал", basic_1week: "Базовый (нед)", basic_1month: "Базовый", basic_3month: "Базовый 3мес", standard_1month: "Стандарт", family_1month: "Семейный", charity: "Социальная помощь 🤝" };
const MN: Record<string, string> = { stars: "Stars", cryptobot: "Crypto", yoomoney: "YooMoney", test: "Тест" };

const ROULETTE_PRIZES = [
  { type: "days", value: "3", label: "+3 дня", rarity: "common", color: "#4A7CFF", bg: "rgba(74,124,255,0.15)", Icon: Calendar },
  { type: "days", value: "7", label: "+7 дней", rarity: "common", color: "#4A7CFF", bg: "rgba(74,124,255,0.15)", Icon: Calendar },
  { type: "discount", value: "10%", label: "Скидка 10%", rarity: "common", color: "#8B6FFF", bg: "rgba(139,111,255,0.15)", Icon: Tag },
  { type: "discount", value: "15%", label: "Скидка 15%", rarity: "common", color: "#8B6FFF", bg: "rgba(139,111,255,0.15)", Icon: Tag },
  { type: "days", value: "30", label: "+30 дней", rarity: "rare", color: "#A78BFA", bg: "rgba(167,139,250,0.15)", Icon: Calendar },
  { type: "discount", value: "30%", label: "Скидка 30%", rarity: "rare", color: "#A78BFA", bg: "rgba(167,139,250,0.15)", Icon: Tag },
  { type: "free", value: "7", label: "Неделя free", rarity: "rare", color: "#F59E0B", bg: "rgba(245,158,11,0.15)", Icon: Key },
  { type: "slot", value: "+1", label: "+1 слот", rarity: "rare", color: "#10B981", bg: "rgba(16,185,129,0.15)", Icon: Shield },
  { type: "days", value: "90", label: "+90 дней", rarity: "epic", color: "#FFD700", bg: "rgba(255,215,0,0.15)", Icon: Calendar },
  { type: "discount", value: "50%", label: "Скидка 50%", rarity: "epic", color: "#FFD700", bg: "rgba(255,215,0,0.15)", Icon: Tag },
  { type: "super", value: "PS5", label: "PlayStation 5", rarity: "legendary", color: "#E5E7EB", bg: "rgba(229,231,235,0.1)", Icon: Gamepad2 },
  { type: "super", value: "iPhone", label: "iPhone 17", rarity: "legendary", color: "#E5E7EB", bg: "rgba(229,231,235,0.1)", Icon: Smartphone },
];
const RARITY_LABEL: Record<string, string> = { common: "Обычный", rare: "Редкий", epic: "Эпик", legendary: "Суперприз" };
const CARD_W = 120, CARD_GAP = 12;

function Countdown({ exp }: { exp: string }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const u = () => { const diff = new Date(exp).getTime() - Date.now(); if (diff <= 0) return; setT({ d: Math.floor(diff / 864e5), h: Math.floor((diff % 864e5) / 36e5), m: Math.floor((diff % 36e5) / 6e4), s: Math.floor((diff % 6e4) / 1e3) }); };
    u(); const i = setInterval(u, 1000); return () => clearInterval(i);
  }, [exp]);
  return (
    <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
      {[{ v: t.d, l: "дней" }, { v: t.h, l: "часов" }, { v: t.m, l: "минут" }, { v: t.s, l: "секунд" }].map(({ v, l }) => (
        <div key={l} style={{ textAlign: "center" }}><div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 28, fontWeight: 700, color: "#6B8CFF", minWidth: 50 }}>{String(v).padStart(2, "0")}</div><div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</div></div>
      ))}
    </div>
  );
}

function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return; const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = window.innerWidth; c.height = window.innerHeight;
    const ps = Array.from({ length: 40 }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height, vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2, s: Math.random() * 1.5 + 0.5, o: Math.random() * 0.4 + 0.1, cl: ["#6B8CFF", "#8B6FFF", "#4ECDC4"][Math.floor(Math.random() * 3)] }));
    let id: number;
    const draw = () => { ctx.clearRect(0, 0, c.width, c.height); ps.forEach((p, i) => { ps.slice(i + 1).forEach((q) => { const d = Math.hypot(p.x - q.x, p.y - q.y); if (d < 100) { ctx.beginPath(); ctx.strokeStyle = `rgba(107,140,255,${0.1 * (1 - d / 100)})`; ctx.lineWidth = 0.5; ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); } }); p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > c.width) p.vx *= -1; if (p.y < 0 || p.y > c.height) p.vy *= -1; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fillStyle = p.cl; ctx.globalAlpha = p.o; ctx.fill(); ctx.globalAlpha = 1; }); id = requestAnimationFrame(draw); };
    draw(); const r = () => { c.width = window.innerWidth; c.height = window.innerHeight; }; window.addEventListener("resize", r); return () => { cancelAnimationFrame(id); window.removeEventListener("resize", r); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}


function CharityCard({ hasSub }: { hasSub: boolean }) {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    const fetchStats = async () => {
      try {
        const r = await fetch("https://api.tuman.help/api/charity/stats", { cache: "no-store" });
        const j = await r.json();
        if (alive) setDays(j.days_available ?? 0);
      } catch {}
    };
    fetchStats();
    const iv = setInterval(fetchStats, 60000);
    return () => { alive = false; clearInterval(iv); };
  }, []);
  const ctaHref = "https://t.me/tumannetbot";
  const ctaLabel = hasSub ? "Пожертвовать дни" : "Попросить помощь";
  return (
    <div style={{ background: "linear-gradient(135deg,rgba(244,127,177,0.08),rgba(139,111,255,0.05))", border: "1px solid rgba(244,127,177,0.18)", borderRadius: 20, padding: "24px 22px", marginTop: 16, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(244,127,177,0.4),transparent)" }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(244,127,177,0.12)", border: "1px solid rgba(244,127,177,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>💙</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Фонд социальной помощи</div>
          <div style={{ fontSize: 12.5, color: "#888", lineHeight: 1.55 }}>{hasSub ? "Поделитесь днями с теми, кому VPN сейчас нужнее." : "Не можете оплатить подписку? Оставьте заявку — поможем."}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "12px 16px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.07em" }}>В фонде сейчас</div>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 22, fontWeight: 700, color: "#F47FB1" }}>{days === null ? "…" : `${days} ${days === 1 ? "день" : days >= 2 && days <= 4 ? "дня" : "дней"}`}</div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <a href={ctaHref} style={{ flex: "1 1 auto", textAlign: "center", background: "linear-gradient(135deg,#F47FB1,#8B6FFF)", color: "#fff", padding: "11px 20px", borderRadius: 11, textDecoration: "none", fontSize: 13.5, fontWeight: 600 }}>{ctaLabel}</a>
        <a href="/charity" style={{ padding: "10px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#888", borderRadius: 11, textDecoration: "none", fontSize: 13 }}>Подробнее</a>
      </div>
    </div>
  );
}


export default function DashboardView({ session }: { session: Session }) {
  const [data, setData] = useState<DashData | null>(null);
  const [ach, setAch] = useState<Achievements | null>(null);
  const [mysteryBox, setMysteryBox] = useState<MysteryBoxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("sub");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifSaved, setNotifSaved] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [freezeMsg, setFreezeMsg] = useState("");
  const [boxPrize, setBoxPrize] = useState<{ type: string; label: string; rarity: string; value: string } | null>(null);
  const [rouletteItems, setRouletteItems] = useState<typeof ROULETTE_PRIZES>([]);
  const [rouletteOffset, setRouletteOffset] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDone, setSpinDone] = useState(false);
  const [mysteryError, setMysteryError] = useState("");
  const [supportMsg, setSupportMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeTicket, setActiveTicket] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [tickets, setTickets] = useState<Array<{ id: number; message: string; status: string; admin_reply: string | null; rating: number | null; rating_locked: boolean; source: string; created_at: string; resolved_at: string | null; messages: Array<{ sender_type: string; message: string; created_at: string }> }>>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/me").then((r) => r.json()),
      fetch("/api/dashboard/achievements").then((r) => r.json()).catch(() => null),
      fetch("/api/dashboard/mystery-box").then((r) => r.json()).catch(() => null),
    ]).then(([me, a, mb]) => { if (!me.error) setData(me); if (a) setAch(a); if (mb) setMysteryBox(mb); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const copy = async (text: string, setter: (v: boolean) => void) => { await navigator.clipboard.writeText(text); setter(true); setTimeout(() => setter(false), 2000); };
  const logout = async () => { await fetch("/api/dashboard/auth", { method: "DELETE" }); window.location.href = "/dashboard/login"; };

  const sc = (s: string) => ({ active: "#4CAF50", trial: "#6B8CFF", expired: "#ff6b6b", frozen: "#4ECDC4" }[s] || "#444");
  const sl = (s: string) => ({ active: "Активна", trial: "Триал", expired: "Истекла", frozen: "Заморожена" }[s] || "Нет подписки");

  const saveNotif = async () => { await fetch("/api/dashboard/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notifications_enabled: notifEnabled }) }); setNotifSaved(true); setTimeout(() => setNotifSaved(false), 2000); };
  const sharePost = () => { const t = `TUMAN VPN — обходит все блокировки.\nYouTube, Instagram, Discord.\nПопробуй: https://tuman.help`; window.open(`https://t.me/share/url?url=https://tuman.help&text=${encodeURIComponent(t)}`); };

  const handleFreeze = async () => {
    if (!confirm("Заморозить подписку? VPN перестанет работать.")) return;
    setFreezing(true);
    try {
      const res = await fetch("/api/dashboard/freeze", { method: "POST" });
      const d = await res.json();
      setFreezeMsg(d.message || "");
      if (d.ok) setTimeout(() => window.location.reload(), 1500);
    } catch { setFreezeMsg("Ошибка"); }
    setFreezing(false);
  };

  const buildReel = (winnerIdx: number) => {
    const items = [];
    for (let i = 0; i < 40; i++) {
      if (i === 32) items.push(ROULETTE_PRIZES[winnerIdx]);
      else items.push(ROULETTE_PRIZES[Math.floor(Math.random() * ROULETTE_PRIZES.length)]);
    }
    return items;
  };

  const spinRoulette = async () => {
    if (isSpinning) return;
    setIsSpinning(true); setSpinDone(false); setBoxPrize(null); setMysteryError("");
    try {
      const res = await fetch("/api/dashboard/mystery-box/open", { method: "POST" });
      const data = await res.json();
      if (!data.ok) { const bs = await fetch("/api/dashboard/mystery-box").then((r) => r.json()); setMysteryBox(bs); setMysteryError(data.message || ""); setIsSpinning(false); return; }
      const winnerIdx = ROULETTE_PRIZES.findIndex((p) => p.type === data.prize.type && (p.value.replace("%", "") === data.prize.value || p.value === data.prize.value));
      const safeIdx = winnerIdx >= 0 ? winnerIdx : 0;
      const reel = buildReel(safeIdx);
      setRouletteItems(reel); setRouletteOffset(0);
      await new Promise((r) => setTimeout(r, 100));
      const finalPos = 32 - 2;
      setRouletteOffset(-(finalPos * (CARD_W + CARD_GAP)));
      setTimeout(() => { setIsSpinning(false); setSpinDone(true); setBoxPrize(data.prize); setMysteryBox((prev) => prev ? { ...prev, can_open: false, days_until: 30 } : prev); }, 5200);
    } catch { setMysteryError("Ошибка сети"); setIsSpinning(false); }
  };

  const sendTicket = async () => {
    if (!supportMsg.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/dashboard/support/ticket", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: supportMsg, ticket_id: activeTicket || undefined }) });
      const d = await res.json();
      if (d.ok) { setSent(true); setSupportMsg(""); if (!activeTicket && d.ticket_id) setActiveTicket(d.ticket_id); const updated = await fetch("/api/dashboard/support/tickets").then((r) => r.json()); setTickets(updated.tickets || []); setTimeout(() => setSent(false), 2000); }
    } catch {}
    setSending(false);
  };

  const rateTicket = async (ticketId: number, rating: number) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket?.rating_locked) return;
    const res = await fetch("/api/dashboard/support/rate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticket_id: ticketId, rating }) });
    const d = await res.json();
    if (d.ok) setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, rating, rating_locked: true } : t));
  };

  const closeTicket = async (ticketId: number) => {
    if (!confirm("Закрыть тикет?")) return;
    setClosing(true);
    try {
      const res = await fetch("/api/dashboard/support/close", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticket_id: ticketId }) });
      const d = await res.json();
      if (d.ok) { const updated = await fetch("/api/dashboard/support/tickets").then((r) => r.json()); setTickets(updated.tickets || []); }
    } catch {}
    setClosing(false);
  };

  const loadTickets = () => {
    fetch("/api/dashboard/support/tickets").then((r) => r.json()).then((d) => setTickets(d.tickets || [])).catch(() => {});
  };

  // Fix sub_url double prefix on frontend side
  const cleanSubUrl = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/https?:\/\/sub\.tuman\.help\/sub\/https?:\/\/sub\.tuman\.help\/(.*)/);
    if (match) return `https://sub.tuman.help/sub/${match[1]}`;
    return url;
  };

  const subUrl = cleanSubUrl(data?.sub_url ?? null);

  const tabs = [{ id: "sub", l: "Подписка" }, { id: "key", l: "Ключ" }, { id: "shield", l: "Защита" }, { id: "trophy", l: "Достижения" }, { id: "ref", l: "Рефералы" }, { id: "pay", l: "Платежи" }, { id: "gear", l: "Настройки" }, { id: "help", l: "Помощь" }];

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Unbounded:wght@600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.aurora{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden}
.a1{position:absolute;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(107,140,255,.08) 0%,transparent 70%);top:-250px;left:-150px;animation:am1 14s ease-in-out infinite alternate}
.a2{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(139,111,255,.07) 0%,transparent 70%);bottom:0;right:-150px;animation:am2 17s ease-in-out infinite alternate}
@keyframes am1{to{transform:translate(100px,80px) scale(1.2)}}@keyframes am2{to{transform:translate(-80px,-60px) scale(1.15)}}
.cd{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:20px;backdrop-filter:blur(20px)}
.tb{padding:10px 18px;border-radius:100px;border:1px solid rgba(255,255,255,.06);background:transparent;color:#444;font-size:13px;cursor:pointer;white-space:nowrap;font-family:'Inter',sans-serif}
.tb.on{background:rgba(107,140,255,.1);border-color:rgba(107,140,255,.25);color:#6B8CFF}
.fi{animation:fi .5s ease forwards}@keyframes fi{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(76,175,80,.4)}50%{opacity:.8;box-shadow:0 0 0 6px rgba(76,175,80,0)}}
.tabs-scroll{overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none;padding-bottom:2px}
.tabs-scroll::-webkit-scrollbar{display:none;width:0;height:0}
      `}</style>
      <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
        <div className="aurora"><div className="a1" /><div className="a2" /></div>
        <Particles />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "40px 24px 100px" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
            <a href="/" style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 700, background: "linear-gradient(135deg, #fff, #6B8CFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textDecoration: "none" }}>TUMAN</a>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {session.photo_url && <img src={session.photo_url} alt="" style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(107,140,255,0.3)" }} />}
              <button onClick={logout} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "#333", padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Выйти</button>
            </div>
          </div>

          {loading ? <div style={{ textAlign: "center", padding: 80, color: "#333" }}>Загрузка...</div> : !data ? (
            <div style={{ textAlign: "center", padding: 80 }}><div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F614}"}</div><div style={{ color: "#444", marginBottom: 24 }}>Аккаунт не найден. Зайди в бота.</div><a href="https://t.me/tumannetbot" style={{ background: "linear-gradient(135deg, #6B8CFF, #8B6FFF)", color: "#fff", padding: "14px 32px", borderRadius: 12, textDecoration: "none", fontWeight: 600 }}>Открыть бота</a></div>
          ) : (
            <>
              {/* Greeting */}
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, background: "linear-gradient(135deg, #fff, #6B8CFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>Привет, {data.session_user?.first_name || data.user.first_name}!</h1>
                <div style={{ fontSize: 13, color: "#444" }}>С нами {data.member_since_days} дней</div>
              </div>

              {/* Tabs */}
              <div className="tabs-scroll" style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {tabs.map((t) => <button key={t.id} className={`tb ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>{t.l}</button>)}
              </div>

              {/* Subscription */}
              {tab === "sub" && (
                <div className="fi">
                  <div className="cd" style={{ padding: 32, marginBottom: 16, textAlign: "center" }}>
                    {data.subscription ? (
                      <>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: sc(data.subscription.status) + "15", border: `1px solid ${sc(data.subscription.status)}30`, borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: sc(data.subscription.status), animation: data.subscription.status === "active" ? "pulse 2s infinite" : "none" }} />
                          <span style={{ fontSize: 13, color: sc(data.subscription.status) }}>{sl(data.subscription.status)}</span>
                        </div>
                        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{PN[data.subscription.plan_id] || data.subscription.plan_id}</div>
                        {data.subscription.expires_at && <><div style={{ fontSize: 13, color: "#444", marginBottom: 24 }}>Истекает: {new Date(data.subscription.expires_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</div><Countdown exp={data.subscription.expires_at} /><div style={{ marginTop: 24 }}><div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, (data.subscription.days_left / 30) * 100)}%`, background: "linear-gradient(90deg, #6B8CFF, #8B6FFF)", borderRadius: 2 }} /></div><div style={{ fontSize: 11, color: "#333", marginTop: 6 }}>Осталось {data.subscription.days_left} дней</div></div></>}
                      </>
                    ) : <><div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F512}"}</div><div style={{ color: "#444", marginBottom: 24 }}>Нет активной подписки</div></>}
                    <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 24 }}>
                      <a href="https://t.me/tumannetbot" style={{ background: "linear-gradient(135deg, #6B8CFF, #8B6FFF)", color: "#fff", padding: "12px 28px", borderRadius: 12, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>{data.subscription?.status === "active" ? "Продлить" : "Подключиться"}</a>
                      {data.subscription?.status === "active" && (
                        <button onClick={handleFreeze} disabled={freezing} style={{ background: "rgba(78,205,196,0.08)", border: "1px solid rgba(78,205,196,0.2)", color: "#4ECDC4", padding: "10px 20px", borderRadius: 12, fontSize: 13, cursor: "pointer" }}>
                          {freezing ? "..." : "Заморозить"}
                        </button>
                      )}
                    </div>
                    {freezeMsg && <div style={{ fontSize: 12, color: "#4ECDC4", marginTop: 8 }}>{freezeMsg}</div>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
                    {[{ l: "Дней с нами", v: data.member_since_days, c: "#6B8CFF" }, { l: "Друзей привёл", v: data.referrals.total, c: "#8B6FFF" }, { l: "Бонус дней", v: data.referrals.bonus_days, c: "#4CAF50" }].map((m) => (
                      <div key={m.l} className="cd" style={{ padding: 20, textAlign: "center" }}><div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 28, fontWeight: 700, color: m.c, marginBottom: 6 }}>{m.v}</div><div style={{ fontSize: 11, color: "#444" }}>{m.l}</div></div>
                    ))}
                  </div>
                  <CharityCard hasSub={!!(data.subscription && data.subscription.status === "active")} />
                  {/* Mystery Box Roulette */}
                  {mysteryBox && (
                    <div style={{ background: "linear-gradient(135deg,rgba(139,111,255,0.1),rgba(107,140,255,0.06))", border: "1px solid rgba(139,111,255,0.2)", borderRadius: 24, padding: "32px 24px", marginTop: 16, position: "relative", overflow: "hidden" }}>
                      <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 11, color: "#8B6FFF", letterSpacing: "0.15em", textAlign: "center", marginBottom: 24, textTransform: "uppercase" }}>Mystery Box</div>

                      {spinDone && boxPrize ? (
                        <div style={{ textAlign: "center", animation: "prizeReveal .8s cubic-bezier(.175,.885,.32,1.275) forwards" }}>
                          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>{Array.from({ length: 30 }, (_, i) => { const cc = ["#FFD700", "#6B8CFF", "#8B6FFF", "#4CAF50", "#ff6b6b", "#4ECDC4"]; return <div key={i} style={{ position: "absolute", left: `${Math.random() * 100}%`, top: -20, width: Math.random() * 8 + 4, height: Math.random() * 8 + 4, borderRadius: i % 2 ? "50%" : 2, background: cc[i % 6], animation: `confettiFall ${Math.random() + 1.5}s ${Math.random() * 0.8}s ease-in forwards` }} />; })}</div>
                          <div style={{ width: 80, height: 80, borderRadius: 20, background: boxPrize.rarity === "epic" ? "rgba(255,215,0,0.15)" : boxPrize.rarity === "rare" ? "rgba(167,139,250,0.15)" : "rgba(74,124,255,0.15)", border: `2px solid ${boxPrize.rarity === "epic" ? "rgba(255,215,0,0.4)" : boxPrize.rarity === "rare" ? "rgba(167,139,250,0.4)" : "rgba(74,124,255,0.4)"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            {(() => { const p = ROULETTE_PRIZES.find((rp) => rp.type === boxPrize.type); if (!p) return null; const I = p.Icon; return <I size={36} color={boxPrize.rarity === "epic" ? "#FFD700" : boxPrize.rarity === "rare" ? "#A78BFA" : "#6B8CFF"} />; })()}
                          </div>
                          <div style={{ display: "inline-block", background: boxPrize.rarity === "epic" ? "linear-gradient(135deg,#FFD700,#F59E0B)" : boxPrize.rarity === "rare" ? "linear-gradient(135deg,#8B6FFF,#6B8CFF)" : "rgba(255,255,255,0.08)", borderRadius: 100, padding: "3px 14px", fontSize: 10, fontWeight: 700, color: boxPrize.rarity === "epic" ? "#000" : "#fff", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>{RARITY_LABEL[boxPrize.rarity] || boxPrize.rarity}</div>
                          <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 700, color: boxPrize.rarity === "epic" ? "#FFD700" : boxPrize.rarity === "rare" ? "#A78BFA" : "#fff", marginBottom: 8 }}>{boxPrize.label}</div>
                          <div style={{ fontSize: 13, color: "#555", marginBottom: 20 }}>Приз применён автоматически</div>
                          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 20px", fontSize: 13, color: "#444" }}>Следующий через <strong style={{ color: "#8B6FFF" }}>30 дней</strong></div>
                        </div>
                      ) : mysteryBox.can_open ? (
                        <div>
                          {rouletteItems.length > 0 ? (
                            <div style={{ position: "relative", marginBottom: 24 }}>
                              <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: 124, height: 144, border: "2px solid #8B6FFF", borderRadius: 14, zIndex: 3, pointerEvents: "none", boxShadow: "0 0 20px rgba(139,111,255,0.4), inset 0 0 20px rgba(139,111,255,0.05)" }} />
                              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,10,20,0.95) 0%, transparent 25%, transparent 75%, rgba(10,10,20,0.95) 100%)", zIndex: 2, pointerEvents: "none", borderRadius: 8 }} />
                              <div style={{ overflow: "hidden", borderRadius: 8 }}>
                                <div style={{ display: "flex", gap: CARD_GAP, transition: isSpinning ? "transform 5s cubic-bezier(0.17,0.67,0.12,0.99)" : "none", willChange: "transform", transform: `translateX(calc(50% - 60px + ${rouletteOffset}px))`, padding: "0 4px" }}>
                                  {rouletteItems.map((prize, i) => { const I = prize.Icon; return (
                                    <div key={i} style={{ flexShrink: 0, width: CARD_W, height: 140, borderRadius: 12, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 8, background: prize.bg, border: `1px solid ${prize.rarity === "legendary" ? "rgba(229,231,235,0.2)" : prize.rarity === "epic" ? "rgba(255,215,0,0.3)" : prize.rarity === "rare" ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.08)"}` }}>
                                      <I size={32} color={prize.color} />
                                      <div style={{ fontSize: 11, fontWeight: 600, color: prize.color, textAlign: "center", lineHeight: 1.3, padding: "0 8px" }}>{prize.label}</div>
                                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{RARITY_LABEL[prize.rarity]}</div>
                                    </div>
                                  ); })}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ textAlign: "center", marginBottom: 24 }}>
                              <div onClick={spinRoulette} style={{ fontSize: 72, display: "inline-block", animation: "floatBox 3s ease-in-out infinite", filter: "drop-shadow(0 0 30px rgba(139,111,255,0.5))", cursor: "pointer", userSelect: "none" as const }}>{"\u{1F381}"}</div>
                              <div style={{ marginTop: 12, fontSize: 14, color: "#555" }}>Нажми чтобы крутить!</div>
                            </div>
                          )}
                          <div style={{ textAlign: "center" }}>
                            <button onClick={spinRoulette} disabled={isSpinning} style={{ background: isSpinning ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#8B6FFF,#6B8CFF)", color: isSpinning ? "#444" : "#fff", border: "none", padding: "14px 40px", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: isSpinning ? "not-allowed" : "pointer", fontFamily: "'Unbounded', sans-serif", letterSpacing: "0.02em", transition: "all 0.3s" }}>
                              {isSpinning ? "Крутится..." : "Открыть Mystery Box"}
                            </button>
                            {mysteryError && <div style={{ marginTop: 12, padding: "10px 16px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 10, fontSize: 13, color: "#ff6b6b", textAlign: "center" }}>{mysteryError}</div>}
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3, filter: "grayscale(80%)" }}>{"\u{1F381}"}</div>
                          <div style={{ color: "#444", fontSize: 14, marginBottom: 8 }}>Следующий приз через</div>
                          <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 40, color: "#8B6FFF", fontWeight: 700 }}>{mysteryBox.days_until}</div>
                          <div style={{ color: "#555", fontSize: 13, marginTop: 4 }}>дней</div>
                        </div>
                      )}
                      {mysteryBox.can_open && (
                        <div style={{ marginTop: 16, textAlign: "center" }}>
                          <a href="https://t.me/tumannetbot?start=mystery" target="_blank" rel="noreferrer" style={{ display: "inline-block", padding: "8px 16px", background: "rgba(107,140,255,0.08)", border: "1px solid rgba(107,140,255,0.25)", borderRadius: 10, color: "#6B8CFF", fontSize: 12, textDecoration: "none" }}>Открыть в Telegram</a>
                        </div>
                      )}
                      {mysteryBox.history && mysteryBox.history.length > 0 && (
                        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, textAlign: "center" }}>Последние открытия</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {mysteryBox.history.slice(0, 3).map((h, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
                                <span style={{ color: "#888" }}>{h.prize_type === "days" ? `+${h.prize_value} дней` : `Промокод ${h.prize_value}`}</span>
                                <span style={{ color: "#444" }}>{h.opened_at ? new Date(h.opened_at).toLocaleDateString("ru-RU") : ""}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <style>{`@keyframes floatBox{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-12px) rotate(2deg)}}@keyframes prizeReveal{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.05);opacity:1}100%{transform:scale(1);opacity:1}}@keyframes confettiFall{0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(400px) rotate(720deg);opacity:0}}`}</style>
                    </div>
                  )}
                </div>
              )}

              {/* Key */}
              {tab === "key" && (
                <div className="fi">
                  <div className="cd" style={{ padding: 32, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>Твой Sub URL</div>
                    {subUrl ? (
                      <>
                        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, marginBottom: 16, wordBreak: "break-all", fontSize: 13, color: "#6B8CFF", fontFamily: "monospace", lineHeight: 1.6 }}>{subUrl}</div>
                        <div style={{ display: "flex", gap: 10, marginBottom: 0 }}>
                          <button onClick={() => copy(subUrl, setCopiedUrl)} style={{ flex: 1, padding: 12, background: copiedUrl ? "rgba(76,175,80,0.15)" : "linear-gradient(135deg, #6B8CFF, #8B6FFF)", border: copiedUrl ? "1px solid rgba(76,175,80,0.3)" : "none", color: copiedUrl ? "#4CAF50" : "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>{copiedUrl ? "\u2705 Скопировано!" : "Скопировать"}</button>
                          <button onClick={() => setShowQR(!showQR)} style={{ padding: "12px 20px", background: showQR ? "rgba(107,140,255,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${showQR ? "rgba(107,140,255,0.25)" : "rgba(255,255,255,0.08)"}`, color: showQR ? "#6B8CFF" : "#666", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>{showQR ? "Скрыть QR" : "QR"}</button>
                        </div>
                        {showQR && (
                          <div style={{ display: "flex", justifyContent: "center", padding: 24, background: "#fff", borderRadius: 16, marginTop: 16 }}>
                            <QRCode value={subUrl} size={180} />
                          </div>
                        )}
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <a href="https://t.me/tumannetbot?start=panic" style={{ display: "flex", alignItems: "center", gap: 8, color: "#ff6b6b", fontSize: 13, textDecoration: "none", opacity: 0.7 }}>
                            Потерял устройство? Сбросить ключ &rarr;
                          </a>
                        </div>
                      </>
                    ) : <div style={{ color: "#444", textAlign: "center", padding: 20 }}>Ключ не найден. Получи его в <a href="https://t.me/tumannetbot" style={{ color: "#6B8CFF" }}>боте</a>.</div>}
                  </div>
                  <div className="cd" style={{ padding: 28 }}>
                    <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 20 }}>Как подключиться</div>
                    {[{ s: "1", t: "Скачай HAPP", href: "https://tuman.help/download" }, { s: "2", t: 'Нажми "+" \u2192 "Добавить подписку"' }, { s: "3", t: "Вставь скопированную ссылку" }, { s: "4", t: "Выбери сервер и включи VPN" }].map((x) => (
                      <div key={x.s} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 12, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(107,140,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#6B8CFF", flexShrink: 0 }}>{x.s}</div>
                        <span style={{ fontSize: 14, color: "#666" }}>{x.t}{x.href && <a href={x.href} style={{ color: "#6B8CFF", marginLeft: 6, textDecoration: "none" }}>&rarr;</a>}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referrals */}
              {tab === "ref" && (
                <div className="fi">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                    {[{ l: "Приглашено", v: data.referrals.total, c: "#6B8CFF" }, { l: "Купили", v: data.referrals.paid, c: "#4CAF50" }, { l: "Бонус дней", v: data.referrals.bonus_days, c: "#FFD700" }].map((m) => (
                      <div key={m.l} className="cd" style={{ padding: 24, textAlign: "center" }}><div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 32, fontWeight: 700, color: m.c, marginBottom: 8 }}>{m.v}</div><div style={{ fontSize: 12, color: "#444" }}>{m.l}</div></div>
                    ))}
                  </div>
                  <div className="cd" style={{ padding: 28 }}>
                    <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>Твоя реферальная ссылка</div>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", marginBottom: 12, fontSize: 13, color: "#6B8CFF", fontFamily: "monospace" }}>{data.referrals.ref_link}</div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => copy(data.referrals.ref_link, setCopiedRef)} style={{ flex: 1, padding: 12, background: copiedRef ? "rgba(76,175,80,0.15)" : "linear-gradient(135deg, #6B8CFF, #8B6FFF)", border: copiedRef ? "1px solid rgba(76,175,80,0.3)" : "none", color: copiedRef ? "#4CAF50" : "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>{copiedRef ? "\u2705 Скопировано!" : "Скопировать"}</button>
                      <button onClick={sharePost} style={{ padding: "12px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#666", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>{"\u{1F4E4}"}</button>
                    </div>
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      {["\u{1F4E4} Поделись ссылкой с другом", "\u{1F464} Друг регистрируется в боте", "\u{1F4B0} Друг покупает подписку", "\u{1F381} Ты получаешь +3 дня"].map((t, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}><span style={{ fontSize: 14, color: "#666" }}>{t}</span></div>
                      ))}
                    </div>
                    {/* Review +3 days */}
                    <a href="https://t.me/tumannetbot?start=review" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", marginTop: 12, background: "rgba(255,193,7,0.06)", border: "1px solid rgba(255,193,7,0.15)", borderRadius: 12, textDecoration: "none" }}>
                      <div>
                        <div style={{ fontSize: 14, color: "#FFD700", fontWeight: 500 }}>Написать отзыв</div>
                        <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>Получи +3 дня к подписке</div>
                      </div>
                      <span style={{ color: "#FFD700", fontSize: 18 }}>&rarr;</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Payments */}
              {tab === "pay" && (
                <div className="fi">
                  <div className="cd" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.07em" }}>История платежей</div>
                    {data.payments.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: "#333" }}>Платежей пока нет</div> : data.payments.map((p, i) => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: i < data.payments.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                        <div><div style={{ fontSize: 14, color: "#fff" }}>{PN[p.plan_id] || p.plan_id}</div><div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>{MN[p.payment_method] || p.payment_method} &middot; {new Date(p.created_at).toLocaleDateString("ru-RU")}</div></div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "#4CAF50" }}>{"\u20BD"}{p.amount_rub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shield / Security */}
              {tab === "shield" && (
                <div className="fi">
                  <div className="cd" style={{ padding: 40, textAlign: "center", marginBottom: 16, background: data.subscription?.status === "active" || data.subscription?.status === "trial" ? "rgba(76,175,80,0.05)" : "rgba(255,107,107,0.05)", borderColor: data.subscription?.status === "active" || data.subscription?.status === "trial" ? "rgba(76,175,80,0.15)" : "rgba(255,107,107,0.15)" }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>{data.subscription?.status === "active" || data.subscription?.status === "trial" ? "\u{1F6E1}" : "\u26A0\uFE0F"}</div>
                    <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 700, color: data.subscription?.status === "active" || data.subscription?.status === "trial" ? "#4CAF50" : "#ff6b6b", marginBottom: 8 }}>{data.subscription?.status === "active" || data.subscription?.status === "trial" ? "Защита активна" : "Подписка неактивна"}</div>
                    <div style={{ fontSize: 14, color: "#444" }}>{data.subscription?.status === "active" || data.subscription?.status === "trial" ? "Твой трафик зашифрован и защищён" : "Активируй подписку для защиты"}</div>
                  </div>
                  <div className="cd" style={{ padding: 28, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 20 }}>Технические параметры</div>
                    {[{ i: "\u{1F510}", l: "Протокол", v: "VLESS + Reality" }, { i: "\u26A1", l: "Transport", v: "TCP + uTLS Chrome" }, { i: "\u{1F441}", l: "Видимость для DPI", v: "Невидим — маскировка под HTTPS" }, { i: "\u{1F4CB}", l: "Логи активности", v: "Не ведутся" }, { i: "\u{1F30D}", l: "Юрисдикция", v: "ЕС (Финляндия, Швеция, Германия)" }, { i: "\u{1F504}", l: "Kill Switch", v: "В настройках HAPP" }].map((x, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: idx < 5 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <span style={{ fontSize: 14, color: "#555" }}>{x.i} {x.l}</span>
                        <span style={{ fontSize: 14, color: "#fff", textAlign: "right", maxWidth: "55%" }}>{x.v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "rgba(107,140,255,0.05)", border: "1px solid rgba(107,140,255,0.12)", borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#6B8CFF", marginBottom: 8 }}>{"\u{1F512}"} No-Log Policy</div>
                    <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>TUMAN не хранит логи твоей активности. Мы не знаем какие сайты ты посещаешь, когда и как долго. Технически невозможно передать данные — их просто не существует.</div>
                  </div>
                </div>
              )}

              {/* Achievements */}
              {tab === "trophy" && ach && (
                <div className="fi">
                  <div className="cd" style={{ padding: 28, marginBottom: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>{ach.level === 4 ? "\u{1F451}" : ach.level === 3 ? "\u{1F32B}" : ach.level === 2 ? "\u26A1" : "\u{1F331}"}</div>
                    <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 22, fontWeight: 700, color: LVL_COLORS[ach.level], marginBottom: 8 }}>{LVL_NAMES[ach.level]}</div>
                    <div style={{ fontSize: 13, color: "#444", marginBottom: 20 }}>{ach.xp} XP</div>
                    {ach.level < 4 && <><div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}><div style={{ height: "100%", width: `${Math.min(100, ((ach.xp - LVL_XP[ach.level]) / ((LVL_XP[ach.level + 1] || ach.xp + 100) - LVL_XP[ach.level])) * 100)}%`, background: `linear-gradient(90deg, ${LVL_COLORS[ach.level]}, #8B6FFF)`, borderRadius: 3 }} /></div><div style={{ fontSize: 11, color: "#333" }}>До {LVL_NAMES[ach.level + 1]}: {LVL_XP[ach.level + 1] - ach.xp} XP</div></>}
                  </div>
                  <div className="cd" style={{ padding: 28 }}>
                    <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>Прогресс</div>
                    {[{ l: "Друзей привёл", v: ach.progress.refs_total, t: 5 }, { l: "Друзей купили", v: ach.progress.refs_paid, t: 5 }, { l: "Дней подписки", v: ach.progress.days_subscribed, t: 90 }].map((p) => (
                      <div key={p.l} style={{ marginBottom: 16 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, color: "#666" }}>{p.l}</span><span style={{ fontSize: 13, color: "#fff" }}>{p.v}/{p.t}</span></div><div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, (p.v / p.t) * 100)}%`, background: "linear-gradient(90deg, #6B8CFF, #8B6FFF)", borderRadius: 2 }} /></div></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings */}
              {tab === "gear" && (
                <div className="fi">
                  <div className="cd" style={{ padding: 28, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 20 }}>Уведомления</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", marginBottom: 16 }}>
                      <span style={{ fontSize: 14, color: "#fff" }}>Уведомления о продлении</span>
                      <button onClick={() => setNotifEnabled(!notifEnabled)} style={{ width: 44, height: 24, borderRadius: 12, background: notifEnabled ? "#6B8CFF" : "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", position: "relative" }}><div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: notifEnabled ? 23 : 3, transition: "all 0.3s" }} /></button>
                    </div>
                    <button onClick={saveNotif} style={{ width: "100%", padding: 12, background: notifSaved ? "rgba(76,175,80,0.15)" : "linear-gradient(135deg, #6B8CFF, #8B6FFF)", color: notifSaved ? "#4CAF50" : "#fff", border: notifSaved ? "1px solid rgba(76,175,80,0.3)" : "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{notifSaved ? "\u2705 Сохранено!" : "Сохранить"}</button>
                  </div>
                  <div className="cd" style={{ padding: 28 }}>
                    <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>Аккаунт</div>
                    {data && [["Telegram ID", String(data.user.id)], ["Username", `@${data.user.username || "нет"}`], ["С нами с", new Date(data.user.created_at).toLocaleDateString("ru-RU")]].map(([l, v], i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}><span style={{ fontSize: 14, color: "#555" }}>{l}</span><span style={{ fontSize: 14, color: "#fff" }}>{v}</span></div>
                    ))}
                    <button onClick={logout} style={{ width: "100%", marginTop: 16, padding: 12, background: "transparent", border: "1px solid rgba(255,107,107,0.2)", color: "#ff6b6b", borderRadius: 10, fontSize: 14, cursor: "pointer" }}>Выйти из кабинета</button>
                  </div>
                </div>
              )}

              {/* Help / Support */}
              {tab === "help" && (
                <div className="fi" ref={() => { if (tickets.length === 0) loadTickets(); }}>
                  <div className="cd" style={{ padding: 28, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>{activeTicket ? `Продолжить тикет #${activeTicket}` : "Новое обращение"}</div>
                    {activeTicket && <button onClick={() => setActiveTicket(null)} style={{ background: "transparent", border: "none", color: "#555", fontSize: 12, cursor: "pointer", marginBottom: 12, display: "block" }}>&larr; Новый тикет</button>}
                    <textarea value={supportMsg} onChange={(e) => setSupportMsg(e.target.value)} placeholder={activeTicket ? "Напиши продолжение..." : "Опиши проблему — устройство, сервер, что происходит..."} rows={4} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", color: "#fff", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, boxSizing: "border-box" as const, marginBottom: 12 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#333" }}>{supportMsg.length}/2000</span>
                      <button onClick={sendTicket} disabled={!supportMsg.trim() || sending} style={{ background: sent ? "rgba(76,175,80,0.15)" : supportMsg.trim() ? "linear-gradient(135deg,#6B8CFF,#8B6FFF)" : "rgba(255,255,255,0.05)", color: sent ? "#4CAF50" : supportMsg.trim() ? "#fff" : "#333", border: sent ? "1px solid rgba(76,175,80,0.3)" : "none", padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: supportMsg.trim() ? "pointer" : "not-allowed" }}>
                        {sent ? "\u2705 Отправлено!" : sending ? "..." : "Отправить"}
                      </button>
                    </div>
                  </div>
                  {tickets.length > 0 && (
                    <div className="cd" style={{ overflow: "hidden", marginBottom: 16 }}>
                      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.07em" }}>История обращений</div>
                      {tickets.map((ticket, i) => (
                        <div key={ticket.id} style={{ padding: "20px 24px", borderBottom: i < tickets.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={{ fontSize: 13, color: "#666" }}>#{ticket.id}</span>
                              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 100, background: ticket.status === "resolved" ? "rgba(76,175,80,0.1)" : ticket.status === "in_progress" ? "rgba(255,215,0,0.1)" : "rgba(107,140,255,0.1)", color: ticket.status === "resolved" ? "#4CAF50" : ticket.status === "in_progress" ? "#FFD700" : "#6B8CFF" }}>
                                {ticket.status === "resolved" ? "Закрыт" : ticket.status === "in_progress" ? "В работе" : "Новый"}
                              </span>
                            </div>
                            <span style={{ fontSize: 11, color: "#333" }}>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 12 }}>
                            {(ticket.messages?.length > 0 ? ticket.messages : [{ sender_type: "user", message: ticket.message, created_at: ticket.created_at }]).map((msg, mi) => (
                              <div key={mi} style={{ padding: "10px 14px", borderRadius: 10, background: msg.sender_type === "admin" ? "rgba(107,140,255,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${msg.sender_type === "admin" ? "rgba(107,140,255,0.15)" : "rgba(255,255,255,0.06)"}`, maxWidth: "90%", alignSelf: msg.sender_type === "admin" ? "flex-start" : "flex-end" } as React.CSSProperties}>
                                {msg.sender_type === "admin" && <div style={{ fontSize: 10, color: "#6B8CFF", marginBottom: 4, fontWeight: 600 }}>Поддержка TUMAN</div>}
                                <div style={{ fontSize: 14, color: "#ccc", lineHeight: 1.5 }}>{msg.message}</div>
                                {msg.created_at && <div style={{ fontSize: 10, color: "#333", marginTop: 4 }}>{new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</div>}
                              </div>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                            {ticket.status !== "resolved" && <button onClick={() => setActiveTicket(ticket.id)} style={{ background: "rgba(107,140,255,0.1)", border: "1px solid rgba(107,140,255,0.2)", color: "#6B8CFF", padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Ответить</button>}
                            {ticket.status === "in_progress" && <button onClick={() => closeTicket(ticket.id)} disabled={closing} style={{ background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.2)", color: "#4CAF50", padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Проблема решена</button>}
                            {ticket.status === "resolved" && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 12, color: "#444" }}>{ticket.rating_locked ? "Оценка:" : "Оцените:"}</span>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button key={star} onClick={() => !ticket.rating_locked && rateTicket(ticket.id, star)} style={{ background: "transparent", border: "none", fontSize: 18, cursor: ticket.rating_locked ? "default" : "pointer", opacity: ticket.rating ? (star <= ticket.rating ? 1 : 0.2) : 0.3, transition: "all 0.2s", transform: ticket.rating && star <= ticket.rating ? "scale(1.2)" : "scale(1)" }}>{"\u2B50"}</button>
                                ))}
                                {ticket.rating_locked && <span style={{ fontSize: 11, color: "#4CAF50" }}>{"\u2713"}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="cd" style={{ padding: 28 }}>
                    <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 20 }}>Частые вопросы</div>
                    {[{ q: "Не работает YouTube?", a: "Попробуй Stockholm или Frankfurt" }, { q: "Медленная скорость?", a: "Переключись на другой сервер" }, { q: "Сломались банки?", a: "Включи Split Tunneling в HAPP" }, { q: "Не работает на LTE?", a: "Используй LTE-серверы" }, { q: "Потерял телефон?", a: "Panic Button в табе Ключ" }].map((f, i) => (
                      <div key={i} style={{ padding: "14px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}><div style={{ fontSize: 14, color: "#fff", marginBottom: 4 }}>{f.q}</div><div style={{ fontSize: 13, color: "#444" }}>{f.a}</div></div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
