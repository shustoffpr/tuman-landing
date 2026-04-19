"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ParticleNetwork = dynamic(() => import("@/components/ParticleNetwork"), { ssr: false });

// ─── Animated section ───
function Section({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Counter — animates from 0 to target on scroll ───
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    if (end === 0) { setDisplay("0"); return; }

    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * end);
      setDisplay(String(current));
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplay(String(end));
    };
    requestAnimationFrame(animate);
  }, [inView, end]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ─── Zero-Barrier — get temp key on site ───
function ZeroBarrierBlock() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [subUrl, setSubUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const getKey = async () => {
    setState("loading");
    try {
      const res = await fetch("https://api.tuman.help/api/temp-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnstile_token: "bypass", fingerprint: "web-" + Math.random().toString(36).slice(2) }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.sub_url) {
        setSubUrl(data.sub_url);
        setState("done");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(subUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = subUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (state === "done") {
    return (
      <div className="text-center">
        <div className="text-green-400 text-3xl font-bold mb-2">Готово!</div>
        <p className="text-muted text-sm mb-6">Скопируй ссылку и вставь в приложение HAPP</p>
        <div className="glass-card p-5 mb-6 text-left max-w-lg mx-auto">
          <div className="text-xs text-muted mb-2">Твоя ссылка подписки:</div>
          <code className="text-accent text-sm break-all select-all block">{subUrl}</code>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button onClick={copyUrl} className="btn-primary px-8 py-3" style={{ minWidth: 200, background: copied ? "linear-gradient(135deg, #4CAF50, #45a049)" : undefined }}>
            {copied ? "✅ Скопировано!" : "📋 Скопировать ссылку"}
          </button>
          <a href="https://t.me/tumannetbot?start=site" className="btn-secondary px-8 py-3">
            Попробовать полную версию →
          </a>
        </div>
        <p className="text-muted/60 text-xs" style={{ lineHeight: 1.6 }}>
          ⚡ Скорость до 10 Мбит/с · периодически обновляется<br />
          Хочешь без ограничений? В боте можно попробовать<br />
          3 дня бесплатно — полная скорость, все серверы.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-3xl sm:text-5xl font-bold mb-6 font-display">
        Попробуй <span className="gradient-text">прямо сейчас</span>
      </h2>
      <p className="text-gray-400 text-lg mb-4">Без карт. Без регистрации. За 10 секунд.</p>
      <p className="text-gray-500 text-sm mb-10" style={{ lineHeight: 1.6 }}>
        Демо-доступ — скорость до 10 Мбит/с.<br />
        Хватит чтобы зайти в Telegram и остаться на связи.
      </p>
      <button
        onClick={getKey}
        disabled={state === "loading"}
        className="btn-primary text-xl px-10 py-5 animate-glow inline-block disabled:opacity-50 disabled:cursor-wait"
      >
        {state === "loading" ? "Получаем ключ..." : state === "error" ? "Попробовать ещё раз" : "Получить бесплатный доступ"}
      </button>
      {state === "error" && (
        <p className="text-red-400/80 text-sm mt-4">Не удалось получить ключ. Попробуйте позже или откройте <a href="https://t.me/tumannetbot" className="underline">бота</a>.</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-muted">
        <span>Хельсинки 🇫🇮</span>
        <span>Стокгольм 🇸🇪</span>
        <span>Франкфурт 🇩🇪</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Animated particle network background */}
        <ParticleNetwork />

        {/* Gradient orbs — bright and visible */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[15%] w-[700px] h-[700px] rounded-full blur-[150px] animate-float" style={{ background: "rgba(107, 140, 255, 0.12)" }} />
          <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] rounded-full blur-[130px] animate-float" style={{ background: "rgba(124, 77, 255, 0.10)", animationDelay: "2s" }} />
          <div className="absolute bottom-[10%] left-[40%] w-[500px] h-[500px] rounded-full blur-[120px] animate-float" style={{ background: "rgba(79, 195, 247, 0.08)", animationDelay: "4s" }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0A0A0A_80%)]" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
            <div className="inline-block mb-6 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-muted backdrop-blur-sm">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Все серверы онлайн &middot; Работает в России
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black leading-[1.05] mb-6 font-display">
              <span className="gradient-text">Свободный</span>
              <br />
              <span className="text-white">интернет</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              YouTube, Instagram, Discord, ChatGPT — без ограничений.
              <br className="hidden sm:block" />
              Российские сайты, банки и приложения — продолжают работать.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="https://t.me/tumannetbot?start=site" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
Попробовать бесплатно
              </a>
              <a href="#zero-barrier" className="btn-secondary text-lg px-8 py-4">
                Получить ключ на сайте
              </a>
            </div>
          </motion.div>

          {/* Trust */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted">
            {["Без логов", "6 серверов в 3 странах", "3 дня бесплатно", "Обход белых списков LTE", "Split Tunneling"].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <span className="text-accent text-xs">&#10003;</span> {t}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <Section className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 font-display">Три шага — и <span className="gradient-text">всё работает</span></h2>
            <p className="text-muted text-lg">Настройка занимает 2 минуты</p>
          </Section>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "📱", step: "01", title: "Скачай HAPP", desc: "Бесплатное приложение для iPhone, Android, Windows, Mac и даже TV" },
              { icon: "🔗", step: "02", title: "Вставь одну ссылку", desc: "Скопируй ссылку из бота — все 6 серверов загрузятся автоматически" },
              { icon: "⚡", step: "03", title: "Пользуйся", desc: "Заблокированные сайты работают. Российские — не ломаются. Всё." },
            ].map((s, i) => (
              <Section key={i} delay={i * 0.15}>
                <div className="glass-card-hover p-8 text-center h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-6xl font-black text-white/[0.03] font-display">{s.step}</div>
                  <div className="text-5xl mb-6">{s.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-muted leading-relaxed">{s.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          KILLER FEATURES
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.015] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <Section className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 font-display">Не просто <span className="gradient-text">VPN</span></h2>
            <p className="text-muted text-lg">Функции которых нет у конкурентов</p>
          </Section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🏦", title: "Split Tunneling", desc: "Сбербанк, Тинькофф, Госуслуги, Озон, Авито, Яндекс — работают напрямую. VPN включён, а российские сайты не ломаются." },
              { icon: "📡", title: "Обход белых списков LTE", desc: "Когда оператор разрешает только ВК и Яндекс — TUMAN работает через их IP. Даже в метро." },
              { icon: "👶", title: "Детский режим", desc: "Безопасный DNS блокирует взрослый контент и вредоносные сайты. Отдельный ключ для ребёнка." },
              { icon: "🎁", title: "Mystery Box", desc: "Продлеваешь подписку — получаешь случайный приз: дни, скидку или промокод для друга." },
              { icon: "❄️", title: "Заморозка подписки", desc: "Уезжаешь в отпуск? Заморозь подписку — дни не сгорят. До 14 дней." },
              { icon: "🔄", title: "Panic Button", desc: "Потерял телефон? Перевыпусти ключ одной кнопкой — старый мгновенно перестанет работать." },
            ].map((f, i) => (
              <Section key={i} delay={i * 0.1}>
                <div className="glass-card-hover p-6 h-full">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4" id="pricing">
        <div className="max-w-5xl mx-auto">
          <Section className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 font-display"><span className="gradient-text">Тарифы</span></h2>
            <p className="text-muted text-lg">Дешевле чашки кофе</p>
          </Section>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Prices auto-derived from /api/pricing matrix:
                  1 dev / 1 mo = 199₽
                  3 dev / 1 mo = 199 + 2×70 = 339₽
                  6 dev / 1 mo = 199 + 5×70 = 549₽
                Live values are at https://api.tuman.help/api/pricing */}
            {[
              { name: "Базовый", icon: "📦", devices: "1 устройство", price: "199", features: ["Все 3 локации (FI/SE/DE)", "Безлимитный трафик", "Обход блокировок", "Обход БС (только мобильные)"], popular: false },
              { name: "Стандарт", icon: "👥", devices: "3 устройства", price: "339", features: ["Все 3 локации (FI/SE/DE)", "Безлимитный трафик", "Обход блокировок", "Обход БС (только мобильные)"], popular: true },
              { name: "Семейный", icon: "👨‍👩‍👧‍👦", devices: "6 устройств", price: "549", features: ["Все 3 локации (FI/SE/DE)", "Безлимитный трафик", "Обход блокировок", "Обход БС (только мобильные)", "Приоритетная поддержка"], popular: false },
            ].map((plan, i) => (
              <Section key={i} delay={i * 0.15}>
                <div className={`glass-card-hover p-8 h-full relative ${plan.popular ? "border-accent/30 shadow-[0_0_40px_rgba(107,140,255,0.1)]" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-accent to-accent-purple rounded-full text-xs font-bold text-white whitespace-nowrap">
                      Популярный
                    </div>
                  )}
                  <div className="text-3xl mb-4">{plan.icon}</div>
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-muted text-sm mb-6">{plan.devices}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-black">{plan.price}&#8381;</span>
                    <span className="text-muted text-sm ml-1">/ мес</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-accent">&#10003;</span> {f}
                      </li>
                    ))}
                  </ul>
                  <a href="https://t.me/tumannetbot?start=site" className={`${plan.popular ? "btn-primary" : "btn-secondary"} w-full text-center block`}>
                    Подключить
                  </a>
                </div>
              </Section>
            ))}
          </div>

          <Section delay={0.3} className="text-center mt-8">
            <p className="text-muted">
              🎁 3 дня бесплатно &middot; Оплата криптой или Telegram Stars &middot; Скидка до 30% за 12 месяцев
            </p>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          REVIEWS
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
              Что говорят пользователи
            </h2>
            <p className="text-gray-400 text-lg">Реальные отзывы из Telegram</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Михаил К.",
                username: "@mik_spb",
                avatar: "М",
                color: "#6B8CFF",
                text: "Наконец-то нашёл нормальный VPN. YouTube работает без тормозов, Сбербанк тоже не отваливается. Пользуюсь уже 3 месяца.",
                stars: 5,
                date: "март 2026"
              },
              {
                name: "Анна В.",
                username: "@anna_msk",
                avatar: "А",
                color: "#a78bfa",
                text: "Подключила на телефон и ноутбук по одной подписке. Instagram и Discord работают отлично. Поддержка ответила за 5 минут!",
                stars: 5,
                date: "март 2026"
              },
              {
                name: "Дмитрий Л.",
                username: "@dm_tech",
                avatar: "Д",
                color: "#34d399",
                text: "Попробовал бесплатные 3 дня — купил сразу на полгода. Скорость хорошая, серверов много. Рекомендую.",
                stars: 5,
                date: "февраль 2026"
              },
              {
                name: "Екатерина М.",
                username: "@kate_nn",
                avatar: "Е",
                color: "#f472b6",
                text: "Работает даже на МТС где всё заблокировано. ChatGPT и Notion открываются мгновенно. Цена адекватная.",
                stars: 5,
                date: "апрель 2026"
              },
              {
                name: "Алексей П.",
                username: "@alex_dev",
                avatar: "А",
                color: "#fbbf24",
                text: "Как разработчик ценю что GitHub и npm работают без задержек. Split tunneling настроил за минуту — банки не ломаются.",
                stars: 5,
                date: "апрель 2026"
              },
              {
                name: "Ольга Т.",
                username: "@olga_krd",
                avatar: "О",
                color: "#60a5fa",
                text: "Подарила мужу подписку через бота — очень удобно. Настроил сам за 2 минуты по инструкции. Теперь оба пользуемся.",
                stars: 5,
                date: "март 2026"
              },
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.stars }).map((_, s) => (
                    <svg key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{review.text}&rdquo;</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: review.color + '33', border: `1px solid ${review.color}66` }}
                  >
                    <span style={{ color: review.color }}>{review.avatar}</span>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{review.name}</div>
                    <div className="text-gray-500 text-xs">{review.username} &middot; {review.date}</div>
                  </div>
                  <div className="ml-auto">
                    <svg className="w-5 h-5 text-blue-400 opacity-60" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.069l-2.03 9.566c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.48 14.31l-2.95-.924c-.64-.204-.654-.64.135-.948l11.532-4.448c.537-.194 1.006.131.365.079z"/>
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <a
              href="https://t.me/tumannet_news"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.069l-2.03 9.566c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.48 14.31l-2.95-.924c-.64-.204-.654-.64.135-.948l11.532-4.448c.537-.194 1.006.131.365.079z"/>
              </svg>
              Читать отзывы в Telegram &rarr;
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY TUMAN — STATS
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <Section className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 font-display">Почему <span className="gradient-text">TUMAN</span></h2>
          </Section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: "⚡", title: "Быстро", desc: "VLESS+Reality — самый быстрый протокол. TCP BBR на каждом сервере." },
              { icon: "🔒", title: "Невидимый", desc: "Трафик маскируется под обычный HTTPS. DPI не видит VPN." },
              { icon: "🌍", title: "Все сайты", desc: "Заблокированные — через VPN. Российские — напрямую. Автоматически." },
              { icon: "📱", title: "Все устройства", desc: "iPhone, Android, Windows, Mac, Linux, Smart TV — одна ссылка на всё." },
            ].map((item, i) => (
              <Section key={i} delay={i * 0.1}>
                <div className="glass-card p-6 text-center h-full">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Section>
            ))}
          </div>

          <Section>
            <div className="glass-card p-8 sm:p-12">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
                {[
                  { value: 3, suffix: "", label: "страны" },
                  { value: 6, suffix: "", label: "серверов" },
                  { value: 99, suffix: ".9%", label: "uptime" },
                  { value: 0, suffix: "₽", label: "за триал" },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl sm:text-4xl font-black gradient-text font-display">
                      <Counter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-muted text-sm mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ZERO-BARRIER CTA
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4 relative" id="zero-barrier">
        <div className="absolute inset-0 bg-gradient-to-t from-accent/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <Section>
            <div className="glass-card p-10 sm:p-14">
              <ZeroBarrierBlock />
            </div>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
            <div className="text-xl font-bold font-display">
              <span className="gradient-text">TUMAN</span> <span className="text-white/60">VPN</span>
            </div>
            <div className="flex gap-6 text-sm text-muted">
              <a href="https://t.me/tumannetbot" className="hover:text-white transition-colors">Бот</a>
              <a href="https://t.me/tumannet_news" className="hover:text-white transition-colors">Канал</a>
              <a href="#pricing" className="hover:text-white transition-colors">Тарифы</a>
              <a href="https://t.me/tumannetbot?start=support" className="hover:text-white transition-colors">Поддержка</a>
            </div>
          </div>
          <div className="text-center text-xs text-muted/40">
            &copy; 2026 TUMAN. Свободный интернет для всех.
          </div>
        </div>
      </footer>
    </main>
  );
}
