"use client";

export default function DownloadPage() {
  const platforms = [
    { icon: "📱", name: "iPhone / iPad", desc: "App Store", href: "https://tuman.help/app/ios" },
    { icon: "🤖", name: "Android", desc: "Google Play", href: "https://tuman.help/app/android" },
    { icon: "🤖", name: "Android APK", desc: "Прямая загрузка", href: "https://github.com/Happ-proxy/happ-android/releases/latest/download/Happ.apk" },
    { icon: "💻", name: "Windows", desc: "Установщик .exe", href: "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe" },
    { icon: "🍎", name: "macOS", desc: "Universal .dmg", href: "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.macOS.universal.dmg" },
    { icon: "🐧", name: "Linux", desc: ".deb пакет", href: "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.linux.x64.deb" },
    { icon: "📺", name: "Apple TV", desc: "App Store", href: "https://apps.apple.com/us/app/happ-proxy-utility-for-tv/id6748297274" },
    { icon: "📺", name: "Android TV", desc: "Google Play", href: "https://play.google.com/store/apps/details?id=com.happproxy" },
  ];

  return (
    <main className="min-h-screen px-4 py-20" style={{ background: "#0A0A0A", color: "#ededed" }}>
      <div className="max-w-2xl mx-auto">
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "8px", fontFamily: "Unbounded,sans-serif" }}>Скачать HAPP</h1>
        <p style={{ color: "#888", marginBottom: "40px" }}>Один клиент для всех платформ</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
          {platforms.map(p => (
            <a key={p.name} href={p.href} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "20px", textDecoration: "none", color: "inherit", border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.2s" }}
              className="hover:border-[rgba(107,140,255,0.3)] transition-colors">
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>{p.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: "2px" }}>{p.name}</div>
              <div style={{ color: "#888", fontSize: "13px" }}>{p.desc}</div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <a href="https://t.me/tumannetbot" style={{ background: "linear-gradient(135deg,#6B8CFF,#7C4DFF)", color: "#fff", padding: "14px 32px", borderRadius: "14px", fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
            Получить ссылку подписки в боте
          </a>
        </div>
      </div>
    </main>
  );
}
