export default function HowToPage() {
  const steps = [
    { n: "1", title: "Скачай HAPP", desc: "Бесплатное приложение для всех платформ", links: [
      { text: "📱 iPhone / iPad", href: "https://tuman.help/app/ios" },
      { text: "🤖 Android (Google Play)", href: "https://tuman.help/app/android" },
      { text: "🤖 Android (APK)", href: "https://github.com/Happ-proxy/happ-android/releases/latest/download/Happ.apk" },
      { text: "💻 Windows", href: "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe" },
      { text: "🍎 macOS", href: "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.macOS.universal.dmg" },
    ]},
    { n: "2", title: "Получи ссылку подписки", desc: "Открой бота @tumannetbot → нажми «Попробовать бесплатно» → скопируй ссылку", links: [
      { text: "Открыть бота", href: "https://t.me/tumannetbot" },
    ]},
    { n: "3", title: "Вставь ссылку в HAPP", desc: "Открой HAPP → нажми + → вставь ссылку → все 6 серверов загрузятся автоматически", links: [] },
    { n: "4", title: "Настрой маршрутизацию", desc: "В HAPP: Настройки профиля → Маршрутизация → «Bypass LAN & RU». Теперь банки и госуслуги работают без отключения VPN.", links: [] },
  ];

  return (
    <main className="min-h-screen px-4 py-20" style={{ background: "#0A0A0A", color: "#ededed" }}>
      <div className="max-w-2xl mx-auto">
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "8px", fontFamily: "Unbounded,sans-serif" }}>Как подключиться</h1>
        <p style={{ color: "#888", marginBottom: "40px" }}>Настройка за 2 минуты</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {steps.map(step => (
            <div key={step.n} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ background: "linear-gradient(135deg,#6B8CFF,#7C4DFF)", borderRadius: "12px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>{step.n}</div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "18px", marginBottom: "4px" }}>{step.title}</h3>
                  <p style={{ color: "#aaa", fontSize: "14px", lineHeight: 1.6 }}>{step.desc}</p>
                  {step.links.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                      {step.links.map(l => (
                        <a key={l.text} href={l.href} style={{ background: "rgba(107,140,255,0.15)", color: "#6B8CFF", padding: "6px 14px", borderRadius: "8px", fontSize: "13px", textDecoration: "none" }}>{l.text}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
