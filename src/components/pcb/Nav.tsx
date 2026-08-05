"use client";

import { useEffect, useState } from "react";
import { NavLink } from "./ui";
import { playNavClickSound } from "./sfx";

const SECTIONS = ["work", "about", "log", "contact"];

export function Nav() {
  const [active, setActive] = useState("work");

  useEffect(() => {
    function onScroll() {
      let current = SECTIONS[0];
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = id;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = SECTIONS[SECTIONS.length - 1];
      setActive(current);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="site-nav"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 48px",
        background: "rgba(10,14,19,.85)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <a
        href="#top"
        className="site-nav-brand"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--text-primary)",
          fontWeight: 600,
          fontSize: "var(--text-lg)",
          textDecoration: "none",
          letterSpacing: "var(--tracking-tight)",
        }}
      >
        Eeshan Agarwal
      </a>
      <nav className="site-nav-links" style={{ display: "flex", gap: 28 }}>
        {SECTIONS.map((id) => (
          <NavLink key={id} href={`#${id}`} active={active === id} onClick={() => playNavClickSound()}>
            {id}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
