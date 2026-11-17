"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import SectionHeading from "@/components/motion/SectionHeading";
import { memories, type Memory } from "@/lib/personal";
import { headings, hints } from "@/lib/copy";

const TINTS = [
  "from-rose-400/70 to-orange-300/60",
  "from-sky-400/70 to-indigo-400/60",
  "from-emerald-400/70 to-teal-300/60",
  "from-fuchsia-400/70 to-purple-400/60",
  "from-amber-300/70 to-rose-400/60",
  "from-cyan-300/70 to-blue-500/60",
];

const tilt = () => Math.round((Math.random() * 2 - 1) * 7);

function Photo({ m, i, sizes }: { m: Memory; i: number; sizes: string }) {
  return (
    <div className={`relative aspect-square overflow-hidden bg-gradient-to-br ${TINTS[i % TINTS.length]}`}>
      {m.src ? (
        <Image src={m.src} alt={m.caption} fill sizes={sizes} className="object-cover" draggable={false} />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-white/90">
          <span className="text-4xl" aria-hidden>
            📸
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em]">{hints.photoSoon}</span>
        </div>
      )}
    </div>
  );
}

// A wall of polaroids. They straighten on hover, reshuffle on demand,
// and open full size in a lightbox that grows out of the card.
export default function Memories() {
  const reduce = useReducedMotion();
  const [angles, setAngles] = useState<number[]>(() => memories.map((_, i) => [-4, 3, -2, 5, -5, 2][i % 6]));
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o + 1) % memories.length));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o - 1 + memories.length) % memories.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current = open === null ? null : memories[open];

  return (
    <section id="memories" className="px-5 py-28 md:px-16">
      <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading {...headings.memories} />
        <button
          onClick={() => setAngles(memories.map(tilt))}
          className="self-start rounded-full border border-white/15 px-5 py-2 text-sm text-white/80 transition hover:border-accent hover:text-accent md:self-auto"
        >
          {hints.shuffleWall}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {memories.map((m, i) => (
          <motion.button
            key={i}
            layoutId={reduce ? undefined : `memory-${i}`}
            onClick={() => setOpen(i)}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            animate={{ rotate: angles[i] }}
            whileHover={reduce ? undefined : { rotate: 0, scale: 1.06, y: -8, zIndex: 20 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 160, damping: 16, delay: (i % 4) * 0.06 }}
            className="relative rounded-sm bg-[#f4f1ea] p-2.5 pb-12 text-left shadow-xl shadow-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:p-3 md:pb-14"
            aria-label={`Open photo: ${m.caption}`}
          >
            <Photo m={m} i={i} sizes="(min-width: 1024px) 25vw, 50vw" />
            <span className="absolute inset-x-3 bottom-3 md:bottom-4">
              <span className="block truncate font-[cursive] text-base text-neutral-800 md:text-lg">{m.caption}</span>
              {(m.place || m.date) && (
                <span className="block truncate font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                  {[m.place, m.date].filter(Boolean).join(" · ")}
                </span>
              )}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {current && open !== null && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label={current.caption}
          >
            <motion.div
              layoutId={reduce ? undefined : `memory-${open}`}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-sm bg-[#f4f1ea] p-4 pb-20 shadow-2xl"
            >
              <Photo m={current} i={open} sizes="512px" />
              <div className="absolute inset-x-4 bottom-5">
                <p className="font-[cursive] text-2xl text-neutral-800">{current.caption}</p>
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                  {[current.place, current.date].filter(Boolean).join(" · ")}
                </p>
              </div>
            </motion.div>
            <button className="absolute right-5 top-5 rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20" onClick={() => setOpen(null)}>
              Close ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
