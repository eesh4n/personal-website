"use client";

import { useEffect, useRef, useState } from "react";
import { StarfieldBg } from "./StarfieldBg";
import { PcbMount, type PcbMountRef } from "./PcbMount";
import { Button, ProjectCard } from "./ui";
import { CaseStudyModal } from "./CaseStudyModal";
import { PROJECT_DATA, LEGEND } from "@/content/projects";
import { playChipEjectSound, playNavClickSound } from "./sfx";

function Circled({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-block", border: "1px solid " + color, borderRadius: "var(--radius-pill)", padding: "1px 10px", margin: "0 2px", color, fontFamily: "var(--font-mono)", fontSize: "0.85em" }}>
      {children}
    </span>
  );
}

function LogLine({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 16, fontFamily: "var(--font-body)", fontSize: "var(--text-base)", color: "var(--text-secondary)", lineHeight: "var(--leading-relaxed)", padding: "9px 0", borderTop: "1px solid var(--border-default)" }}>
      <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.78em", paddingTop: 2, flexShrink: 0, width: 20 }}>{index}</span>
      <span>{children}</span>
    </div>
  );
}

function Tag({ id, selected, onSelect, children }: { id: string; selected: boolean; onSelect: (id: string) => void; children: React.ReactNode }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [releasing, setReleasing] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  function onMove(e: React.MouseEvent<HTMLSpanElement>) {
    if (!ref.current) return;
    if (releasing) setReleasing(false);
    const r = ref.current.getBoundingClientRect();
    setOffset({ x: (e.clientX - (r.left + r.width / 2)) * 0.2, y: (e.clientY - (r.top + r.height / 2)) * 0.2 });
  }
  function onLeave() {
    setReleasing(true);
    setOffset({ x: 0, y: 0 });
  }
  return (
    <span
      ref={ref}
      onClick={() => onSelect(id)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "1px 8px",
        margin: "0 1px",
        borderRadius: "var(--radius-sm)",
        background: selected ? "var(--signal-cyan-dim)" : "var(--surface-inset)",
        border: "1px solid " + (selected ? "var(--signal-cyan)" : "var(--border-strong)"),
        fontFamily: "var(--font-mono)",
        fontSize: "0.85em",
        color: "var(--text-primary)",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: releasing ? "transform .5s cubic-bezier(0.34,1.56,0.64,1), background .15s, border-color .15s" : "transform .15s var(--ease-standard), background .15s, border-color .15s",
      }}
    >
      {children}
    </span>
  );
}

