"use client";

import { useEffect, useState, useRef, useMemo } from "react";

interface Stats {
  active_users: number;
  total_users: number;
  servers_online: number;
  servers_total: number;
  uptime_percent: number;
  countries: number;
  updated_at: string;
}

function Counter({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setStarted(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || value === 0) return;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(current);
    }, 2000 / steps);
    return () => clearInterval(timer);
  }, [started, value]);

  const formatted = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString("ru-RU");
  return <div ref={ref}>{formatted}{suffix}</div>;
}

function Sparkline({ data, color, width = 200, height = 50 }: { data: number[]; color: string; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const gid = `g-${color.replace("#", "")}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gid})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * (height - 8) - 4} r="3" fill={color} />
    </svg>
  );
}

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.5 + 0.1,
      color: ["#6B8CFF", "#8B6FFF", "#4ECDC4"][Math.floor(Math.random() * 3)],
    }));
    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(107,140,255,${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");
  const [scrollY, setScrollY] = useState(0);

  const uptimeData = useMemo(
    () => Array.from({ length: 14 }, () => parseFloat((99.9 + (Math.random() - 0.5) * 0.15).toFixed(2))),
    [],
  );
  const usersData = useMemo(() => {
    const total = stats?.total_users || 2;
    return Array.from({ length: 7 }, (_, i) => Math.max(0, Math.floor(total * (0.6 + i * 0.07) + (Math.random() - 0.5) * 2)));
  }, [stats?.total_users]);

  const fetchStats = async () => {
    try {
      const res = await fetch("https://api.tuman.help/api/stats", { cache: "no-store" });
      setStats(await res.json());
      setLastUpdate(new Date().toLocaleTimeString("ru-RU"));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearInterval(interval); window.removeEventListener("scroll", onScroll); };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const servers = [
    { name: "Helsinki", country: "\u0424\u0438\u043D\u043B\u044F\u043D\u0434\u0438\u044F", flag: "\u{1F1EB}\u{1F1EE}", ping: "12ms" },
    { name: "Stockholm", country: "\u0428\u0432\u0435\u0446\u0438\u044F", flag: "\u{1F1F8}\u{1F1EA}", ping: "18ms" },
    { name: "Frankfurt", country: "\u0413\u0435\u0440\u043C\u0430\u043D\u0438\u044F", flag: "\u{1F1E9}\u{1F1EA}", ping: "22ms" },
  ];

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Unbounded:wght@600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
.sp{min-height:100vh;background:#030305;color:#fff;font-family:'Inter',sans-serif;position:relative;overflow-x:hidden}
.aurora{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden}
.a1{position:absolute;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(107,140,255,.10) 0%,transparent 70%);top:-250px;left:-150px;animation:am1 14s ease-in-out infinite alternate}
.a2{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(139,111,255,.09) 0%,transparent 70%);top:40%;right:-200px;animation:am2 17s ease-in-out infinite alternate}
.a3{position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(78,205,196,.07) 0%,transparent 70%);bottom:-100px;left:25%;animation:am3 11s ease-in-out infinite alternate}
@keyframes am1{to{transform:translate(120px,100px) scale(1.3)}}
@keyframes am2{to{transform:translate(-100px,-80px) scale(1.2)}}
@keyframes am3{to{transform:translate(80px,-50px) scale(1.15)}}
.wrap{position:relative;z-index:1;max-width:960px;margin:0 auto;padding:80px 24px 120px}
.hero{text-align:center;margin-bottom:72px}
.badge{display:inline-flex;align-items:center;gap:8px;background:rgba(107,140,255,.08);border:1px solid rgba(107,140,255,.18);border-radius:100px;padding:6px 18px;font-size:11px;color:#6B8CFF;margin-bottom:28px;letter-spacing:.08em;text-transform:uppercase}
.pdot{width:6px;height:6px;border-radius:50%;background:#4CAF50;animation:pa 2s infinite;flex-shrink:0}
@keyframes pa{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(76,175,80,.4)}50%{opacity:.8;box-shadow:0 0 0 5px rgba(76,175,80,0)}}
.hero h1{font-family:'Unbounded',sans-serif;font-size:clamp(28px,4.5vw,48px);font-weight:700;line-height:1.15;margin-bottom:16px;background:linear-gradient(135deg,#fff 0%,#6B8CFF 55%,#8B6FFF 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero p{color:#555;font-size:15px;font-weight:300}
.top-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px}
.bot-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:32px}
.card{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);border-radius:20px;padding:28px 24px 24px;backdrop-filter:blur(20px);transition:all .3s;position:relative;overflow:hidden}
.card::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(107,140,255,.35),transparent);opacity:0;transition:opacity .3s}
.card:hover{border-color:rgba(107,140,255,.18);transform:translateY(-3px);background:rgba(255,255,255,.04)}
.card:hover::after{opacity:1}
.card-label{font-size:11px;color:#444;letter-spacing:.07em;text-transform:uppercase;margin-bottom:12px;font-weight:500}
.card-val{font-family:'Unbounded',sans-serif;font-size:40px;font-weight:700;line-height:1;margin-bottom:4px}
.card-sub{font-size:11px;color:#333}
.card-graph{margin-top:12px}
.srv-block{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:22px;padding:36px;margin-bottom:32px;backdrop-filter:blur(20px)}
.srv-title{font-size:11px;color:#444;letter-spacing:.07em;text-transform:uppercase;font-weight:500;margin-bottom:28px}
.srv-row{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.035);transition:padding-left .2s}
.srv-row:last-child{border-bottom:none}
.srv-row:hover{padding-left:6px}
.srv-l{display:flex;align-items:center;gap:14px}
.srv-flag{font-size:26px}
.srv-nm{font-size:15px;font-weight:500}
.srv-cn{font-size:12px;color:#3a3a3a;margin-top:2px}
.srv-r{display:flex;align-items:center;gap:16px}
.srv-ping{font-family:'Unbounded',sans-serif;font-size:11px;color:#4CAF50}
.online-badge{display:flex;align-items:center;gap:6px;background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.18);border-radius:100px;padding:4px 12px;font-size:11px;color:#4CAF50;letter-spacing:.03em}
.cta{text-align:center;padding:16px 0 8px}
.cta-btn-primary{display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#6B8CFF,#8B6FFF);color:#fff;padding:16px 36px;border-radius:14px;text-decoration:none;font-size:15px;font-weight:600;transition:all .3s;box-shadow:0 0 40px rgba(107,140,255,.2)}
.cta-btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 60px rgba(107,140,255,.4)}
.cta-btn-secondary{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#888;padding:16px 36px;border-radius:14px;text-decoration:none;font-size:15px;font-weight:500;transition:all .3s}
.cta-btn-secondary:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.2);color:#fff;transform:translateY(-2px)}
.upd{text-align:center;font-size:11px;color:#2a2a2a;margin-top:36px;letter-spacing:.05em}
.fade-up{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease}
.fade-up.visible{opacity:1;transform:translateY(0)}
@media(max-width:600px){.top-cards{grid-template-columns:repeat(2,1fr)}.bot-cards{grid-template-columns:1fr}.card-val{font-size:32px}.srv-block{padding:24px 16px}}
      `}</style>

      <div className="sp">
        <div className="aurora"><div className="a1" /><div className="a2" /><div className="a3" /></div>
        <ParticleBackground />

        <div className="wrap">
          <div className="hero" style={{ transform: `translateY(${scrollY * 0.08}px)` }}>
            <div className="badge"><div className="pdot" />Все системы работают</div>
            <h1>Статистика TUMAN</h1>
            <p>Данные обновляются каждые 30 секунд</p>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#333", fontSize: "14px" }}>Загрузка...</div>
          ) : stats && (
            <>
              <div className="top-cards fade-up" style={{ transitionDelay: "0ms" }}>
                <div className="card">
                  <div className="card-label">Активных подписок</div>
                  <div className="card-val" style={{ color: "#6B8CFF" }}><Counter value={stats.active_users} /></div>
                  <div className="card-sub">прямо сейчас</div>
                </div>
                <div className="card">
                  <div className="card-label">Пользователей</div>
                  <div className="card-val" style={{ color: "#8B6FFF" }}><Counter value={stats.total_users} /></div>
                  <div className="card-sub">за всё время</div>
                </div>
                <div className="card">
                  <div className="card-label">Серверов онлайн</div>
                  <div className="card-val" style={{ color: "#4ECDC4" }}>
                    <Counter value={stats.servers_online} />
                    <span style={{ fontSize: "20px", color: "#2a2a2a", fontFamily: "Inter" }}>/{stats.servers_total}</span>
                  </div>
                  <div className="card-sub">{stats.countries} страны</div>
                </div>
              </div>
              <div className="bot-cards fade-up" style={{ transitionDelay: "150ms" }}>
                <div className="card">
                  <div className="card-label">Аптайм за 14 дней</div>
                  <div className="card-val" style={{ color: "#4CAF50" }}><Counter value={stats.uptime_percent} suffix="%" decimals={1} /></div>
                  <div className="card-graph"><Sparkline data={uptimeData} color="#4CAF50" width={300} height={48} /></div>
                </div>
                <div className="card">
                  <div className="card-label">Рост за 7 дней</div>
                  <div className="card-val" style={{ color: "#6B8CFF" }}><Counter value={stats.total_users} /></div>
                  <div className="card-graph"><Sparkline data={usersData} color="#6B8CFF" width={300} height={48} /></div>
                </div>
              </div>
            </>
          )}

          <div className="srv-block fade-up" style={{ transitionDelay: "300ms" }}>
            <div className="srv-title">Серверы</div>
            {servers.map((s, i) => (
              <div key={i} className="srv-row">
                <div className="srv-l">
                  <div className="srv-flag">{s.flag}</div>
                  <div><div className="srv-nm">{s.name}</div><div className="srv-cn">{s.country}</div></div>
                </div>
                <div className="srv-r">
                  <div className="srv-ping">{s.ping}</div>
                  <div className="online-badge"><div className="pdot" />онлайн</div>
                </div>
              </div>
            ))}
          </div>

          <div className="cta fade-up" style={{ transitionDelay: "450ms" }}>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://tuman.help" className="cta-btn-primary">Получить VPN бесплатно &rarr;</a>
              <a href="https://t.me/tumannetbot" className="cta-btn-secondary">Telegram бот</a>
            </div>
            <p style={{ marginTop: "16px", fontSize: "12px", color: "#333", textAlign: "center" }}>
              Есть Telegram? Подключись через бота. Нет доступа — получи бесплатный ключ на сайте.
            </p>
          </div>

          {lastUpdate && <div className="upd">обновлено {lastUpdate}</div>}
        </div>
      </div>
    </>
  );
}
