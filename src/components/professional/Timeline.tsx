"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import FadeIn from "@/components/motion/FadeIn";
import SectionHeading from "@/components/motion/SectionHeading";
import TiltCard from "@/components/motion/TiltCard";
import { experience } from "@/lib/content";

// Experience on a vertical line that fills in as you scroll past each role.
export default function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });

  return (
    <section id="experience" className="px-5 py-24 md:px-16">
      <SectionHeading kicker="Experience" title="WHERE I'VE WORKED" className="mb-14" />
      <div ref={ref} className="relative ml-2 md:ml-[calc(25%-1px)]">
        <div className="absolute bottom-0 left-0 top-0 w-px bg-white/10" />
        <motion.div style={{ scaleY: fill }} className="absolute bottom-0 left-0 top-0 w-px origin-top bg-accent shadow-[0_0_10px_rgb(var(--accent))]" />
        <ol className="space-y-12">
          {experience.map((job) => (
            <li key={job.company} className="relative pl-8 md:pl-12">
              <span className="absolute -left-[7px] top-8 h-3.5 w-3.5 rounded-full border-2 border-accent bg-ground" />
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-white/50 md:absolute md:-left-[calc(33.333%+2rem)] md:top-8 md:mb-0 md:w-[calc(33.333%)] md:text-right">
                {job.dates}
              </p>
              <FadeIn>
                <TiltCard max={4} className="p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-4xl">{job.company}</h3>
                      <p className="text-white/60">
                        {job.role} · {job.place}
                      </p>
                    </div>
                    <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-right">
                      <p className="font-display text-3xl text-accent">{job.stat.value}</p>
                      <p className="text-[11px] uppercase tracking-widest text-white/60">{job.stat.label}</p>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3 text-white/80">
                    {job.details.map((d) => (
                      <li key={d} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {d}
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {job.stack.map((s) => (
                      <li key={s} className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-xs text-white/60">
                        {s}
                      </li>
                    ))}
                  </ul>
                </TiltCard>
              </FadeIn>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
