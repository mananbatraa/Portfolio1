"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import FrameStage from "@/components/film/FrameStage";
import { FILM_ASSEMBLED, FILM_EXPLODED, FILM_READY, FILM_SEGMENTS } from "@/lib/film-assets";

const TOTAL = FILM_SEGMENTS.reduce((sum, s) => sum + s.span, 0);

// Scroll-scrubbed film: a laptop comes apart, clicks back together, turns, and the
// camera pushes into the screen. One span unit is a third of a screen of scroll,
// so a 6-span act takes two screens. Hidden until the footage in film-assets.ts exists.
export default function UnderTheHood() {
  const track = useRef<HTMLElement>(null);
  const [act, setAct] = useState(0);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    let acc = 0;
    let next = FILM_SEGMENTS.length - 1;
    for (let i = 0; i < FILM_SEGMENTS.length; i++) {
      acc += FILM_SEGMENTS[i].span;
      if (p <= acc / TOTAL) {
        next = i;
        break;
      }
    }
    setAct(next);
  });

  if (!FILM_READY) return null;
  const seg = FILM_SEGMENTS[act];

  return (
    <section ref={track} id="under-the-hood" style={{ height: `${(TOTAL / 3 + 1) * 100}vh` }} className="relative">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <FrameStage track={track} assembled={FILM_ASSEMBLED} exploded={FILM_EXPLODED} segments={FILM_SEGMENTS} dbName="mb-film" />

        <span
          aria-hidden
          className="pointer-events-none absolute -right-4 top-16 select-none font-display text-[38vw] leading-none text-white/[0.04] md:text-[22vw]"
        >
          {String(act + 1).padStart(2, "0")}
        </span>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-40 md:px-16 md:pb-44">
          <motion.div
            key={seg.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-accent">{seg.kicker}</p>
            <h2 className="font-display text-4xl leading-[0.95] md:text-6xl">{seg.title}</h2>
            <p className="mt-4 text-white/70 md:text-lg">{seg.line}</p>
          </motion.div>
          <div className="mt-8 flex gap-2" aria-hidden>
            {FILM_SEGMENTS.map((s, i) => (
              <span key={s.id} className={`h-0.5 w-10 rounded-full transition-colors duration-500 ${i <= act ? "bg-accent" : "bg-white/15"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
