"use client";

import { useEffect, useRef } from "react";
import { loadFrames, saveFrames } from "@/lib/frame-cache";
import type { Segment } from "@/lib/hero-assets";

type Props = {
  assembled: string;
  exploded: string;
  segments: Segment[];
  dbName: string;
};

type Frames = ImageBitmap[];

const LERP = 0.09;
const PUNCH = "brightness(1.13) contrast(1.08) saturate(1.22)";

function captureWidth() {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  return Math.round(Math.min(3840, Math.max(isMobile ? 900 : 1920, window.innerWidth * devicePixelRatio)));
}

function pickSource(seg: Segment, width: number) {
  return width > 1920 && seg.url4K ? seg.url4K : seg.url;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Plays a clip once, invisibly, and captures every decoded frame as WebP.
// Seeking a <video> from scroll is decode-bound; painting decoded frames is not.
function captureClip(url: string, width: number): Promise<Blob[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = url;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const pending: Promise<Blob | null>[] = [];
    if (!ctx) return reject(new Error("no 2d context"));

    const onFrame = () => {
      if (!canvas.width) {
        // Size from the real video, never the 300x150 canvas default. Never upscale.
        const scale = Math.min(1, width / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      pending.push(new Promise((r) => canvas.toBlob(r, "image/webp", 0.95)));
      if (video.ended) finish();
      else video.requestVideoFrameCallback(onFrame);
    };

    const finish = async () => {
      const blobs = (await Promise.all(pending)).filter((b): b is Blob => !!b);
      if (blobs.length) resolve(blobs);
      else reject(new Error("no frames captured"));
    };

    video.onended = () => finish();
    video.onerror = () => reject(new Error(`failed to load ${url}`));
    video.requestVideoFrameCallback(onFrame);
    video.play().catch(reject);
  });
}

export default function FrameStage({ assembled, exploded, segments, dbName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canCapture = "requestVideoFrameCallback" in HTMLVideoElement.prototype;
    const width = captureWidth();
    const frames = new Map<string, Frames>();
    const stills: { assembled?: HTMLImageElement; exploded?: HTMLImageElement } = {};
    const totalSpan = segments.reduce((sum, s) => sum + s.span, 0);
    let cancelled = false;
    let raf = 0;
    let target = 0;
    let current = 0;

    loadImage(assembled).then((img) => (stills.assembled = img)).catch(() => {});
    loadImage(exploded).then((img) => (stills.exploded = img)).catch(() => {});

    if (canCapture && !reducedMotion) {
      const urls = Array.from(new Set(segments.map((s) => pickSource(s, width)).filter(Boolean)));
      (async () => {
        for (const url of urls) {
          if (cancelled) return;
          const key = `${url}|${width}`;
          try {
            let blobs = await loadFrames(dbName, key);
            if (!blobs) {
              blobs = await captureClip(url, width);
              // Only complete captures reach the cache.
              await saveFrames(dbName, key, blobs);
            }
            frames.set(url, await Promise.all(blobs.map((b) => createImageBitmap(b))));
          } catch (err) {
            console.warn("[FrameStage]", err);
          }
        }
      })();
    }

    const resize = () => {
      canvas.width = Math.round(window.innerWidth * devicePixelRatio);
      canvas.height = Math.round(window.innerHeight * devicePixelRatio);
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    const drawCover = (img: CanvasImageSource, iw: number, ih: number, alpha = 1, scale = 1) => {
      const s = Math.max(canvas.width / iw, canvas.height / ih) * scale;
      const w = iw * s;
      const h = ih * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      ctx.globalAlpha = 1;
    };

    const tick = (t: number) => {
      const prev = current;
      current = reducedMotion ? 0 : current + (target - current) * LERP;
      const velocity = Math.abs(current - prev);
      const breathe = reducedMotion ? 1 : 1.05 + Math.sin(t / 1600) * 0.03;
      const blur = Math.min(4, velocity * 900);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `${PUNCH} blur(${blur.toFixed(2)}px)`;

      // Which act are we in, and how far through it?
      let acc = 0;
      let seg = segments[0];
      let local = 0;
      for (const s of segments) {
        const start = acc / totalSpan;
        acc += s.span;
        const end = acc / totalSpan;
        seg = s;
        if (current <= end) {
          local = (current - start) / (end - start);
          break;
        }
      }

      const seq = frames.get(pickSource(seg, width));
      if (seq?.length) {
        const i = Math.min(seq.length - 1, Math.floor(local * seq.length));
        const frame = seq[seg.reverse ? seq.length - 1 - i : i];
        drawCover(frame, frame.width, frame.height, 1, breathe);
      } else if (stills.assembled) {
        // Crossfade tier: assembled -> exploded through the deconstruct act, then back.
        let mix = 0;
        if (seg.id === "deconstruct") mix = local;
        else if (seg.id === "reassemble") mix = 1 - local;
        const a = stills.assembled;
        drawCover(a, a.naturalWidth || 1600, a.naturalHeight || 900, 1 - mix, breathe);
        if (stills.exploded && mix > 0) {
          const e = stills.exploded;
          drawCover(e, e.naturalWidth || 1600, e.naturalHeight || 900, mix, breathe);
        }
      }
      ctx.filter = "none";
      raf = requestAnimationFrame(tick);
    };

    resize();
    onScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      frames.forEach((seq) => seq.forEach((f) => f.close()));
    };
  }, [assembled, exploded, segments, dbName]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-ground" aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Edge-only darkening keeps text legible while the centre stays bright. */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-ground to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ground to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(7,7,8,0.85)_100%)]" />
      <div className="absolute bottom-[12%] left-1/2 h-24 w-[60vw] -translate-x-1/2 rounded-[50%] bg-accent/10 blur-3xl" />
    </div>
  );
}
