"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";

import { cn } from "@/lib/utils";

// Adapted from Skiper UI's Skiper58 TextRoll: on hover each letter rolls up
// and a copy slides in from below, staggered from the centre or the left.
//
// By default it handles its own hover. With `inherit`, it takes the
// "hovered" label from an ancestor instead, so a whole heading can roll
// together; the "hidden"/"show" labels from RevealText leave it at rest.

const STAGGER = 0.035;

const rest = { y: 0 };
const below = { y: "100%" };

export const TextRoll: React.FC<{
  children: string;
  className?: string;
  center?: boolean;
  inherit?: boolean;
}> = ({ children, className, center = false, inherit = false }) => {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{children}</span>;

  const letters = children.split("");
  const delayFor = (i: number) => (center ? STAGGER * Math.abs(i - (letters.length - 1) / 2) : STAGGER * i);

  return (
    <motion.span
      {...(inherit ? {} : { initial: "initial", whileHover: "hovered" })}
      className={cn("relative inline-block overflow-hidden align-bottom", className)}
    >
      <span className="block" aria-hidden>
        {letters.map((l, i) => (
          <motion.span
            key={i}
            className="inline-block whitespace-pre"
            variants={{ initial: rest, hidden: rest, show: rest, hovered: { y: "-100%" } }}
            transition={{ ease: "easeInOut", delay: delayFor(i) }}
          >
            {l}
          </motion.span>
        ))}
      </span>
      <span className="absolute inset-0 block" aria-hidden>
        {letters.map((l, i) => (
          <motion.span
            key={i}
            className="inline-block whitespace-pre"
            variants={{ initial: below, hidden: below, show: below, hovered: rest }}
            transition={{ ease: "easeInOut", delay: delayFor(i) }}
          >
            {l}
          </motion.span>
        ))}
      </span>
      <span className="sr-only">{children}</span>
    </motion.span>
  );
};

export default TextRoll;
