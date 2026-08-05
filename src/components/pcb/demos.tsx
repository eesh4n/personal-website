"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/content/projects";
import { ChromeWindow } from "./ui";

type Obstacle = { kind: "jump" | "duck" | "block"; x: number; id: number };

export function RivalRunsDemo({ height }: { height?: number }) {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [pos, setPos] = useState<"run" | "jump" | "duck" | "block">("run");
  const [score, setScore] = useState(0);
  const [hit, setHit] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setObstacles((o) => o.map((x) => ({ ...x, x: x.x - 9 })).filter((x) => x.x > -8));
    }, 60);
    return () => clearInterval(iv);
  }, []);

  function place(kind: Obstacle["kind"]) {
    setObstacles((o) => [...o, { kind, x: 100, id: Math.random() }]);
  }

  useEffect(() => {
    const near = obstacles.find((o) => o.x < 22 && o.x > 8);
    if (!near) return;
    const dodged = (near.kind === "jump" && pos === "jump") || (near.kind === "duck" && pos === "duck") || (near.kind === "block" && pos === "block");
    if (dodged) return;
    if (near.x < 16 && near.x > 12) {
      setHit(true);
      setTimeout(() => setHit(false), 300);
    }
  }, [obstacles, pos]);

  useEffect(() => {
    const iv = setInterval(() => setScore((s) => s + 1), 200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ height: height || 260, background: "#0c1116", fontFamily: "var(--font-mono)", color: "#e8eaed", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", fontSize: 10, color: "#9aa0a6", borderBottom: "1px solid #222" }}>
        <span>PLAYER A — dodge</span>
        <span>score {score}</span>
        <span>PLAYER B — place</span>
      </div>
      <div style={{ position: "relative", flex: 1, overflow: "hidden", background: "linear-gradient(#0c1116,#141a20)" }}>
        <div
          style={{
            position: "absolute",
            left: "10%",
            bottom: "18%",
            fontSize: 28,
            transform: pos === "jump" ? "translateY(-26px)" : pos === "duck" ? "translateY(10px) scaleY(.6)" : "none",
            transition: "transform .12s",
          }}
        >
          {pos === "block" ? "🛡️" : "🏃"}
        </div>
        {obstacles.map((o) => (
          <div key={o.id} style={{ position: "absolute", left: o.x + "%", bottom: "18%", fontSize: 22 }}>
            {o.kind === "jump" ? "🕳️" : o.kind === "duck" ? "🚧" : "☄️"}
          </div>
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "14%", height: 1, background: "#2a323b" }} />
        {hit && <div style={{ position: "absolute", inset: 0, background: "rgba(255,84,120,.18)" }} />}
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1, display: "flex", gap: 6, padding: 8, borderRight: "1px solid #222" }}>
          {(["jump", "duck", "block"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setPos(pos === k ? "run" : k)}
              style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", padding: "6px 0", cursor: "pointer", background: pos === k ? "var(--signal-cyan-dim)" : "#1a2028", color: pos === k ? "#fff" : "#9aa0a6", border: "1px solid #263041", borderRadius: 4 }}
            >
              {k}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", gap: 6, padding: 8 }}>
          {(["jump", "duck", "block"] as const).map((k) => (
            <button key={k} onClick={() => place(k)} style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", padding: "6px 0", cursor: "pointer", background: "#1a2028", color: "#9aa0a6", border: "1px solid #263041", borderRadius: 4 }}>
              +{k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const SENTIMENT_ROWS = [
  { ticker: "NVDA", sub: "r/wallstreetbets", sentiment: "bullish", conf: 0.86, reasoning: "Blackwell demand commentary across 14 posts this week outpaces any single-name volume since the March earnings run." },
  { ticker: "PLTR", sub: "r/investing", sentiment: "bullish", conf: 0.71, reasoning: "Recurring thesis around government contract renewals; posters cite margin expansion over pure revenue growth." },
  { ticker: "SMCI", sub: "r/stocks", sentiment: "bearish", conf: 0.79, reasoning: "Accounting delay concerns dominate — multiple posts flag auditor risk despite AI-server demand tailwind." },
  { ticker: "RIVN", sub: "r/wallstreetbets", sentiment: "bearish", conf: 0.64, reasoning: "Cash runway skepticism resurfacing; thesis diaries cluster around delivery guidance cuts." },
  { ticker: "ASML", sub: "r/valueinvesting", sentiment: "bullish", conf: 0.68, reasoning: "EUV monopoly framing repeated near-verbatim across three separate long-form theses this week." },
] as const;

export function SentimentDeskDemo({ height }: { height?: number }) {
  const [selected, setSelected] = useState<string>(SENTIMENT_ROWS[0].ticker);
  const row = SENTIMENT_ROWS.find((r) => r.ticker === selected)!;
  const toneColor = (s: string) => (s === "bullish" ? "var(--signal-green)" : "var(--signal-magenta)");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "128px 1fr", height: height || 260, background: "var(--surface-inset)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
      <div style={{ borderRight: "1px solid var(--border-default)", overflowY: "auto" }}>
        <div style={{ padding: "8px 10px", color: "var(--text-muted)", letterSpacing: "var(--tracking-widest)", fontSize: 9, borderBottom: "1px solid var(--border-default)" }}>TICKERS</div>
        {SENTIMENT_ROWS.map((r) => (
          <button
            key={r.ticker}
            onClick={() => setSelected(r.ticker)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              padding: "8px 10px",
              border: "none",
              borderLeft: "2px solid " + (r.ticker === selected ? toneColor(r.sentiment) : "transparent"),
              background: r.ticker === selected ? "var(--surface-card)" : "transparent",
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
            }}
          >
            <span>{r.ticker}</span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: toneColor(r.sentiment), boxShadow: "0 0 5px " + toneColor(r.sentiment) }} />
          </button>
        ))}
      </div>
      <div style={{ padding: "14px 16px", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ color: "var(--text-primary)", fontSize: 14, fontFamily: "var(--font-display)" }}>{row.ticker}</span>
          <span style={{ color: toneColor(row.sentiment), textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", fontSize: 10 }}>{row.sentiment}</span>
          <span style={{ color: "var(--text-muted)", fontSize: 10 }}>conf {Math.round(row.conf * 100)}%</span>
        </div>
        <div style={{ height: 4, background: "var(--surface-page)", borderRadius: 2, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ width: Math.round(row.conf * 100) + "%", height: "100%", background: toneColor(row.sentiment) }} />
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 10, marginBottom: 6 }}>source: {row.sub}</div>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{row.reasoning}</p>
      </div>
    </div>
  );
}

const CARDS = [
  { name: "Amex Cobalt", fee: 15.99, groceries: 0.05, dining: 0.05, gas: 0.02, other: 0.01 },
  { name: "SimplyCash Preferred", fee: 9.58, groceries: 0.04, dining: 0.02, gas: 0.04, other: 0.02 },
  { name: "Tangerine Money-Back", fee: 0, groceries: 0.02, dining: 0.02, gas: 0.02, other: 0.005 },
  { name: "BMO CashBack World Elite", fee: 12.5, groceries: 0.05, dining: 0.01, gas: 0.01, other: 0.01 },
] as const;

export function CardOptimizerDemo({ height }: { height?: number }) {
  const [spend, setSpend] = useState({ groceries: 500, dining: 250, gas: 150, other: 300 });

  const ranked = [...CARDS]
    .map((c) => {
      const monthlyBack = spend.groceries * c.groceries + spend.dining * c.dining + spend.gas * c.gas + spend.other * c.other;
      return { ...c, monthlySavings: monthlyBack - c.fee / 12 };
    })
    .sort((a, b) => b.monthlySavings - a.monthlySavings);

  const fields: { key: keyof typeof spend; label: string }[] = [
    { key: "groceries", label: "groceries" },
    { key: "dining", label: "dining" },
    { key: "gas", label: "gas" },
    { key: "other", label: "other" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", height: height || 260, background: "var(--surface-inset)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
      <div style={{ borderRight: "1px solid var(--border-default)", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ color: "var(--text-muted)", letterSpacing: "var(--tracking-widest)", fontSize: 9 }}>MONTHLY SPEND</div>
        {fields.map((f) => (
          <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>{f.label}</span>
              <span style={{ color: "var(--signal-amber)" }}>${spend[f.key]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={800}
              step={10}
              value={spend[f.key]}
              onChange={(e) => setSpend((s) => ({ ...s, [f.key]: Number(e.target.value) }))}
              style={{ width: "100%" }}
            />
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 14px", overflowY: "auto" }}>
        <div style={{ color: "var(--text-muted)", letterSpacing: "var(--tracking-widest)", fontSize: 9, marginBottom: 8 }}>RANKED FOR YOUR PROFILE</div>
        {ranked.map((c, i) => (
          <div
            key={c.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 10px",
              marginBottom: 6,
              borderRadius: "var(--radius-sm)",
              border: "1px solid " + (i === 0 ? "var(--signal-amber)" : "var(--border-default)"),
              background: i === 0 ? "rgba(255,176,32,.08)" : "transparent",
            }}
          >
            <span style={{ color: "var(--text-primary)" }}>{i === 0 ? "★ " : ""}{c.name}</span>
            <span style={{ color: c.monthlySavings >= 0 ? "var(--signal-green)" : "var(--signal-magenta)" }}>
              {c.monthlySavings >= 0 ? "+" : ""}${c.monthlySavings.toFixed(2)}/mo
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClassifiedDemo({ height }: { height?: number }) {
  const [tries, setTries] = useState(0);
  return (
    <div style={{ height: height || 260, background: "#0c0608", fontFamily: "var(--font-mono)", color: "var(--signal-magenta)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center", padding: "0 20px" }}>
      <div style={{ fontSize: 11, letterSpacing: ".2em", opacity: 0.7 }}>CLEARANCE REQUIRED</div>
      <div style={{ fontSize: 34 }}>🔒</div>
      <button onClick={() => setTries((t) => t + 1)} style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", padding: "8px 20px", cursor: "pointer", background: "rgba(255,60,180,.08)", color: "var(--signal-magenta)", border: "1px solid var(--signal-magenta)", borderRadius: 6 }}>
        request access
      </button>
      {tries > 0 && <div style={{ fontSize: 11, opacity: 0.8 }}>ACCESS DENIED — attempt {tries} logged</div>}
    </div>
  );
}

export function ReactionGameDemo({ height }: { height?: number }) {
  const [state, setState] = useState<"idle" | "waiting" | "go">("idle");
  const [msg, setMsg] = useState("PRESS START");
  const startAt = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    setState("waiting");
    setMsg("WAIT FOR IT...");
    const delay = 900 + Math.random() * 2000;
    timeout.current = setTimeout(() => {
      startAt.current = performance.now();
      setState("go");
      setMsg("PRESS NOW");
    }, delay);
  }

  function press() {
    if (state === "waiting") {
      if (timeout.current) clearTimeout(timeout.current);
      setState("idle");
      setMsg("TOO SOON — PENALTY +200ms");
      return;
    }
    if (state === "go") {
      const ms = Math.round(performance.now() - startAt.current);
      setState("idle");
      setMsg(ms + "ms");
    }
  }

  return (
    <div style={{ height: height || 260, background: "#0c1116", fontFamily: "var(--font-mono)", color: "#e8eaed", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: state === "go" ? "var(--signal-green)" : "#2a323b", boxShadow: state === "go" ? "0 0 16px var(--signal-green)" : "none", transition: "background .1s" }} />
      <div style={{ border: "1px solid #263041", borderRadius: 6, padding: "10px 18px", fontSize: 13, letterSpacing: ".05em", minWidth: 200, textAlign: "center", background: "#141a20" }}>{msg}</div>
      <button onClick={state === "idle" ? start : press} style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", padding: "8px 20px", cursor: "pointer", background: "var(--signal-cyan-dim)", color: "#fff", border: "1px solid var(--signal-cyan)", borderRadius: 6 }}>
        {state === "idle" ? "start" : "press!"}
      </button>
    </div>
  );
}

export function renderProjectDemo(id: string, proj: Project, h: number) {
  if (id === "sentiment-desk")
    return (
      <ChromeWindow url={proj.demoUrl} height={h}>
        <SentimentDeskDemo height={h} />
      </ChromeWindow>
    );
  if (id === "cc-optimizer")
    return (
      <ChromeWindow url={proj.demoUrl} height={h}>
        <CardOptimizerDemo height={h} />
      </ChromeWindow>
    );
  if (id === "rivalruns")
    return (
      <ChromeWindow url={proj.demoUrl} height={h}>
        <RivalRunsDemo height={h} />
      </ChromeWindow>
    );
  if (id === "reaction-game")
    return (
      <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-default)" }}>
        <ReactionGameDemo height={h} />
      </div>
    );
  if (id === "quant-options-pipeline")
    return (
      <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-default)" }}>
        <ClassifiedDemo height={h} />
      </div>
    );
  return (
    <div style={{ aspectRatio: "16/9", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--surface-card)" }} />
  );
}
