"use client";

import Link from "next/link";
import { PROJECT_DATA, PROJECT_IDS } from "@/content/projects";
import { Badge, Tag, Button, SectionHeading } from "./ui";
import { renderProjectDemo } from "./demos";

export function ProjectDetail({ id }: { id?: string }) {
  const proj = id ? PROJECT_DATA[id] : undefined;

  if (!proj || !id) {
    return (
      <section style={{ padding: "140px 48px", textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        // project not found —{" "}
        <Link href="/#work" style={{ color: "var(--signal-cyan)" }}>
          back to the board
        </Link>
      </section>
    );
  }

  const i = PROJECT_IDS.indexOf(id);
  const prevId = PROJECT_IDS[(i - 1 + PROJECT_IDS.length) % PROJECT_IDS.length];
  const nextId = PROJECT_IDS[(i + 1) % PROJECT_IDS.length];

  return (
    <section className="detail-page" style={{ padding: "60px 48px 100px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <Link href="/#work" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-secondary)", textDecoration: "none" }}>
          &larr; back to the board
        </Link>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href={"/project?id=" + prevId} style={prevNextStyle}>
            ‹ prev
          </Link>
          <Link href={"/project?id=" + nextId} style={prevNextStyle}>
            next ›
          </Link>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span style={{ width: 10, height: 10, background: proj.color, borderRadius: 2, boxShadow: "0 0 8px " + proj.color }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", letterSpacing: "var(--tracking-widest)", textTransform: "uppercase" }}>PROJECT // {id}</span>
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,56px)", color: "var(--text-primary)", margin: "0 0 16px", letterSpacing: "var(--tracking-tight)" }}>{proj.title}</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        <Badge tone={proj.status === "live" || proj.status === "built" ? "green" : proj.status === "building" ? "amber" : "neutral"}>{proj.status}</Badge>
        {proj.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
      <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48 }}>
        <div>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--text-primary)", fontSize: "var(--text-lg)", lineHeight: "var(--leading-relaxed)", margin: "0 0 32px" }}>{proj.description}</p>
          <SectionHeading label="Problem" title="Why this exists" />
          <p style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)", fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)", margin: "16px 0 32px" }}>{proj.problem}</p>
          <SectionHeading label="Approach" title="How it works" />
          <p style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)", fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)", margin: "16px 0 32px" }}>{proj.approach}</p>
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="primary" href={proj.codeUrl}>View code</Button>
            {proj.demoHref && <Button variant="ghost" href={proj.demoHref}>visit live ↗</Button>}
          </div>
        </div>
        <div>
          {renderProjectDemo(id, proj, 460)}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 10 }}>fig.1 — demo capture</div>
        </div>
      </div>
    </section>
  );
}

const prevNextStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-sm)",
  color: "var(--text-secondary)",
  textDecoration: "none",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-sm)",
  padding: "4px 12px",
};