export function Hero() {
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "problem" | "approach">("overview");
  const [modalId, setModalId] = useState<string | null>(null);
  const [modalOrigin, setModalOrigin] = useState<DOMRect | null>(null);
  const pcbRef = useRef<PcbMountRef>(null);

  function onSelectProject(id: string) {
    setSelected(id);
    playChipEjectSound();
    pcbRef.current?.triggerEject(id);
    pcbRef.current?.setSelected(id);
  }

  useEffect(() => {
    setTab("overview");
  }, [selected]);

  function cycle(dir: 1 | -1) {
    const i = LEGEND.findIndex((l) => l.id === selected);
    const next = LEGEND[(i + dir + LEGEND.length) % LEGEND.length];
    onSelectProject(next.id);
    return next.id;
  }
  function closeProject() {
    setSelected(null);
    pcbRef.current?.setSelected(null);
  }
  function openModal(id: string, e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    e.preventDefault();
    setModalOrigin(e.currentTarget.getBoundingClientRect());
    setModalId(id);
    history.pushState({ pcbModal: id }, "", "?id=" + id);
  }
  function closeModal() {
    setModalId(null);
    history.pushState({}, "", location.pathname);
  }
  useEffect(() => {
    function onPop() {
      setModalId(location.search.includes("id=") ? new URLSearchParams(location.search).get("id") : null);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const proj = selected ? PROJECT_DATA[selected] : null;

  return (
    <section
      id="work"
      className="hero-grid"
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr 1.05fr",
        alignItems: "start",
        gap: "var(--space-12)",
        padding: "var(--space-10) var(--space-12) var(--space-section)",
        minHeight: "92vh",
      }}
    >
      <StarfieldBg />
      <div className="hero-copy" style={{ maxWidth: 560 }}>
        <div style={{ fontFamily: "var(--font-mono)", color: "var(--signal-green)", fontSize: "var(--text-sm)", letterSpacing: "var(--tracking-widest)", marginBottom: "var(--space-5)" }}>$ whoami</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(34px,4.2vw,50px)", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.15, letterSpacing: "var(--tracking-tight)", margin: "0 0 var(--space-5)" }}>
          Hi, I&apos;m Eeshan. I <em style={{ color: "var(--signal-cyan)", fontStyle: "italic" }}>build</em> things and obsess over <em style={{ color: "var(--signal-cyan)", fontStyle: "italic" }}>markets</em> on the side.
        </h1>
        <div
          className="uni-badge"
          style={{
            display: "inline-flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "var(--space-3)",
            padding: "var(--space-2) var(--space-4)",
            borderRadius: "var(--radius-sm)",
            background: "var(--signal-cyan-dim)",
            border: "1px solid var(--signal-cyan)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            marginBottom: "var(--space-8)",
          }}
        >
          <span>engineering + ivey hba @ western university</span>
          <a href="https://www.uwo.ca" target="_blank" rel="noopener noreferrer" onClick={playNavClickSound} style={{ display: "block" }}>
            <img className="logo-badge" src="/logos/western.png" alt="Western University" style={{ height: 28, background: "#fff", borderRadius: 4, padding: "3px 5px", display: "block" }} />
          </a>
          <a href="https://www.ivey.uwo.ca" target="_blank" rel="noopener noreferrer" onClick={playNavClickSound} style={{ display: "block" }}>
            <img className="logo-badge" src="/logos/ivey.png" alt="Ivey Business School" style={{ height: 28, background: "#fff", borderRadius: 4, padding: "3px 5px", display: "block" }} />
          </a>
        </div>

        <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", marginBottom: "var(--space-2)" }}>what i&apos;m doing</div>
        <LogLine index="01">
          seeking <Circled color="var(--signal-amber)">summer 2027</Circled> internships
        </LogLine>
        <LogLine index="02">
          building{" "}
          <Tag id="quant-options-pipeline" selected={selected === "quant-options-pipeline"} onSelect={onSelectProject}>
            options-strategy
          </Tag>
          , a 0DTE options strategy collaborating with a $200K AUM fund
        </LogLine>

        <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wide)", margin: "var(--space-8) 0 var(--space-2)" }}>what i&apos;ve built</div>
        <LogLine index="03">
          built{" "}
          <Tag id="rivalruns" selected={selected === "rivalruns"} onSelect={onSelectProject}>
            rival-runs
          </Tag>
          , a controller-free two-player runner — 2nd Best Overall Hack @{" "}
          <a href="https://hackthevalley.io" target="_blank" rel="noopener noreferrer" style={{ color: "var(--signal-cyan)" }}>
            Hack the Valley
          </a>
        </LogLine>
        <LogLine index="04">
          shipped{" "}
          <Tag id="sentiment-desk" selected={selected === "sentiment-desk"} onSelect={onSelectProject}>
            sentiment-desk
          </Tag>
          , an LLM that reads Reddit&apos;s finance subs for you
        </LogLine>
        <LogLine index="05">
          shipped{" "}
          <Tag id="cc-optimizer" selected={selected === "cc-optimizer"} onSelect={onSelectProject}>
            credit-card-optimizer
          </Tag>
          , a Canadian credit-card savings model
        </LogLine>
        <LogLine index="06">
          <Circled color="var(--signal-cyan)">more to come :)</Circled>
        </LogLine>

        <div style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-10)" }}>
          <Button variant="secondary" href="#about">About me</Button>
          <Button variant="ghost" href="#contact">Get in touch</Button>
        </div>
      </div>

      <div className="pcb-wrap" style={{ position: "sticky", top: 90 }}>
        <div className="pcb-stage" style={{ position: "relative", height: proj ? 420 : 580, overflow: "hidden", transition: "height .55s cubic-bezier(.34,1.1,.4,1)" }}>
          <div className="pcb-inner" style={{ width: "100%", height: 580, touchAction: "none", transformOrigin: "top center", transform: proj ? "scale(0.7241)" : "scale(1)", transition: "transform .55s cubic-bezier(.34,1.1,.4,1)" }}>
            <PcbMount ref={pcbRef} onSelect={onSelectProject} onHover={() => {}} />
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 10,
              right: 12,
              minWidth: 200,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 5,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-secondary)",
              letterSpacing: "var(--tracking-wide)",
              pointerEvents: "none",
              padding: "8px 12px",
              background: "rgba(7,9,12,.65)",
              backdropFilter: "blur(4px)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-default)",
            }}
          >
            <span>drag to rotate · click a part</span>
          </div>
        </div>
        <div style={{ maxHeight: proj ? 600 : 0, opacity: proj ? 1 : 0, overflow: proj ? "visible" : "hidden", transition: "max-height .55s cubic-bezier(.34,1.1,.4,1), opacity .35s ease .1s", marginTop: 14 }}>
          {proj && selected && (
            <div style={{ position: "relative", border: "1px solid rgba(255,180,84,.28)", borderRadius: 2, background: "var(--surface-card)", padding: "22px 20px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--signal-amber)", letterSpacing: "var(--tracking-widest)" }}>PROJECTING // {selected}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => cycle(-1)} style={cycleBtnStyle}>‹</button>
                  <button onClick={() => cycle(1)} style={cycleBtnStyle}>›</button>
                  <button onClick={closeProject} style={cycleBtnStyle}>✕</button>
                </div>
              </div>
              <div style={{ position: "relative", display: "flex", background: "var(--surface-inset)", border: "1px solid var(--border-default)", borderRadius: 999, padding: 3, marginBottom: 14 }}>
                <div
                  style={{
                    position: "absolute",
                    top: 3,
                    bottom: 3,
                    left: `calc(${["overview", "problem", "approach"].indexOf(tab)} * 33.3333% + 3px)`,
                    width: "calc(33.3333% - 6px)",
                    background: "var(--surface-card)",
                    border: "1px solid var(--signal-amber)",
                    borderRadius: 999,
                    transition: "left .25s cubic-bezier(.34,1.4,.4,1)",
                  }}
                />
                {(["overview", "problem", "approach"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      position: "relative",
                      zIndex: 1,
                      flex: 1,
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "var(--tracking-wide)",
                      textTransform: "uppercase",
                      padding: "5px 0",
                      borderRadius: 999,
                      cursor: "pointer",
                      background: "transparent",
                      border: "none",
                      color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
                      transition: "color .2s ease",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid" }}>
                <div style={{ gridArea: "1/1", visibility: tab === "overview" ? "visible" : "hidden", pointerEvents: tab === "overview" ? "auto" : "none" }}>
                  <ProjectCard
                    index={LEGEND.findIndex((l) => l.id === selected) + 1}
                    title={proj.title}
                    status={proj.status}
                    description={proj.description}
                    tags={proj.tags}
                    href={"/project?id=" + selected}
                    onClick={(e) => openModal(selected, e)}
                  />
                </div>
                <div style={{ gridArea: "1/1", visibility: tab === "problem" ? "visible" : "hidden", pointerEvents: tab === "problem" ? "auto" : "none" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>{proj.problem}</p>
                  <button onClick={(e) => openModal(selected, e)} style={openFullStyle}>open full case study →</button>
                </div>
                <div style={{ gridArea: "1/1", visibility: tab === "approach" ? "visible" : "hidden", pointerEvents: tab === "approach" ? "auto" : "none" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>{proj.approach}</p>
                  <button onClick={(e) => openModal(selected, e)} style={openFullStyle}>open full case study →</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {modalId && <CaseStudyModal id={modalId} onClose={closeModal} onCycle={(dir) => setModalId(cycle(dir))} originRect={modalOrigin} />}
    </section>
  );
}

const cycleBtnStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--text-secondary)",
  background: "var(--surface-inset)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-sm)",
  width: 22,
  height: 22,
  cursor: "pointer",
};

const openFullStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: 14,
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  color: "var(--signal-cyan)",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};
