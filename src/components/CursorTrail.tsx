"use client";

import { useEffect, useRef } from "react";

const LIFE = 420; // ms a point stays on the trail

// A glowing comet tail that follows the cursor, drawn in the page's accent colour.
// Skipped on touch screens and for visitors who prefer reduced motion.
export default function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points: { x: number; y: number; t: number }[] = [];
    let raf = 0;
    let dpr = 1;
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
      points.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const draw = () => {
      const now = performance.now();
      while (points.length && now - points[0].t > LIFE) points.shift();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = `rgba(${rgb},0.9)`;
      ctx.shadowBlur = 12;
      // Older segments are thinner and fainter, so the tail tapers off.
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const life = 1 - (now - b.t) / LIFE;
        const k = (i / points.length) * life;
        ctx.strokeStyle = `rgba(${rgb},${0.85 * k})`;
        ctx.lineWidth = 1 + 5 * k;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      // A bright head right under the cursor.
      const head = points[points.length - 1];
      if (head && now - head.t < LIFE) {
        ctx.fillStyle = `rgba(255,255,255,${0.9 * (1 - (now - head.t) / LIFE)})`;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = points.length ? requestAnimationFrame(draw) : 0;
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
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[120] h-screen w-screen" />;
}
