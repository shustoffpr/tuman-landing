"use client";

import { useEffect, useRef } from "react";

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let w = (c.width = window.innerWidth);
    let h = (c.height = window.innerHeight);
    const pts: { x: number; y: number; z: number; vx: number; vy: number; vz: number; s: number }[] = [];
    for (let i = 0; i < 80; i++) pts.push({ x: Math.random() * w, y: Math.random() * h, z: Math.random() * 400, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, vz: (Math.random() - 0.5) * 0.5, s: Math.random() * 2 + 0.5 });
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150) {
            const a = 0.08 * (1 - d / 150);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(107,140,255,${a})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      // particles
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        if (p.z < 0 || p.z > 400) p.vz *= -1;
        const scale = (400 - p.z) / 400;
        const r = p.s * scale;
        const alpha = 0.15 + 0.35 * scale;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(107,140,255,${alpha})`;
        ctx.fill();
        // glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        g.addColorStop(0, `rgba(139,111,255,${alpha * 0.3})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

export default function PrivacyPage() {
  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Inter:wght@300;400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#050508;--accent:#6B8CFF;--accent2:#8B6FFF;--danger:#FF4D6D;--glass:rgba(255,255,255,0.04);--glass-border:rgba(255,255,255,0.08);--text:#E8E8F0;--muted:#888899}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}
.bg-canvas{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none}
.bg-orb{position:absolute;border-radius:50%;filter:blur(120px);opacity:0.12;animation:float 8s ease-in-out infinite}
.bg-orb-1{width:600px;height:600px;background:var(--accent);top:-200px;left:-200px}
.bg-orb-2{width:400px;height:400px;background:var(--accent2);bottom:-100px;right:-100px;animation-delay:-4s}
@keyframes float{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-30px) scale(1.05)}66%{transform:translate(-20px,20px) scale(0.95)}}
.container{position:relative;z-index:1;max-width:860px;margin:0 auto;padding:48px 24px 80px}
.back-link{display:inline-flex;align-items:center;gap:8px;color:var(--accent);text-decoration:none;font-size:13px;font-weight:500;letter-spacing:0.02em;margin-bottom:48px;opacity:0.8;transition:opacity 0.2s}
.back-link:hover{opacity:1}
.header{text-align:center;margin-bottom:60px;animation:fadeUp 0.8s ease both}
.logo-text{font-family:'Unbounded',sans-serif;font-size:24px;font-weight:700;background:linear-gradient(135deg,#fff 0%,var(--accent) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:0.08em;margin-bottom:32px;display:inline-block}
.header h1{font-family:'Unbounded',sans-serif;font-size:clamp(24px,4vw,36px);font-weight:700;line-height:1.2;margin-bottom:12px;background:linear-gradient(180deg,#fff 0%,rgba(255,255,255,0.7) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.header-badge{display:inline-block;background:var(--glass);border:1px solid var(--glass-border);border-radius:100px;padding:6px 16px;font-size:12px;color:var(--muted);letter-spacing:0.05em}
.section{background:var(--glass);border:1px solid var(--glass-border);border-radius:20px;padding:32px;margin-bottom:16px;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);transition:border-color 0.3s,transform 0.3s;animation:fadeUp 0.6s ease both;position:relative;overflow:hidden}
.section::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(107,140,255,0.5),transparent)}
.section:hover{border-color:rgba(107,140,255,0.2);transform:translateY(-2px)}
.section.danger{border-color:rgba(255,77,109,0.15);background:rgba(255,77,109,0.04)}
.section.danger::before{background:linear-gradient(90deg,transparent,rgba(255,77,109,0.4),transparent)}
.section.danger:hover{border-color:rgba(255,77,109,0.3)}
.section.danger .section-num{background:linear-gradient(135deg,#FF4D6D,#FF8FA3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.section-header{display:flex;align-items:flex-start;gap:16px;margin-bottom:20px}
.section-num{font-family:'Unbounded',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;padding-top:3px;white-space:nowrap}
.section-title{font-family:'Unbounded',sans-serif;font-size:15px;font-weight:600;color:#fff;line-height:1.3}
.section-body{font-size:14px;line-height:1.8;color:var(--muted)}
.section-body p{margin-bottom:10px}
.section-body p:last-child{margin-bottom:0}
.section-body strong{color:var(--text);font-weight:500}
.highlight{background:rgba(107,140,255,0.08);border:1px solid rgba(107,140,255,0.15);border-radius:12px;padding:16px 20px;margin:12px 0;font-size:13px;color:var(--text)}
.highlight.red{background:rgba(255,77,109,0.08);border-color:rgba(255,77,109,0.2)}
.contacts-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
@media(max-width:480px){.contacts-grid{grid-template-columns:1fr}}
.contact-card{background:rgba(107,140,255,0.08);border:1px solid rgba(107,140,255,0.15);border-radius:12px;padding:16px 20px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:all 0.2s}
.contact-card:hover{background:rgba(107,140,255,0.15);border-color:rgba(107,140,255,0.3);transform:translateY(-1px)}
.contact-icon{font-size:20px;width:36px;height:36px;display:flex;align-items:center;justify-content:center}
.contact-label{font-size:12px;color:var(--muted);margin-bottom:2px}
.contact-value{font-size:14px;color:var(--accent);font-weight:500}
.footer{margin-top:40px;padding:24px 32px;background:var(--glass);border:1px solid var(--glass-border);border-radius:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;animation:fadeUp 0.6s ease both}
.footer-check{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text)}
.check-icon{width:28px;height:28px;background:linear-gradient(135deg,#22c55e,#16a34a);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.footer-date{font-size:12px;color:var(--muted)}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.section:nth-child(1){animation-delay:0.1s}.section:nth-child(2){animation-delay:0.15s}.section:nth-child(3){animation-delay:0.2s}.section:nth-child(4){animation-delay:0.25s}.section:nth-child(5){animation-delay:0.3s}.section:nth-child(6){animation-delay:0.35s}.section:nth-child(7){animation-delay:0.4s}.section:nth-child(8){animation-delay:0.45s}.section:nth-child(9){animation-delay:0.5s}
@media(max-width:600px){.container{padding:32px 16px 60px}.section{padding:24px 20px}.footer{flex-direction:column;text-align:center}}
      `}</style>

      <div className="bg-canvas"><div className="bg-orb bg-orb-1" /><div className="bg-orb bg-orb-2" /></div>
      <ParticleCanvas />

      <div className="container">
        <a href="/" className="back-link">&larr; Вернуться на сайт</a>
        <div className="header">
          <span className="logo-text">TUMAN</span>
          <h1>Пользовательское соглашение</h1>
          <span className="header-badge">VPN-сервис TUMAN VPN</span>
        </div>

        <div className="section"><div className="section-header"><span className="section-num">01</span><span className="section-title">Общие положения</span></div><div className="section-body"><p>Настоящее Пользовательское соглашение регулирует отношения между VPN-сервисом TUMAN VPN (далее — Сервис) и любым лицом, использующим Сервис (далее — Пользователь).</p><p>Используя Сервис, Пользователь подтверждает что прочитал, понял и принимает настоящее Соглашение.</p><p>1.1. Сервис предоставляет доступ к VPN для обеспечения конфиденциальности и безопасности интернет-соединения.</p><p>1.2. Если Пользователь не согласен с условиями — он обязан прекратить использование Сервиса.</p></div></div>

        <div className="section"><div className="section-header"><span className="section-num">02</span><span className="section-title">Предоставляемые услуги</span></div><div className="section-body"><p>2.1. Сервис предоставляет шифрование трафика, скрытие IP-адреса и перенаправление трафика через удалённые серверы.</p><p>2.2. Объём функционала зависит от выбранного тарифного плана.</p><p>2.3. Подписка предоставляется на определённое количество устройств.</p><div className="highlight red"><strong>{"\u26A0\uFE0F"} Ограничение по устройствам</strong><br />Использование подписки допускается только на оплаченном количестве устройств. Передача ключей третьим лицам — нарушение Соглашения и может повлечь аннулирование подписки без возврата средств.</div></div></div>

        <div className="section"><div className="section-header"><span className="section-num">03</span><span className="section-title">Правила использования</span></div><div className="section-body"><p>3.1. Пользователь обязуется использовать Сервис только законным образом.</p><p>3.2. Запрещается использовать Сервис для нарушения законодательства, распространения вредоносного ПО, DDoS-атак, рассылки спама.</p><div className="highlight"><strong>{"\u{1F4CA}"} Лимит трафика</strong><br />Допустимый объём — не более 100 ГБ в сутки на устройство. При систематическом превышении Сервис вправе ограничить скорость.</div></div></div>

        <div className="section danger"><div className="section-header"><span className="section-num">04</span><span className="section-title">Платежи и возвраты</span></div><div className="section-body"><p>4.1. Стоимость тарифов может быть изменена в одностороннем порядке.</p><div className="highlight red"><strong>{"\u{1F4B3}"} Условия возврата</strong><br />Возврат возможен только при отсутствии фактического использования услуги (менее 1 МБ трафика). Комиссии платёжных систем не возвращаются.</div></div></div>

        <div className="section"><div className="section-header"><span className="section-num">05</span><span className="section-title">Конфиденциальность и No-Logs</span></div><div className="section-body"><div className="highlight"><strong>{"\u{1F512}"} No-Logs Policy</strong><br />Мы технически не ведём журналы активности пользователей. Ваш трафик не анализируется и не сохраняется — это архитектурное решение, а не просто обещание.</div><p>5.2. Мы собираем минимально необходимые данные: Telegram ID, дата регистрации, история платежей.</p><p>5.3. Мы не передаём личные данные третьим лицам.</p></div></div>

        <div className="section"><div className="section-header"><span className="section-num">06</span><span className="section-title">Партнёрская программа</span></div><div className="section-body"><p>6.1. Процент вознаграждения фиксируется на момент участия.</p><p>6.2. Сроки обработки выплат: от 1 до 10 рабочих дней.</p><div className="highlight red"><strong>{"\u{1F6AB}"} Антифрод</strong><br />Вознаграждение аннулируется при накрутке рефералов, использовании ботов или мошеннических действиях.</div></div></div>

        <div className="section"><div className="section-header"><span className="section-num">07</span><span className="section-title">Ограничение ответственности</span></div><div className="section-body"><p>7.1. Сервис предоставляется «как есть» без гарантий бесперебойной работы.</p><p>7.2. Сервис не несёт ответственности за действия пользователя в интернете.</p><p>7.3. Сервис не гарантирует обход всех типов блокировок.</p></div></div>

        <div className="section"><div className="section-header"><span className="section-num">08</span><span className="section-title">Изменение условий</span></div><div className="section-body"><p>8.1. Сервис вправе изменять Соглашение в одностороннем порядке.</p><p>8.2. Продолжение использования Сервиса означает согласие с новой редакцией.</p></div></div>

        <div className="section"><div className="section-header"><span className="section-num">09</span><span className="section-title">Контакты</span></div><div className="section-body"><p style={{ marginBottom: 16 }}>Если у вас остались вопросы — мы на связи:</p><div className="contacts-grid"><a href="https://t.me/tumannetbot" className="contact-card"><div className="contact-icon">{"\u{1F916}"}</div><div><div className="contact-label">Telegram бот</div><div className="contact-value">@tumannetbot</div></div></a><a href="https://t.me/tumannetbot?start=support" className="contact-card"><div className="contact-icon">{"\u{1F4AC}"}</div><div><div className="contact-label">Поддержка</div><div className="contact-value">Написать</div></div></a></div></div></div>

        <div className="footer"><div className="footer-check"><div className="check-icon">{"\u2705"}</div><span>Используя сервис, вы подтверждаете согласие с данными условиями</span></div><span className="footer-date">Обновлено: апрель 2026</span></div>
      </div>
    </>
  );
}
