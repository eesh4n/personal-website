"use client";

import { useEffect, useRef, useState } from "react";

type HistoryEntry = { type: "q" | "a"; text: string };

export function LlmTerminal({ title = "ask-me-anything", bootLines = [] as string[] }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [askedSet, setAskedSet] = useState<Record<string, boolean>>({});
  const [hoverChip, setHoverChip] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, busy]);

  async function ask(q: string) {
    if (busy || !q.trim()) return;
    setBusy(true);
    setDraft("");
    setAskedSet((s) => ({ ...s, [q]: true }));
    setHistory((h) => [...h, { type: "q", text: "$ " + q }]);
    try {
      const res = await fetch("/api/ask-eeshan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      const answer = res.ok ? data.answer : data.error || "connection lost — try again in a moment.";
      setHistory((h) => [...h, { type: "a", text: answer }]);
    } catch {
      setHistory((h) => [...h, { type: "a", text: "connection lost — try again in a moment." }]);
    }
    setBusy(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    ask(draft);
  }

  const suggested = ["what do you do?", "what are you building?", "what stack do you use?", "how do I reach you?"];

  return (
    <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", overflow: "hidden", fontFamily: "var(--font-mono)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--border-default)", background: "var(--surface-card)" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--signal-green)" }} />
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", letterSpacing: "var(--tracking-wide)" }}>{title}</span>
      </div>
      <div style={{ position: "relative" }}>
        <div
          ref={scrollRef}
          className="no-scrollbar"
          style={{
            padding: 16,
            fontSize: "var(--text-sm)",
            lineHeight: "var(--leading-relaxed)",
            height: 200,
            overflowY: "auto",
            maskImage: "linear-gradient(to bottom, transparent 0, black 20px)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, black 20px)",
          }}
        >
          {bootLines.map((l, i) => (
            <div key={"boot" + i} style={{ color: "var(--signal-green)", whiteSpace: "pre-wrap" }}>
              {l}
            </div>
          ))}
          {history.map((h, i) => (
            <div key={i} style={{ color: h.type === "q" ? "var(--text-primary)" : "var(--signal-green)", whiteSpace: "pre-wrap", marginTop: 6 }}>
              {h.text}
            </div>
          ))}
          {busy && (
            <div style={{ color: "var(--signal-green)", marginTop: 6 }}>
              thinking<span style={{ animation: "dots-pulse 1.2s steps(4) infinite" }}>...</span>
            </div>
          )}
          {!busy && (
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 14,
                background: "var(--signal-green)",
                animation: "blink-caret 1s step-end infinite",
                verticalAlign: "middle",
                marginTop: 6,
              }}
            />
          )}
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--border-default)", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {suggested.map((q) => {
            const used = askedSet[q];
            const hovered = hoverChip === q;
            return (
              <button
                key={q}
                onClick={() => ask(q)}
                disabled={busy}
                onMouseEnter={() => setHoverChip(q)}
                onMouseLeave={() => setHoverChip(null)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  color: used ? "var(--text-muted)" : "var(--signal-cyan)",
                  background: "var(--surface-card)",
                  border: "1px solid " + (hovered && !used ? "var(--signal-cyan)" : "var(--border-default)"),
                  borderRadius: "var(--radius-sm)",
                  padding: "5px 10px",
                  cursor: busy ? "default" : "pointer",
                  opacity: busy ? 0.5 : used ? 0.55 : 1,
                  boxShadow: hovered && !used ? "var(--glow-cyan)" : "none",
                  transition: "all .15s var(--ease-standard)",
                }}
              >
                {q}
              </button>
            );
          })}
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "var(--signal-green)", fontSize: "var(--text-sm)" }}>$</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={busy}
            placeholder="ask anything about me..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}
          />
        </form>
      </div>
    </div>
  );
}
