"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = { text: string; className?: string; as?: "h1" | "h2" | "p" };

// Headlines rise word by word out of a mask.
export default function RevealText({ text, className, as = "h2" }: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={cn("flex flex-wrap gap-x-[0.25em]", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: 0.06 }}
      aria-label={text}
    >
      {text.split(" ").map((word, i) => (
        <span key={i} className="overflow-hidden pb-[0.08em]" aria-hidden>
          <motion.span
            className="inline-block"
            variants={{
              hidden: reduce ? { opacity: 0 } : { y: "110%" },
              show: reduce ? { opacity: 1 } : { y: "0%" },
            }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
