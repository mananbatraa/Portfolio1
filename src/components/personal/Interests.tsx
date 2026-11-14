"use client";

import { motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/components/motion/FadeIn";
import SectionHeading from "@/components/motion/SectionHeading";
import TiltCard from "@/components/motion/TiltCard";
import { interests } from "@/lib/personal";
import { cn } from "@/lib/utils";

// Bento layout: the first card is big, the rest fill in around it.
const spans = ["md:col-span-2 md:row-span-2"];

export default function Interests() {
  const reduce = useReducedMotion();
  return (
    <section id="interests" className="px-5 py-28 md:px-16">
      <SectionHeading kicker="What I'm into" title="OFF THE CLOCK" className="mb-12" />
      <div className="grid auto-rows-[minmax(200px,auto)] gap-4 md:grid-flow-dense md:grid-cols-4">
        {interests.map((item, i) => (
          <FadeIn key={item.title} delay={(i % 4) * 0.08} className={cn("h-full", spans[i] ?? "")}>
            <TiltCard className="h-full p-6 md:p-8">
              <div className={cn("pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br blur-2xl", item.tint)} />
              <div className="relative flex h-full flex-col justify-between gap-8">
                <motion.span
                  className={cn("inline-block origin-bottom", i === 0 ? "text-7xl md:text-8xl" : "text-5xl")}
                  animate={reduce ? undefined : { y: [0, -8, 0], rotate: [0, -4, 4, 0] }}
                  transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden
                >
                  {item.emoji}
                </motion.span>
                <div>
                  <h3 className={cn("font-display tracking-wide", i === 0 ? "text-5xl md:text-6xl" : "text-3xl")}>{item.title}</h3>
                  <p className="mt-2 max-w-md text-white/70">{item.blurb}</p>
                </div>
              </div>
            </TiltCard>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
