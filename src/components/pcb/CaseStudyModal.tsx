"use client";

import { useEffect, useRef, useState } from "react";
import { PROJECT_DATA } from "@/content/projects";
import { Badge, Tag, Button, SectionHeading } from "./ui";
import { renderProjectDemo } from "./demos";

const navBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border-default)",
  background: "var(--surface-card)",
  color: "var(--text-secondary)",
  fontFamily: "var(--font-mono)",
  fontSize: 14,
  cursor: "pointer",
};

export function CaseStudyModal({
  id,
  onClose,
  onCycle,
  originRect,
}: {
  id: string;
  onClose: () => void;
  onCycle: (dir: 1 | -1) => void;
  originRect: DOMRect | null;
}) {
  const proj = PROJECT_DATA[id];
  const [phase, setPhase] = useState<"enter" | "open" | "exit">("enter");
  const closingRef = useRef(false);

  useEffect(() => {
    setPhase("enter");
    closingRef.current = false;
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setPhase("open")));
    return () => cancelAnimationFrame(raf);
  }, [id]);

  function requestClose() {
    if (closingRef.current) return;
    closingRef.current = true;
    setPhase("exit");
    setTimeout(onClose, 380);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
      if (e.key === "ArrowLeft") onCycle(-1);
      if (e.key === "ArrowRight") onCycle(1);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!proj) return null;

  const collapsed = originRect
    ? { top: originRect.top, left: originRect.left, width: originRect.width, height: originRect.height }
    : { top: window.innerHeight / 2 - 60, left: window.innerWidth / 2 - 160, width: 320, height: 120 };
  const targetW = Math.min(980, window.innerWidth - 80);
  const targetH = Math.min(window.innerHeight * 0.86, 760);
  const targetTop = (window.innerHeight - targetH) / 2;
  const targetLeft = (window.innerWidth - targetW) / 2;
  const morphed = phase === "open";
  const box = morphed ? { top: targetTop, left: targetLeft, width: targetW, height: targetH } : collapsed;

  const ease = "cubic-bezier(.2,.8,.2,1)";

  return (
    <div
      onClick={requestClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(6,8,11,.5)",
        backgroundImage: "var(--bg-glow)",
        backdropFilter: "blur(7px) saturate(1.1)",
        opacity: phase === "open" ? 1 : 0,
        transition: "opacity .38s ease",
        perspective: 1400,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
          overflow: morphed ? "auto" : "hidden",
          background: "var(--surface-page)",
          border: "1px solid var(--border-strong)",
          borderRadius: morphed ? "var(--radius-lg)" : "var(--radius-md)",
          boxShadow: "0 30px 80px rgba(0,0,0,.5), 0 0 60px rgba(78,225,255,.06)",
          transform: morphed ? "rotateX(0deg) rotateY(0deg)" : "rotateX(10deg) rotateY(-8deg)",
          transformOrigin: "center center",
          transition: `top .42s ${ease}, left .42s ${ease}, width .42s ${ease}, height .42s ${ease}, border-radius .3s ease, transform .42s ${ease}`,
        }}
      >
        <div className="modal-inner" style={{ padding: 48, opacity: morphed ? 1 : 0, transition: "opacity .2s ease " + (morphed ? ".18s" : "0s"), position: "relative" }}>
          <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 8 }}>
            <button onClick={() => onCycle(-1)} style={navBtnStyle}>‹</button>
            <button onClick={() => onCycle(1)} style={navBtnStyle}>›</button>
            <button onClick={requestClose} style={navBtnStyle}>✕</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ width: 10, height: 10, background: proj.color, borderRadius: 2, boxShadow: "0 0 8px " + proj.color }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", letterSpacing: "var(--tracking-widest)", textTransform: "uppercase" }}>PROJECT // {id}</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px,4vw,44px)", color: "var(--text-primary)", margin: "0 0 16px", letterSpacing: "var(--tracking-tight)" }}>{proj.title}</h1>
          <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
            <Badge tone={proj.status === "live" || proj.status === "built" ? "green" : proj.status === "building" ? "amber" : "neutral"}>{proj.status}</Badge>
            {proj.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
          <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40 }}>
            <div>
              <p style={{ fontFamily: "var(--font-body)", color: "var(--text-primary)", fontSize: "var(--text-lg)", lineHeight: "var(--leading-relaxed)", margin: "0 0 28px" }}>{proj.description}</p>
              <SectionHeading label="Problem" title="Why this exists" />
              <p style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)", fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)", margin: "14px 0 28px" }}>{proj.problem}</p>
              <SectionHeading label="Approach" title="How it works" />
              <p style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)", fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)", margin: "14px 0 28px" }}>{proj.approach}</p>
              <div style={{ display: "flex", gap: 12 }}>
                <Button variant="primary" href={proj.codeUrl}>View code</Button>
                {proj.demoHref && <Button variant="ghost" href={proj.demoHref}>visit live ↗</Button>}
              </div>
            </div>
            <div>
              {renderProjectDemo(id, proj, 400)}
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 10 }}>fig.1 — demo capture</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
