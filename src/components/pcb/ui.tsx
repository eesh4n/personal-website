"use client";

import type { CSSProperties, ReactNode } from "react";
import type { ProjectStatus } from "@/content/projects";

/**
 * Shared primitives for the PCB design system. Built to match the tokens and
 * usage patterns in the design handoff (Button, Badge, Tag, SectionHeading,
 * NavLink, SocialLink, Input, ProjectCard) — the handoff referenced these
 * from an internal component bundle that wasn't included, so these are
 * reconstructed from every call site + the token spec.
 */

export function Button({
  variant = "primary",
  href,
  onClick,
  children,
  style,
}: {
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-sm)",
    fontWeight: "var(--weight-semibold)",
    letterSpacing: "var(--tracking-wide)",
    textTransform: "uppercase",
    padding: "10px 20px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all var(--dur-normal) var(--ease-standard)",
    border: "1px solid transparent",
  };
  const variants: Record<string, CSSProperties> = {
    primary: {
      background: "var(--text-primary)",
      color: "var(--void-000)",
      border: "1px solid var(--text-primary)",
    },
    secondary: {
      background: "transparent",
      color: "var(--text-primary)",
      border: "1px solid var(--text-primary)",
    },
    ghost: {
      background: "transparent",
      color: "var(--brand-accent)",
      border: "1px solid transparent",
      padding: "10px 4px",
    },
  };
  const combined = { ...base, ...variants[variant], ...style };
  if (href) {
    const external = href.startsWith("http");
    return (
      <a href={href} onClick={onClick} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} style={combined}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} style={combined}>
      {children}
    </button>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "green" | "amber" | "neutral"; children: ReactNode }) {
  const colors: Record<string, string> = {
    green: "var(--signal-green)",
    amber: "var(--signal-amber)",
    neutral: "var(--text-muted)",
  };
  const color = colors[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        letterSpacing: "var(--tracking-wide)",
        textTransform: "uppercase",
        color,
        border: `1px solid ${color}`,
        borderRadius: "var(--radius-pill)",
        padding: "3px 10px",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
      {children}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        color: "var(--text-secondary)",
        background: "var(--surface-inset)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-sm)",
        padding: "3px 9px",
      }}
    >
      {children}
    </span>
  );
}

export function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          letterSpacing: "var(--tracking-widest)",
          textTransform: "uppercase",
          color: "var(--brand-accent)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--weight-medium)",
          fontSize: "var(--text-2xl)",
          color: "var(--text-primary)",
          margin: 0,
          letterSpacing: "var(--tracking-tight)",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

export function NavLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="nav-link"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        letterSpacing: "var(--tracking-wide)",
        textDecoration: "none",
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        transition: "color var(--dur-fast) var(--ease-standard)",
      }}
    >
      {children}
    </a>
  );
}

export function SocialLink({ icon, label, href }: { icon: ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-secondary)",
        textDecoration: "none",
      }}
    >
      <span style={{ display: "inline-flex", width: 16, height: 16 }}>{icon}</span>
      {label}
    </a>
  );
}

export function Input({
  label,
  as = "input",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  as?: "input" | "textarea";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  const style: CSSProperties = {
    width: "100%",
    background: "var(--surface-inset)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-sm)",
    padding: "10px 12px",
    outline: "none",
    resize: "vertical",
  };
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          letterSpacing: "var(--tracking-wide)",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </span>
      {as === "textarea" ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder} rows={4} style={style} />
      ) : (
        <input value={value} onChange={onChange} placeholder={placeholder} style={style} />
      )}
    </label>
  );
}

export function ProjectCard({
  index,
  title,
  status,
  description,
  tags,
  href,
  onClick,
}: {
  index: number;
  title: string;
  status: ProjectStatus;
  description: string;
  tags: string[];
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          marginBottom: 8,
        }}
      >
        {String(index).padStart(2, "0")}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-lg)",
          color: "var(--text-primary)",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          color: "var(--text-secondary)",
          lineHeight: "var(--leading-relaxed)",
          margin: "0 0 12px",
        }}
      >
        {description}
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Badge tone={status === "live" || status === "built" ? "green" : status === "building" ? "amber" : "neutral"}>
          {status}
        </Badge>
        {tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
    </a>
  );
}

export const ChromeWindow = ({
  url,
  height,
  children,
}: {
  url?: string;
  height?: number | string;
  children: ReactNode;
}) => (
  <div
    style={{
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
      border: "1px solid var(--border-default)",
      background: "var(--surface-card)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderBottom: "1px solid var(--border-default)",
        background: "var(--surface-elevated)",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--signal-red)" }} />
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--signal-amber)" }} />
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--signal-green)" }} />
      {url && (
        <span
          style={{
            marginLeft: 10,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-muted)",
          }}
        >
          {url}
        </span>
      )}
    </div>
    <div style={{ height: height ?? 260 }}>{children}</div>
  </div>
);
