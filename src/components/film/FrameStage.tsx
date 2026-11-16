"use client";

import { useEffect, useRef, type RefObject } from "react";
import { loadFrames, saveFrames } from "@/lib/frame-cache";
import type { FilmSegment } from "@/lib/film-assets";

type Props = {
  // The tall section that drives the film: 0 when its top meets the top of the
  // screen, 1 when its bottom meets the bottom.
  track: RefObject<HTMLElement>;
  assembled: string;
  exploded: string;
  segments: FilmSegment[];
  dbName: string;
};

const LERP = 0.09;
const GRADE = "brightness(1.13) contrast(1.08) saturate(1.22)";

function captureWidth() {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  return Math.round(Math.min(3840, Math.max(isMobile ? 900 : 1920, window.innerWidth * devicePixelRatio)));
}

// Phones always take the 1080p master so they never hold 4K sequences in memory.
function pickSource(seg: FilmSegment, width: number) {
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

// Plays a clip once, muted and invisible, and keeps every decoded frame as WebP.
// Seeking a <video> from scroll is decode-bound and stutters; painting frames we
// already hold in memory does not.
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

    let done = false;
    const finish = async () => {
      if (done) return;
      done = true;
      const blobs = (await Promise.all(pending)).filter((b): b is Blob => !!b);
      if (blobs.length) resolve(blobs);
      else reject(new Error(`no frames captured from ${url}`));
    };

    const onFrame = () => {
      if (!canvas.width) {
        // Size from the real video, never the 300x150 canvas default, and never upscale.
        const scale = Math.min(1, width / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      pending.push(new Promise((r) => canvas.toBlob(r, "image/webp", 0.95)));
      if (video.ended) finish();
      else video.requestVideoFrameCallback(onFrame);
    };

    video.onended = () => finish();
    video.onerror = () => reject(new Error(`failed to load ${url}`));
    video.requestVideoFrameCallback(onFrame);
    video.play().catch(reject);
  });
}

// Sticky full-screen canvas that paints the film frame for the current scroll
// position. Tiers: captured frames, then a cross-fade between the two stills,
// then (reduced motion) the assembled still on its own.
export default function FrameStage({ track, assembled, exploded, segments, dbName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const section = track.current;
    if (!canvas || !ctx || !section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canCapture = "requestVideoFrameCallback" in HTMLVideoElement.prototype;
    const width = captureWidth();
    const frames = new Map<string, ImageBitmap[]>();
    const stills: { assembled?: HTMLImageElement; exploded?: HTMLImageElement } = {};
    const totalSpan = segments.reduce((sum, s) => sum + s.span, 0);
    let cancelled = false;
    let started = false;
    let visible = false;
    let raf = 0;
    let target = 0;
    let current = 0;

    // Nothing downloads until the section is about a screen and a half away.
    const start = () => {
      if (started) return;
      started = true;
      if (assembled) loadImage(assembled).then((img) => (stills.assembled = img)).catch(() => {});
      if (exploded) loadImage(exploded).then((img) => (stills.exploded = img)).catch(() => {});
      if (!canCapture || reducedMotion) return;
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
            const bitmaps = await Promise.all(blobs.map((b) => createImageBitmap(b)));
            if (cancelled) bitmaps.forEach((b) => b.close());
            else frames.set(url, bitmaps);
          } catch (err) {
            console.warn("[FrameStage]", err);
          }
        }
      })();
    };

    const resize = () => {
      const dpr = Math.min(2, devicePixelRatio);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
    };
    const measure = () => {
      const rect = section.getBoundingClientRect();
      const run = rect.height - window.innerHeight;
      target = run > 0 ? Math.min(1, Math.max(0, -rect.top / run)) : 0;
    };

    const drawCover = (img: CanvasImageSource, iw: number, ih: number, alpha: number, scale: number) => {
      const s = Math.max(canvas.width / iw, canvas.height / ih) * scale;
      const w = iw * s;
      const h = ih * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      ctx.globalAlpha = 1;
    };

    const tick = (t: number) => {
      raf = 0;
      measure();
      const prev = current;
      current = reducedMotion ? 0 : current + (target - current) * LERP;
      const velocity = Math.abs(current - prev);
      const breathe = reducedMotion ? 1 : 1.05 + Math.sin(t / 1600) * 0.03;
      const blur = reducedMotion ? 0 : Math.min(4, velocity * 900);

      // Which act are we in, and how far through it?
      let acc = 0;
      let seg = segments[0];
      let local = 0;
      for (const s of segments) {
        const from = acc / totalSpan;
        acc += s.span;
        const to = acc / totalSpan;
        seg = s;
        if (current <= to) {
          local = Math.min(1, Math.max(0, (current - from) / (to - from)));
          break;
        }
        local = 1;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `${GRADE} blur(${blur.toFixed(2)}px)`;
      const seq = frames.get(pickSource(seg, width));
      if (seq?.length) {
        const i = Math.min(seq.length - 1, Math.floor(local * seq.length));
        const frame = seq[seg.reverse ? seq.length - 1 - i : i];
        drawCover(frame, frame.width, frame.height, 1, breathe);
      } else if (stills.assembled) {
        const [a, b] = seg.explode;
        const mix = reducedMotion ? 0 : a + (b - a) * local;
        const s1 = stills.assembled;
        drawCover(s1, s1.naturalWidth || 1600, s1.naturalHeight || 900, 1 - mix, breathe);
        if (stills.exploded && mix > 0) {
          const s2 = stills.exploded;
          drawCover(s2, s2.naturalWidth || 1600, s2.naturalHeight || 900, mix, breathe);
        }
      }
      ctx.filter = "none";
      // Keep painting only while the section is on screen (the lerp needs a few
      // frames to settle, so it also runs until it has caught up).
      if (visible || Math.abs(target - current) > 0.0005) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const near = new IntersectionObserver(([e]) => e.isIntersecting && start(), { rootMargin: "150% 0px" });
    const onScreen = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) wake();
    });
    near.observe(section);
    onScreen.observe(section);

    const onResize = () => {
      resize();
      wake();
    };
    resize();
    measure();
    current = target;
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", wake, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      near.disconnect();
      onScreen.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", wake);
      frames.forEach((seq) => seq.forEach((f) => f.close()));
    };
  }, [track, assembled, exploded, segments, dbName]);

  return (
    <div className="pointer-events-none absolute inset-0 bg-ground" aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Darken only the edges so captions stay legible and the subject stays bright. */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ground to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ground to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(7,7,8,0.85)_100%)]" />
    </div>
  );
}
