"use client";

import { useState } from "react";

export default function BetaPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || trimmed.length < 4) {
      setError("Введи инвайт-код");
      return;
    }
    window.location.href = `https://t.me/tumannetbot?start=invite_${trimmed}`;
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0A0A0A" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "48px",
          maxWidth: "440px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌫</div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "#fff",
            marginBottom: "8px",
            fontFamily: "Unbounded, sans-serif",
          }}
        >
          Бета-тестирование
        </h1>
        <p style={{ color: "#888", marginBottom: "32px", lineHeight: 1.6 }}>
          TUMAN VPN — закрытое тестирование.
          <br />
          Введи инвайт-код чтобы получить доступ.
        </p>

        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(""); }}
          placeholder="Инвайт-код"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontSize: "16px",
            outline: "none",
            marginBottom: "16px",
            textAlign: "center",
            letterSpacing: "2px",
            fontFamily: "monospace",
          }}
        />

        {error && <p style={{ color: "#ff6b6b", fontSize: "14px", marginBottom: "12px" }}>{error}</p>}

        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #6B8CFF, #7C4DFF)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "16px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Активировать код
        </button>

        <p style={{ color: "#555", fontSize: "12px", marginTop: "24px" }}>
          Нет кода? Подпишись на{" "}
          <a href="https://t.me/tumannet_news" style={{ color: "#6B8CFF" }}>
            @tumannet_news
          </a>{" "}
          — коды публикуются там.
        </p>
      </div>
    </main>
  );
}
