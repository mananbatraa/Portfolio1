"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useIntroDone } from "@/components/Intro";
import { TextRoll } from "@/components/ui/text-roll";
import { cn } from "@/lib/utils";

type Props = { text: string; className?: string; as?: "h1" | "h2" | "p" };

// Headlines rise word by word out of a mask, then roll letter by letter on hover.
export default function RevealText({ text, className, as = "h2" }: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const introDone = useIntroDone();
  return (
    <Tag
      className={cn("flex flex-wrap gap-x-[0.25em]", className)}
      ref={ref as never}
      initial="hidden"
      animate={inView && introDone ? "show" : "hidden"}
      whileHover="hovered"
      transition={{ staggerChildren: 0.06 }}
      aria-label={text}
    >
      {text.split(" ").map((word, i) => (
        <span key={i} className="overflow-hidden pb-[0.08em]" aria-hidden>
          <motion.span
            className="inline-block"
            variants={{
              hidden: reduce ? { opacity: 0 } : { y: "130%" },
              show: reduce ? { opacity: 1 } : { y: "0%" },
            }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <TextRoll inherit center>
              {word}
            </TextRoll>
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
