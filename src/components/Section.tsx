"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  index: number;
  kicker: string;
  span: number;
  className?: string;
  children: ReactNode;
};

// One act of the film. Height follows the act's span so each section
// stays on screen while its act plays behind it.
export default function Section({ id, index, kicker, span, className, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const ghostY = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);

  return (
    <section id={id} ref={ref} style={{ minHeight: `${span * 25}vh` }} className="relative">
      <motion.span
        aria-hidden
        style={{ y: ghostY }}
        className="pointer-events-none absolute right-4 top-24 select-none font-display text-[28vw] leading-none text-white/[0.03] md:right-12 md:text-[18vw]"
      >
        {String(index).padStart(2, "0")}
      </motion.span>
      <div className={cn("flex min-h-screen md:sticky md:top-0 flex-col justify-center px-5 py-24 md:px-16", className)}>
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-accent">
          Scene {String(index).padStart(2, "0")} - {kicker}
        </p>
        {children}
      </div>
    </section>
  );
}
