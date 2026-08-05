"use client";

import { useEffect, useRef, useState } from "react";
import { StarfieldBg } from "./StarfieldBg";
import { LlmTerminal } from "./LlmTerminal";

const BOOT_LINES = ["$ whoami", "> eeshan agarwal — ready for questions.", "> this is an LLM loaded with everything about me — ask it anything."];

export function AboutSection() {
  const [visible, setVisible] = useState(false);
  const [hoverTerm, setHoverTerm] = useState(false);
  const [bootTyped, setBootTyped] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  const bootText = BOOT_LINES.join("\n");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const iv = setInterval(() => {
      setBootTyped((n) => {
        if (n >= bootText.length) {
          clearInterval(iv);
          setTimeout(() => setBootDone(true), 300);
          return n;
        }
        return n + 1;
      });
    }, 10);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function reveal(delay: number): React.CSSProperties {
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(18px)",
      transition: `opacity .6s var(--ease-out) ${delay}s, transform .6s var(--ease-out) ${delay}s`,
    };
  }

  return (
    <section
      id="about"
      ref={ref}
      className="about-grid"
      style={{
        position: "relative",
        borderTop: "1px solid var(--border-default)",
        padding: "var(--space-16) var(--space-12)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--space-12)",
        alignItems: "center",
      }}
    >
      <StarfieldBg />
      <div style={{ position: "absolute", top: "var(--space-16)", left: "var(--space-12)", fontFamily: "var(--font-mono)", color: "var(--signal-green)", fontSize: "var(--text-sm)", letterSpacing: "var(--tracking-widest)" }}>$ about</div>
      <div style={{ ...reveal(0), display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
        <div className="about-avatar" style={{ borderRadius: "50%", animation: "avatar-pulse 3.2s ease-in-out infinite", width: 340, height: 340, overflow: "hidden" }}>
          <img src="/about-photo.jpg" alt="Eeshan" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xl)", fontWeight: 400, letterSpacing: "-0.01em", color: "var(--text-primary)" }}>hi, i&apos;m eeshan</div>
      </div>
      <div
        onMouseEnter={() => setHoverTerm(true)}
        onMouseLeave={() => setHoverTerm(false)}
        style={{
          ...reveal(0.22),
          borderRadius: "var(--radius-md)",
          boxShadow: hoverTerm ? "var(--glow-cyan), var(--shadow-elevate)" : "var(--shadow-elevate)",
          transform: (visible ? "translateY(0)" : "translateY(18px)") + (hoverTerm ? " scale(1.015)" : ""),
          transition: reveal(0.22).transition + ", box-shadow .25s var(--ease-standard), transform .25s var(--ease-standard)",
        }}
      >
        {bootDone ? (
          <LlmTerminal title="ask-me-anything" bootLines={BOOT_LINES} />
        ) : (
          <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", overflow: "hidden", fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--border-default)", background: "var(--surface-card)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--signal-green)" }} />
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", letterSpacing: "var(--tracking-wide)" }}>ask-me-anything</span>
            </div>
            <div style={{ padding: 16, fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)", minHeight: 52 }}>
              <span style={{ color: "var(--signal-green)", whiteSpace: "pre-wrap" }}>{bootText.slice(0, bootTyped)}</span>
              <span style={{ display: "inline-block", width: 8, height: 14, background: "var(--signal-green)", marginLeft: 2, animation: "blink-caret 1s step-end infinite", verticalAlign: "middle" }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
