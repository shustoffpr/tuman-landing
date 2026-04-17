"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════
   1. Aurora / Northern Lights — CSS only
   ═══════════════════════════════════════════════════ */
function Aurora() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {/* Layer 1 — wide sweep */}
      <div
        className="absolute"
        style={{
          width: "200%", height: "60%",
          top: "10%", left: "-50%",
          background: "linear-gradient(90deg, transparent 0%, rgba(107,140,255,0.07) 20%, rgba(124,77,255,0.05) 40%, rgba(79,195,247,0.06) 60%, rgba(156,120,255,0.04) 80%, transparent 100%)",
          filter: "blur(80px)",
          animation: "aurora1 16s ease-in-out infinite",
          transformOrigin: "center",
        }}
      />
      {/* Layer 2 — narrower, offset timing */}
      <div
        className="absolute"
        style={{
          width: "180%", height: "40%",
          top: "20%", left: "-40%",
          background: "linear-gradient(90deg, transparent 0%, rgba(79,195,247,0.06) 25%, rgba(107,140,255,0.08) 50%, rgba(124,77,255,0.05) 75%, transparent 100%)",
          filter: "blur(100px)",
          animation: "aurora2 20s ease-in-out infinite",
          transformOrigin: "center",
        }}
      />
      {/* Layer 3 — subtle low band */}
      <div
        className="absolute"
        style={{
          width: "160%", height: "30%",
          top: "45%", left: "-30%",
          background: "linear-gradient(90deg, transparent, rgba(156,120,255,0.04), rgba(79,195,247,0.05), rgba(107,140,255,0.03), transparent)",
          filter: "blur(120px)",
          animation: "aurora3 24s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes aurora1 {
          0%, 100% { transform: translateX(-5%) rotate(-2deg) scaleY(1); }
          33% { transform: translateX(8%) rotate(1deg) scaleY(1.3); }
          66% { transform: translateX(-3%) rotate(-1deg) scaleY(0.8); }
        }
        @keyframes aurora2 {
          0%, 100% { transform: translateX(5%) rotate(1deg) scaleY(1); }
          50% { transform: translateX(-10%) rotate(-2deg) scaleY(1.4); }
        }
        @keyframes aurora3 {
          0%, 100% { transform: translateX(3%) scaleY(1); opacity: 0.6; }
          50% { transform: translateX(-6%) scaleY(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   2. Floating Particles — canvas
   ═══════════════════════════════════════════════════ */
function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;

    interface Mote {
      x: number; y: number;
      size: number; speed: number;
      opacity: number; maxOpacity: number;
      color: string; phase: number;
      wobble: number;
    }

    const motes: Mote[] = [];
    const colors = ["107,140,255", "124,77,255", "79,195,247", "255,255,255"];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 30; i++) {
      motes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.4 + 0.15,
        opacity: 0,
        maxOpacity: Math.random() * 0.35 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
        wobble: Math.random() * 0.5 + 0.2,
      });
    }

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;

      for (const m of motes) {
        m.y -= m.speed;
        m.x += Math.sin(t * 2 + m.phase) * m.wobble;

        // Fade in near bottom, fade out near top
        const lifeRatio = m.y / canvas.height;
        m.opacity = m.maxOpacity * Math.sin(lifeRatio * Math.PI);

        if (m.y < -10) {
          m.y = canvas.height + 10;
          m.x = Math.random() * canvas.width;
        }

        // Glow
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.size * 4);
        g.addColorStop(0, `rgba(${m.color}, ${m.opacity})`);
        g.addColorStop(0.4, `rgba(${m.color}, ${m.opacity * 0.3})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(m.x - m.size * 4, m.y - m.size * 4, m.size * 8, m.size * 8);

        // Core dot
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${m.color}, ${m.opacity * 1.5})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 2 }} />;
}

/* ═══════════════════════════════════════════════════
   3. Perspective Grid
   ═══════════════════════════════════════════════════ */
function PerspectiveGrid() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      <div
        style={{
          position: "absolute",
          bottom: 0, left: "50%",
          width: "200%", height: "55%",
          transform: "translateX(-50%) perspective(500px) rotateX(60deg)",
          transformOrigin: "bottom center",
          backgroundImage: `
            linear-gradient(rgba(107,140,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(107,140,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 50%, transparent 80%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 50%, transparent 80%)",
          animation: "gridScroll 4s linear infinite",
        }}
      />
      {/* Horizon glow line */}
      <div
        style={{
          position: "absolute",
          bottom: "54%", left: "10%", right: "10%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(107,140,255,0.15), rgba(124,77,255,0.1), rgba(107,140,255,0.15), transparent)",
          filter: "blur(1px)",
          boxShadow: "0 0 20px rgba(107,140,255,0.1)",
        }}
      />
      <style>{`
        @keyframes gridScroll {
          0% { background-position: 0 0; }
          100% { background-position: 0 60px; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   4. Vignette overlay
   ═══════════════════════════════════════════════════ */
function Vignette() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 3,
        background: "radial-gradient(ellipse 70% 60% at 50% 45%, transparent 0%, rgba(10,10,10,0.4) 60%, rgba(10,10,10,0.85) 100%)",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════
   Scan lines (subtle CRT)
   ═══════════════════════════════════════════════════ */
function ScanLines() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 4 }}>
      <div
        className="absolute inset-0"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(107,140,255,0.008) 3px, rgba(107,140,255,0.008) 4px)",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Glitch text — chromatic shift
   ═══════════════════════════════════════════════════ */
function GlitchText({ children }: { children: string }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const glitch = () => {
      if (Math.random() > 0.93) {
        setOffset({ x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 3 });
        setTimeout(() => setOffset({ x: 0, y: 0 }), 50 + Math.random() * 40);
      }
    };
    const id = setInterval(glitch, 200);
    return () => clearInterval(id);
  }, []);

  const grad = {
    background: "linear-gradient(180deg, #fff 0%, #6B8CFF 40%, #7C4DFF 70%, rgba(124,77,255,0.15) 100%)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
  };

  return (
    <span className="relative inline-block" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
      <span className="absolute inset-0" style={{ ...grad, opacity: 0.4, transform: `translate(${offset.x * 3}px, 0)`, filter: "hue-rotate(-40deg)" }} aria-hidden>{children}</span>
      <span className="absolute inset-0" style={{ ...grad, opacity: 0.4, transform: `translate(${-offset.x * 3}px, 0)`, filter: "hue-rotate(40deg)" }} aria-hidden>{children}</span>
      <span className="relative" style={grad}>{children}</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   Animated counter
   ═══════════════════════════════════════════════════ */
function AnimatedDigit({ digit, delay }: { digit: string; delay: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, parseInt(digit), {
      duration: 1.2, delay,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
    const unsub = rounded.on("change", (v) => setDisplay(String(v)));
    return () => { controls.stop(); unsub(); };
  }, [digit, delay, count, rounded]);

  return <span>{display}</span>;
}

/* ═══════════════════════════════════════════════════
   Main 404 Page
   ═══════════════════════════════════════════════════ */
export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: "#0A0A0A" }}>
      {/* Background layers */}
      <Aurora />
      <PerspectiveGrid />
      <FloatingParticles />
      <Vignette />
      <ScanLines />

      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* 404 digits */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
        >
          <div
            className="flex items-center justify-center select-none"
            style={{
              gap: "clamp(0.05rem, 0.8vw, 0.3rem)",
              fontFamily: "'Unbounded', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(6rem, 18vw, 11rem)",
              lineHeight: 1,
              filter: "drop-shadow(0 0 80px rgba(107,140,255,0.3)) drop-shadow(0 0 160px rgba(124,77,255,0.15))",
            }}
          >
            {["4", "0", "4"].map((digit, i) => {
              if (digit === "0") {
                return <GlitchText key={i}>0</GlitchText>;
              }
              return (
                <span
                  key={i}
                  style={{
                    background: "linear-gradient(180deg, #fff 0%, #6B8CFF 40%, #7C4DFF 70%, rgba(124,77,255,0.15) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: "inline-block",
                  }}
                >
                  {mounted ? <AnimatedDigit digit={digit} delay={i === 0 ? 0.2 : 0.4} /> : digit}
                </span>
              );
            })}
          </div>

          {/* Reflection */}
          <div
            className="select-none pointer-events-none flex items-center justify-center"
            aria-hidden
            style={{
              gap: "clamp(0.05rem, 0.8vw, 0.3rem)",
              fontSize: "clamp(6rem, 18vw, 11rem)",
              fontFamily: "'Unbounded', sans-serif",
              fontWeight: 700,
              background: "linear-gradient(180deg, rgba(107,140,255,0.12) 0%, transparent 60%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              transform: "scaleY(-1) translateY(10px)",
              lineHeight: 1,
              filter: "blur(4px)",
              height: "0.4em",
              overflow: "hidden",
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.25), transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.25), transparent)",
            }}
          >
            <span>4</span><span>0</span><span>4</span>
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          className="mx-auto mt-4 mb-7"
          style={{
            width: 140, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(107,140,255,0.6), rgba(124,77,255,0.4), rgba(79,195,247,0.6), transparent)",
            boxShadow: "0 0 25px rgba(107,140,255,0.4), 0 0 50px rgba(124,77,255,0.15)",
          }}
        />

        {/* Main text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-xl md:text-2xl lg:text-3xl font-semibold"
          style={{ color: "#EDEDED" }}
        >
          Страница растворилась в тумане
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-base md:text-lg mt-3"
          style={{ color: "rgba(237,237,237,0.4)" }}
        >
          Но мы поможем тебе найти путь
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
        >
          <motion.a
            href="https://tuman.help"
            className="btn-primary flex items-center justify-center gap-2.5 text-base"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
            </svg>
            Вернуться домой
          </motion.a>
          <motion.a
            href="https://t.me/tumannetbot"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center justify-center gap-2.5 text-base"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.98-1.73 6.63-2.87 7.95-3.44 3.79-1.58 4.57-1.85 5.08-1.86.11 0 .37.03.53.14.14.1.18.23.2.33.02.1.04.31.02.49z" />
            </svg>
            Открыть бота
          </motion.a>
        </motion.div>

        {/* VPN hint card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.7 }}
          className="mt-12 mx-auto max-w-md"
        >
          <div
            className="flex items-start gap-3.5 px-5 py-4 rounded-2xl text-left"
            style={{
              background: "rgba(255,255,255,0.025)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 0 30px rgba(107,140,255,0.03)",
            }}
          >
            <span className="text-lg mt-0.5 shrink-0">&#128274;</span>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(237,237,237,0.45)" }}>
              Это не сайт — это ключ.<br />
              Вставь ссылку в{" "}
              <a href="https://tuman.help/app/ios" style={{ color: "rgba(107,140,255,0.8)", textDecoration: "underline", textUnderlineOffset: "3px" }}>HAPP</a>,{" "}
              <a href="https://tuman.help/app/hiddify-ios" style={{ color: "rgba(107,140,255,0.8)", textDecoration: "underline", textUnderlineOffset: "3px" }}>Hiddify</a> или{" "}
              <a href="https://tuman.help/app/android" style={{ color: "rgba(107,140,255,0.8)", textDecoration: "underline", textUnderlineOffset: "3px" }}>v2rayNG</a>.
              <br />
              В браузере она не работает.{" "}
              <span style={{ color: "rgba(255,60,60,0.5)" }}>РКН не спит</span>{" "}
              <span style={{ fontSize: "0.85em" }}>&#128064;</span>
            </p>
          </div>
        </motion.div>

        {/* Error code badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mt-8 mb-6"
        >
          <span
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase"
            style={{ color: "rgba(237,237,237,0.15)" }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6B8CFF", boxShadow: "0 0 8px rgba(107,140,255,0.6)" }} />
            Error 404 — Page not found
          </span>
        </motion.div>
      </div>
    </div>
  );
}
