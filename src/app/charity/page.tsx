"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Heart,
  HandHeart,
  ShieldCheck,
  Users,
  Sparkles,
  Calendar,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Gift,
} from "lucide-react";

interface CharityStats {
  days_available: number;
  total_donated: number;
  total_given: number;
  requests_pending: number;
  updated_at: string;
}

/* ───────────────────────── helpers ───────────────────────── */

function formatDays(n: number) {
  const abs = Math.abs(n) % 100;
  const mod = abs % 10;
  if (abs > 10 && abs < 20) return `${n} дней`;
  if (mod === 1) return `${n} день`;
  if (mod >= 2 && mod <= 4) return `${n} дня`;
  return `${n} дней`;
}

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.5 });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (inView) setStarted(true);
  }, [inView]);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const start = performance.now();
    const from = display;
    const to = value;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString("ru-RU")}
      {suffix}
    </span>
  );
}

/* ───────────────────── canvas particle field ───────────────────── */

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      size: Math.random() * 1.6 + 0.5,
      opacity: Math.random() * 0.5 + 0.15,
      color: ["#6B8CFF", "#8B6FFF", "#4ECDC4", "#F47FB1"][Math.floor(Math.random() * 4)],
    }));
    let animId = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139,111,255,${0.12 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
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
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

/* ─────────────────────── page ─────────────────────── */

export default function CharityPage() {
  const [stats, setStats] = useState<CharityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("https://api.tuman.help/api/charity/stats", { cache: "no-store" });
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const iv = setInterval(fetchStats, 30000);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearInterval(iv);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const poolDays = stats?.days_available ?? 0;
  const totalDonated = stats?.total_donated ?? 0;
  const totalGiven = stats?.total_given ?? 0;

  const donorSteps = [
    {
      icon: <Heart size={22} />,
      title: "Поделитесь днями",
      text:
        "Зайдите в бота, откройте «Помочь сообществу» и выберите, сколько дней готовы отдать — 1, 3, 5 или 7.",
    },
    {
      icon: <Gift size={22} />,
      title: "Дни уходят в фонд",
      text:
        "Срок вашей подписки автоматически уменьшается на это число, а дни попадают в общий пул.",
    },
    {
      icon: <Sparkles size={22} />,
      title: "Кто-то получает помощь",
      text:
        "Когда новый запрос одобряется модераторами — дни выдаются тем, кто не может платить за VPN сам.",
    },
  ];

  const recipientSteps = [
    {
      icon: <MessageCircle size={22} />,
      title: "Оставьте заявку",
      text:
        "Напишите в 1–2 предложениях, почему сейчас не получается оплатить. Это прочитают только модераторы.",
    },
    {
      icon: <ShieldCheck size={22} />,
      title: "Модерация",
      text:
        "Мы вручную проверяем, что аккаунту больше 14 дней, нет активной подписки и запрос подан честно.",
    },
    {
      icon: <CheckCircle2 size={22} />,
      title: "7 дней бесплатно",
      text:
        "При одобрении получите ключ для подключения на 7 дней. Повторная заявка — раз в 90 дней.",
    },
  ];

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Unbounded:wght@600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
.cp{min-height:100vh;background:#030305;color:#fff;font-family:'Inter',sans-serif;position:relative;overflow-x:hidden}
.aurora{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden}
.a1{position:absolute;width:720px;height:720px;border-radius:50%;background:radial-gradient(circle,rgba(107,140,255,.12) 0%,transparent 70%);top:-260px;left:-160px;animation:am1 15s ease-in-out infinite alternate}
.a2{position:absolute;width:640px;height:640px;border-radius:50%;background:radial-gradient(circle,rgba(244,127,177,.09) 0%,transparent 70%);top:35%;right:-200px;animation:am2 18s ease-in-out infinite alternate}
.a3{position:absolute;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(139,111,255,.10) 0%,transparent 70%);bottom:-120px;left:28%;animation:am3 12s ease-in-out infinite alternate}
@keyframes am1{to{transform:translate(120px,100px) scale(1.3)}}
@keyframes am2{to{transform:translate(-110px,-80px) scale(1.2)}}
@keyframes am3{to{transform:translate(80px,-50px) scale(1.15)}}
.wrap{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:72px 24px 140px}
.hero{text-align:center;margin-bottom:80px}
.badge{display:inline-flex;align-items:center;gap:8px;background:rgba(244,127,177,.08);border:1px solid rgba(244,127,177,.2);border-radius:100px;padding:6px 18px;font-size:11px;color:#F47FB1;margin-bottom:28px;letter-spacing:.08em;text-transform:uppercase}
.pdot{width:6px;height:6px;border-radius:50%;background:#F47FB1;animation:pa 2s infinite;flex-shrink:0}
@keyframes pa{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(244,127,177,.4)}50%{opacity:.8;box-shadow:0 0 0 6px rgba(244,127,177,0)}}
.hero h1{font-family:'Unbounded',sans-serif;font-size:clamp(32px,5vw,56px);font-weight:700;line-height:1.1;margin-bottom:22px;background:linear-gradient(135deg,#fff 0%,#F47FB1 45%,#8B6FFF 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero p.sub{color:#888;font-size:17px;font-weight:300;max-width:680px;margin:0 auto;line-height:1.6}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:72px}
.stat-card{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:22px;padding:32px 28px 28px;backdrop-filter:blur(24px);transition:all .35s;position:relative;overflow:hidden}
.stat-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(244,127,177,.04),transparent 60%);pointer-events:none;opacity:0;transition:opacity .35s}
.stat-card:hover{transform:translateY(-4px);border-color:rgba(244,127,177,.25);background:rgba(255,255,255,.04)}
.stat-card:hover::before{opacity:1}
.stat-label{font-size:11px;color:#555;letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px;font-weight:500;display:flex;align-items:center;gap:8px}
.stat-val{font-family:'Unbounded',sans-serif;font-size:44px;font-weight:700;line-height:1;margin-bottom:6px;background:linear-gradient(135deg,#fff 0%,#F47FB1 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.stat-sub{font-size:12px;color:#444}
.section-title{font-family:'Unbounded',sans-serif;font-size:clamp(24px,3.2vw,36px);font-weight:600;text-align:center;margin-bottom:16px}
.section-sub{color:#777;text-align:center;font-size:15px;max-width:640px;margin:0 auto 48px;line-height:1.6}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:84px}
.col-card{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:24px;padding:36px 32px;backdrop-filter:blur(24px);transition:all .35s;position:relative;overflow:hidden}
.col-card::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--accent,rgba(244,127,177,.4)),transparent);opacity:.6;transition:opacity .3s}
.col-card:hover{transform:translateY(-3px);background:rgba(255,255,255,.035);border-color:var(--accent-border,rgba(244,127,177,.2))}
.col-icon-wrap{width:56px;height:56px;border-radius:18px;display:flex;align-items:center;justify-content:center;background:var(--accent-bg,rgba(244,127,177,.08));border:1px solid var(--accent-border,rgba(244,127,177,.2));color:var(--accent,#F47FB1);margin-bottom:20px}
.col-title{font-family:'Unbounded',sans-serif;font-size:22px;font-weight:600;margin-bottom:14px;color:#fff}
.col-text{color:#8a8a8a;font-size:14px;line-height:1.65;margin-bottom:24px;min-height:80px}
.col-steps{display:flex;flex-direction:column;gap:16px}
.col-step{display:flex;gap:14px;align-items:flex-start;padding:14px 16px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04);border-radius:14px;transition:all .25s}
.col-step:hover{background:rgba(255,255,255,.035);border-color:rgba(255,255,255,.08)}
.col-step-icon{flex-shrink:0;width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:var(--accent-bg,rgba(244,127,177,.08));color:var(--accent,#F47FB1)}
.col-step-text .t{font-weight:600;color:#fff;font-size:14px;margin-bottom:3px}
.col-step-text .d{color:#666;font-size:12.5px;line-height:1.55}
.rules-block{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:22px;padding:40px 40px 36px;backdrop-filter:blur(20px);margin-bottom:72px}
.rules-title{font-family:'Unbounded',sans-serif;font-size:22px;font-weight:600;margin-bottom:28px;text-align:center}
.rules-list{display:grid;grid-template-columns:repeat(2,1fr);gap:18px 32px}
.rule{display:flex;gap:14px;align-items:flex-start}
.rule-icon{flex-shrink:0;color:#6B8CFF;margin-top:2px}
.rule-t{font-weight:600;color:#fff;font-size:14px;margin-bottom:3px}
.rule-d{color:#777;font-size:13px;line-height:1.55}
.cta{text-align:center;padding:20px 0 0}
.cta-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.cta-primary{display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#F47FB1,#8B6FFF);color:#fff;padding:17px 40px;border-radius:14px;text-decoration:none;font-size:15px;font-weight:600;transition:all .3s;box-shadow:0 0 50px rgba(244,127,177,.28)}
.cta-primary:hover{transform:translateY(-2px);box-shadow:0 0 70px rgba(244,127,177,.45)}
.cta-secondary{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#bbb;padding:17px 40px;border-radius:14px;text-decoration:none;font-size:15px;font-weight:500;transition:all .3s}
.cta-secondary:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.2);color:#fff;transform:translateY(-2px)}
.cta-hint{margin-top:18px;font-size:12.5px;color:#3a3a3a}
.updated{text-align:center;font-size:11px;color:#2a2a2a;margin-top:40px;letter-spacing:.05em}
@media(max-width:720px){.stats-grid{grid-template-columns:1fr}.two-col{grid-template-columns:1fr}.rules-list{grid-template-columns:1fr}.rules-block{padding:28px 22px}.col-card{padding:28px 22px}.col-text{min-height:auto}}
      `}</style>

      <div className="cp">
        <div className="aurora">
          <div className="a1" />
          <div className="a2" />
          <div className="a3" />
        </div>
        <ParticleBackground />

        <div className="wrap">
          {/* HERO */}
          <motion.div
            className="hero"
            style={{ transform: `translateY(${scrollY * 0.06}px)` }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="badge">
              <div className="pdot" />
              Фонд сообщества
            </div>
            <h1>TUMAN Charity Pool</h1>
            <p className="sub">
              Делитесь днями подписки с теми, кому она сейчас нужнее. Простой способ сделать интернет
              свободнее — вместе.
            </p>
          </motion.div>

          {/* LIVE STATS */}
          <motion.div
            className="stats-grid"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="stat-card" style={{ ["--accent" as string]: "#F47FB1" }}>
              <div className="stat-label">
                <Heart size={13} /> В фонде сейчас
              </div>
              <div className="stat-val">
                {loading ? "…" : <Counter value={poolDays} />}
              </div>
              <div className="stat-sub">{loading ? "загрузка" : formatDays(poolDays) + " готовы к выдаче"}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">
                <HandHeart size={13} /> Всего пожертвовано
              </div>
              <div className="stat-val">
                {loading ? "…" : <Counter value={totalDonated} />}
              </div>
              <div className="stat-sub">{loading ? "загрузка" : formatDays(totalDonated)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">
                <Users size={13} /> Уже выдано нуждающимся
              </div>
              <div className="stat-val">
                {loading ? "…" : <Counter value={totalGiven} />}
              </div>
              <div className="stat-sub">{loading ? "загрузка" : formatDays(totalGiven)}</div>
            </div>
          </motion.div>

          {/* TWO-COLUMN DONOR / RECIPIENT */}
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            Как это работает
          </motion.h2>
          <motion.p
            className="section-sub"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Две роли, одна идея: те, у кого есть лишние дни — делятся. Те, кому сейчас непросто —
            получают помощь.
          </motion.p>

          <div className="two-col">
            {/* DONOR */}
            <motion.div
              className="col-card"
              style={{
                ["--accent" as string]: "#F47FB1",
                ["--accent-bg" as string]: "rgba(244,127,177,.1)",
                ["--accent-border" as string]: "rgba(244,127,177,.25)",
              }}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55 }}
            >
              <div className="col-icon-wrap">
                <Heart size={26} />
              </div>
              <div className="col-title">Стать донором</div>
              <div className="col-text">
                Есть лишние дни на подписке? Отправьте 1, 3, 5 или 7 дней в общий фонд. Не обязательно
                жертвовать много — важна сама привычка делиться.
              </div>
              <div className="col-steps">
                {donorSteps.map((s, i) => (
                  <div key={i} className="col-step">
                    <div className="col-step-icon">{s.icon}</div>
                    <div className="col-step-text">
                      <div className="t">{s.title}</div>
                      <div className="d">{s.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RECIPIENT */}
            <motion.div
              className="col-card"
              style={{
                ["--accent" as string]: "#6B8CFF",
                ["--accent-bg" as string]: "rgba(107,140,255,.1)",
                ["--accent-border" as string]: "rgba(107,140,255,.25)",
              }}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <div className="col-icon-wrap">
                <HandHeart size={26} />
              </div>
              <div className="col-title">Попросить помощь</div>
              <div className="col-text">
                Если сейчас платить за подписку невозможно — оставьте заявку. Мы выдаём{" "}
                {formatDays(7)} бесплатного доступа после ручной проверки. Никаких документов не
                нужно.
              </div>
              <div className="col-steps">
                {recipientSteps.map((s, i) => (
                  <div key={i} className="col-step">
                    <div className="col-step-icon">{s.icon}</div>
                    <div className="col-step-text">
                      <div className="t">{s.title}</div>
                      <div className="d">{s.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RULES */}
          <motion.div
            className="rules-block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
          >
            <div className="rules-title">Правила фонда</div>
            <div className="rules-list">
              <div className="rule">
                <Clock size={20} className="rule-icon" />
                <div>
                  <div className="rule-t">Аккаунт старше 14 дней</div>
                  <div className="rule-d">
                    Чтобы фондом не злоупотребляли — заявки принимаются от пользователей, которые с
                    нами больше двух недель.
                  </div>
                </div>
              </div>
              <div className="rule">
                <Calendar size={20} className="rule-icon" />
                <div>
                  <div className="rule-t">Одна заявка раз в 90 дней</div>
                  <div className="rule-d">
                    Помощь — экстренная мера. Если у вас и дальше нет возможности платить, напишите
                    в поддержку: подумаем вместе.
                  </div>
                </div>
              </div>
              <div className="rule">
                <ShieldCheck size={20} className="rule-icon" />
                <div>
                  <div className="rule-t">Ручная модерация</div>
                  <div className="rule-d">
                    Каждую заявку читает человек из команды. Мы не используем автоматические
                    скоринги и не передаём заявки третьим лицам.
                  </div>
                </div>
              </div>
              <div className="rule">
                <Sparkles size={20} className="rule-icon" />
                <div>
                  <div className="rule-t">Донорство — добровольное</div>
                  <div className="rule-d">
                    Любая сумма — от одного дня. Можно отдавать столько, сколько хочется, но как
                    минимум один день подписки всегда остаётся на вашем аккаунте.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="cta"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <div className="cta-row">
              <a href="https://t.me/tumannetbot" className="cta-primary">
                Открыть в Telegram <ArrowRight size={17} />
              </a>
              <a href="/" className="cta-secondary">
                Назад на главную
              </a>
            </div>
            <p className="cta-hint">
              Бот @tumannetbot · меню «Фонд» — пожертвовать дни или оставить заявку на помощь
            </p>
          </motion.div>

          {stats?.updated_at && (
            <div className="updated">
              обновлено · {new Date(stats.updated_at).toLocaleTimeString("ru-RU")}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
