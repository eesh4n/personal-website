"use client";

import { useEffect, useRef } from "react";

type Dot = { x: number; y: number; r: number; ph: number; depth: number; vx: number; vy: number };

export function StarfieldBg({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dots: Dot[] = [];
    let raf = 0;

    function size() {
      if (!canvas || !ctx) return;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      dots = Array.from({ length: Math.round((w * h) / 9000) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.4,
        ph: Math.random() * 6.28,
        depth: 0.2 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.06,
        vy: -0.02 - Math.random() * 0.05,
      }));
    }
    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    let scrollY = window.scrollY;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    function draw(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      dots.forEach((d) => {
        if (!reduce) {
          d.x = ((d.x + d.vx) % w + w) % w;
          d.y = ((d.y + d.vy) % h + h) % h;
        }
        const a = reduce ? 0.35 : 0.2 + Math.sin(t * 0.0012 + d.ph) * 0.2 + 0.2;
        const y = (((d.y - scrollY * d.depth) % h) + h) % h;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath();
        ctx.arc(d.x, y, d.r, 0, 6.28);
        ctx.fill();
      });
      if (!reduce) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
