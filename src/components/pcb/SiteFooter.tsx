"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui";
import { GithubIcon, LinkedInIcon, InstagramIcon, MailIcon } from "./icons";

function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/visit-count")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && typeof data?.count === "number") setCount(data.count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) return null;

  return <span>visit #{count.toLocaleString()}</span>;
}

const SOCIALS = [
  { icon: <GithubIcon size={22} />, label: "GitHub", href: "https://github.com/eesh4n" },
  { icon: <LinkedInIcon size={22} />, label: "LinkedIn", href: "https://www.linkedin.com/in/eeshan-agarwal-7b7b85376/" },
  { icon: <InstagramIcon size={22} />, label: "Instagram", href: "https://www.instagram.com/eeshan.agarwal/" },
  { icon: <MailIcon size={22} />, label: "Email", href: "mailto:eeshan2agarwal@gmail.com" },
];

const compactInputStyle: React.CSSProperties = {
  background: "var(--surface-inset)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-sm)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-sm)",
  padding: "9px 12px",
  outline: "none",
  minWidth: 0,
};

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  function send() {
    const body = encodeURIComponent(msg + (email ? "\n\n— reply to: " + email : ""));
    window.location.href = "mailto:eeshan2agarwal@gmail.com?subject=" + encodeURIComponent("Hi from your site") + "&body=" + body;
  }

  return (
    <footer id="contact" className="site-footer" style={{ padding: "32px 48px", borderTop: "1px solid var(--border-default)" }}>
      <div
        className="site-footer-row"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                aria-label={s.label}
                className="footer-social-icon"
                style={{ color: "var(--text-primary)", display: "inline-flex", transition: "color var(--dur-fast) var(--ease-standard)" }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="site-footer-form" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <input
            className="footer-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            style={{ ...compactInputStyle, width: 170 }}
          />
          <input
            className="footer-input"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="say hi"
            style={{ ...compactInputStyle, width: 200 }}
          />
          <Button variant="primary" onClick={send} style={{ padding: "9px 18px" }}>
            Send
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            letterSpacing: "-0.01em",
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
          }}
        >
          <span>Eeshan Agarwal</span>
          <span>© 2026</span>
          <VisitCounter />
        </div>
      </div>
    </footer>
  );
}
