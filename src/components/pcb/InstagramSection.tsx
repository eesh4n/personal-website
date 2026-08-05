"use client";

import { useEffect, useRef, useState } from "react";
import { StarfieldBg } from "./StarfieldBg";

const LOG_VIDEOS = [
  { id: "log-1", src: "/log/log-1.mp4", poster: "/log/log-1-poster.jpg" },
  { id: "log-2", src: "/log/log-2.mp4", poster: "/log/log-2-poster.jpg" },
  { id: "log-3", src: "/log/log-3.mp4", poster: "/log/log-3-poster.jpg" },
  { id: "log-4", src: "/log/log-4.mp4", poster: "/log/log-4-poster.jpg" },
  { id: "log-5", src: "/log/log-5.mp4", poster: "/log/log-5-poster.jpg" },
  { id: "log-6", src: "/log/log-6.mp4", poster: "/log/log-6-poster.jpg" },
  { id: "log-7", src: "/log/log-7.mp4", poster: "/log/log-7-poster.jpg" },
  { id: "log-8", src: "/log/log-8.mp4", poster: "/log/log-8-poster.jpg" },
  { id: "log-9", src: "/log/log-9.mp4", poster: "/log/log-9-poster.jpg" },
];

function MarqueeTile({
  video,
  expanded,
  onExpand,
}: {
  video: (typeof LOG_VIDEOS)[number];
  expanded: boolean;
  onExpand: (el: HTMLButtonElement | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!expanded || !el) return;
    el.volume = 1;
    el.muted = false;
    el.play().catch(() => {});
  }, [expanded]);

  return (
    <button
      ref={(el) => {
        if (expanded) onExpand(el);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onExpand(e.currentTarget);
      }}
      className={"log-tile" + (expanded ? " expanded" : "")}
    >
      {expanded ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video ref={videoRef} src={video.src} poster={video.poster} controls playsInline onClick={(e) => e.stopPropagation()} />
      ) : (
        <>
          <img src={video.poster} alt="" />
          <div className="log-tile-overlay">
            <div className="log-play-btn" />
          </div>
        </>
      )}
    </button>
  );
}

export function InstagramSection() {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const expandedElRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!expandedKey) return;
    function onPointerDown(e: PointerEvent) {
      if (expandedElRef.current && !expandedElRef.current.contains(e.target as Node)) {
        setExpandedKey(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExpandedKey(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [expandedKey]);

  return (
    <section id="log" style={{ position: "relative", borderTop: "1px solid var(--border-default)", padding: "var(--space-16) var(--space-12)" }}>
      <StarfieldBg />
      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-10)", flexWrap: "wrap", gap: 16 }}>
        <div style={{ fontFamily: "var(--font-mono)", color: "var(--signal-green)", fontSize: "var(--text-sm)", letterSpacing: "var(--tracking-widest)" }}>$ the log</div>
        <a
          href="https://www.instagram.com/eeshan.agarwal/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", letterSpacing: "-0.01em", color: "var(--signal-cyan)", border: "1px solid var(--signal-cyan)", borderRadius: "var(--radius-sm)", padding: "4px 10px", display: "inline-block" }}
        >
          @eeshan.agarwal on IG
        </a>
      </div>
      <div className="log-marquee" style={{ position: "relative", zIndex: 1 }}>
        <div
          className={"log-track" + (expandedKey ? " has-expanded" : "")}
          style={{ ["--tile-count" as string]: LOG_VIDEOS.length }}
        >
          {[...LOG_VIDEOS, ...LOG_VIDEOS].map((v, i) => {
            const key = v.id + "-" + i;
            return (
              <MarqueeTile
                key={key}
                video={v}
                expanded={expandedKey === key}
                onExpand={(el) => {
                  if (expandedKey === key) {
                    expandedElRef.current = el;
                    return;
                  }
                  expandedElRef.current = el;
                  setExpandedKey(key);
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
