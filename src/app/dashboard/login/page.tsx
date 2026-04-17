"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"idle" | "waiting" | "success" | "error">("idle");
  const [token, setToken] = useState("");
  const [botLink, setBotLink] = useState("");

  // Handle Telegram auth redirect (from widget if it works)
  useEffect(() => {
    const id = params.get("id");
    const hash = params.get("hash");
    if (id && hash) {
      setStatus("waiting");
      const authData: Record<string, string> = {};
      params.forEach((v, k) => { authData[k] = v; });
      fetch("/api/dashboard/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(authData) })
        .then((r) => { if (r.ok) { setStatus("success"); window.location.href = "/dashboard"; } else setStatus("error"); })
        .catch(() => setStatus("error"));
    }
  }, [params]);

  // Generate login token
  const startLogin = async () => {
    const res = await fetch("/api/dashboard/login-token", { method: "POST" });
    const data = await res.json();
    const t = data.token;
    setToken(t);
    setBotLink(`https://t.me/tumannetbot?start=weblogin_${t}`);
    setStatus("waiting");

    // Poll for confirmation
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      if (attempts > 150) { clearInterval(poll); setStatus("error"); return; }
      try {
        const check = await fetch(`/api/dashboard/check-token?token=${t}`);
        const result = await check.json();
        if (result.authenticated) { clearInterval(poll); setStatus("success"); window.location.href = "/dashboard"; }
      } catch {}
    }, 2000);
  };

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Unbounded:wght@600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.aurora{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden}
.a1{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(107,140,255,.12) 0%,transparent 70%);top:-200px;left:-100px;animation:am1 14s ease-in-out infinite alternate}
.a2{position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(139,111,255,.10) 0%,transparent 70%);bottom:-100px;right:-100px;animation:am2 17s ease-in-out infinite alternate}
@keyframes am1{to{transform:translate(80px,60px) scale(1.2)}}@keyframes am2{to{transform:translate(-60px,-40px) scale(1.15)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(107,140,255,.4)}50%{box-shadow:0 0 0 12px rgba(107,140,255,0)}}
      `}</style>
      <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", position: "relative" }}>
        <div className="aurora"><div className="a1" /><div className="a2" /></div>
        <div style={{ position: "relative", zIndex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: "48px 40px", textAlign: "center", maxWidth: 420, width: "100%", margin: "0 24px" }}>
          <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 28, fontWeight: 700, background: "linear-gradient(135deg, #fff, #6B8CFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>TUMAN</div>
          <div style={{ color: "#444", fontSize: 14, marginBottom: 40 }}>Личный кабинет</div>

          {status === "idle" && (
            <>
              <button onClick={startLogin} style={{ background: "linear-gradient(135deg, #6B8CFF, #8B6FFF)", color: "#fff", border: "none", padding: "16px 40px", borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "'Inter', sans-serif", boxShadow: "0 0 40px rgba(107,140,255,0.2)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.07-.2c-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.98-1.73 6.63-2.87 7.95-3.44 3.79-1.58 4.57-1.85 5.08-1.86.11 0 .37.03.53.14.14.1.18.23.2.33.02.1.04.31.02.49z" /></svg>
                Войти через Telegram
              </button>
              <p style={{ color: "#2a2a2a", fontSize: 12, marginTop: 20, lineHeight: 1.5 }}>Быстро и безопасно.<br />Никаких паролей.</p>
            </>
          )}

          {status === "waiting" && (
            <div>
              <div style={{ width: 40, height: 40, border: "3px solid rgba(107,140,255,0.2)", borderTopColor: "#6B8CFF", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 24px" }} />
              <div style={{ color: "#6B8CFF", fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Ожидаем подтверждения</div>
              <div style={{ color: "#444", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
                Открой бота и нажми <b>Start</b>
              </div>
              {botLink && (
                <a href={botLink} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #6B8CFF, #8B6FFF)", color: "#fff", padding: "14px 32px", borderRadius: 12, textDecoration: "none", fontSize: 15, fontWeight: 600, animation: "pulse 2s infinite" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.07-.2c-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.98-1.73 6.63-2.87 7.95-3.44 3.79-1.58 4.57-1.85 5.08-1.86.11 0 .37.03.53.14.14.1.18.23.2.33.02.1.04.31.02.49z" /></svg>
                  Открыть бота
                </a>
              )}
              <div style={{ color: "#222", fontSize: 11, marginTop: 16 }}>Код: {token.slice(0, 8)}...</div>
            </div>
          )}

          {status === "success" && (
            <div><div style={{ fontSize: 48, marginBottom: 16 }}>{"\u2705"}</div><div style={{ color: "#4CAF50", fontSize: 15, fontWeight: 500 }}>Вход выполнен!</div><div style={{ color: "#333", fontSize: 13, marginTop: 8 }}>Перенаправляем...</div></div>
          )}

          {status === "error" && (
            <div><div style={{ color: "#ff6b6b", fontSize: 14, marginBottom: 16 }}>Ошибка. Попробуй ещё раз.</div><button onClick={() => { setStatus("idle"); setToken(""); setBotLink(""); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#666", padding: "10px 24px", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>Заново</button></div>
          )}
        </div>
      </div>
    </>
  );
}

export default function DashboardLogin() {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0A0A" }} />}><LoginContent /></Suspense>;
}
