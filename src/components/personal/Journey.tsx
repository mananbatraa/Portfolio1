"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import SectionHeading from "@/components/motion/SectionHeading";
import { journey } from "@/lib/personal";
import { headings } from "@/lib/copy";

// Scrolling down slides the stops sideways while the section stays pinned.
export default function Journey() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const line = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth + 64));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section ref={section} id="journey" style={{ height: `calc(100vh + ${distance}px)` }} className="relative">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <SectionHeading {...headings.journey} className="mb-12 px-5 md:px-16" />
        <div className="relative">
          <div className="absolute left-0 right-0 top-[11px] h-px bg-white/10" />
          <motion.div style={{ width: line }} className="absolute left-0 top-[11px] h-px bg-accent shadow-[0_0_12px_rgb(var(--accent))]" />
          <motion.div ref={track} style={{ x }} className="flex w-max gap-6 px-5 md:px-16">
            {journey.map((stop, i) => (
              <div key={stop.place} className="w-[78vw] max-w-sm shrink-0 sm:w-80">
                <span className="relative z-10 mb-6 block h-6 w-6 rounded-full border-2 border-accent bg-ground">
                  <span className="absolute inset-1 rounded-full bg-accent" />
                </span>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">{stop.year}</p>
                  <h3 className="mt-3 font-display text-5xl">{stop.place}</h3>
                  <p className="mt-3 text-white/70">{stop.note}</p>
                  <p className="mt-6 font-mono text-xs text-white/30">Stop {String(i + 1).padStart(2, "0")}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
