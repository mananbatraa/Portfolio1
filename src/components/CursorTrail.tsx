"use client";

import { useEffect, useRef } from "react";

export type TrailStyle = "accent" | "pastel" | "code";

const LIFE = 420; // ms a point stays on the line trails
const GLYPH_LIFE = 750; // ms a code symbol floats before it fades
const GLYPHS = ["{ }", "</>", "=>", "( )", "[ ]", ";", "&&", "||", "!=", "++", "#", "$", "λ", "0", "1", "::", "fn", "//", "*", "%", "<>", "=="];

type Point = { x: number; y: number; t: number; hue: number };
type Glyph = { x: number; y: number; vx: number; vy: number; rot: number; spin: number; t: number; text: string; size: number };

// A trail that follows the mouse:
// - "accent": a glowing comet tail in the page's accent colour,
// - "pastel": the same tail where every bit of it is a random pastel colour,
// - "code": little coding symbols that pop off the cursor and float away.
// Skipped on touch screens and for visitors who prefer reduced motion.
export default function CursorTrail({ variant = "accent" }: { variant?: TrailStyle }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points: Point[] = [];
    const glyphs: Glyph[] = [];
    let raf = 0;
    let dpr = 1;
    let travelled = 0;
    let last: { x: number; y: number } | null = null;
    let hue = Math.random() * 360;
    const accent = () => getComputedStyle(canvas).getPropertyValue("--accent").trim().split(/\s+/).join(",") || "62,230,255";
    let rgb = accent();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      rgb = accent();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const now = performance.now();
      const step = last ? Math.hypot(e.clientX - last.x, e.clientY - last.y) : 0;
      last = { x: e.clientX, y: e.clientY };
      // Pastel hues drift with a random jump now and then, so neighbours blend.
      hue = (hue + 8 + (Math.random() < 0.15 ? Math.random() * 120 : 0)) % 360;
      points.push({ x: e.clientX, y: e.clientY, t: now, hue });
      if (variant === "code") {
        travelled += step;
        if (travelled > 26) {
          travelled = 0;
          glyphs.push({
            x: e.clientX,
            y: e.clientY,
            vx: (Math.random() - 0.5) * 40,
            vy: -30 - Math.random() * 40,
            rot: (Math.random() - 0.5) * 0.6,
            spin: (Math.random() - 0.5) * 2,
            t: now,
            text: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            size: 14 + Math.random() * 8,
          });
          if (glyphs.length > 60) glyphs.shift();
        }
      }
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const drawTail = (now: number) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const k = (i / points.length) * (1 - (now - b.t) / LIFE);
        const color = variant === "pastel" ? `hsla(${b.hue},95%,80%,` : `rgba(${rgb},`;
        ctx.shadowColor = `${color}0.9)`;
        ctx.shadowBlur = variant === "pastel" ? 10 : 12;
        ctx.strokeStyle = `${color}${0.9 * k})`;
        ctx.lineWidth = 1 + (variant === "pastel" ? 7 : 5) * k;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    };

    const drawGlyphs = (now: number) => {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = `rgba(${rgb},0.9)`;
      ctx.shadowBlur = 8;
      for (const g of glyphs) {
        const age = (now - g.t) / 1000;
        const life = 1 - (now - g.t) / GLYPH_LIFE;
        if (life <= 0) continue;
        ctx.save();
        ctx.translate(g.x + g.vx * age, g.y + g.vy * age);
        ctx.rotate(g.rot + g.spin * age);
        ctx.font = `600 ${g.size}px var(--font-geist-mono), ui-monospace, Menlo, monospace`;
        ctx.fillStyle = `rgba(${rgb},${life})`;
        ctx.fillText(g.text, 0, 0);
        ctx.restore();
      }
    };

    const draw = () => {
      const now = performance.now();
      while (points.length && now - points[0].t > LIFE) points.shift();
      while (glyphs.length && now - glyphs[0].t > GLYPH_LIFE) glyphs.shift();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (variant === "code") {
        drawGlyphs(now);
      } else {
        drawTail(now);
      }
      // A bright head right under the cursor.
      const head = points[points.length - 1];
      if (head && now - head.t < LIFE) {
        ctx.shadowBlur = 8;
        ctx.fillStyle = `rgba(255,255,255,${0.9 * (1 - (now - head.t) / LIFE)})`;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = points.length || glyphs.length ? requestAnimationFrame(draw) : 0;
      if (!raf) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [variant]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[120] h-screen w-screen" />;
}
