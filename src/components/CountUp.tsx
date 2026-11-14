"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useIntroDone } from "@/components/Intro";
import { cn } from "@/lib/utils";

type Props = { value: string; className?: string; duration?: number };

// Splits "93.83%" into prefix "", number 93.83 (2 decimals), suffix "%".
// Handles things like "$1.2k", "10k+", "0.9619" and "1,200". Strings with no
// number are returned as-is and never animate.
function parse(value: string) {
  const m = value.match(/^(.*?)(\d[\d,]*(?:\.\d+)?|\.\d+)(.*)$/);
  if (!m) return null;
  const [, prefix, raw, suffix] = m;
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  return { prefix, suffix, target: parseFloat(raw.replace(/,/g, "")), decimals, grouped: raw.includes(",") };
}

function format(n: number, decimals: number, grouped: boolean) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouped,
  });
}

// A stat that counts up from 0 to its final value the first time it scrolls into view.
// The final value is laid out invisibly underneath so the width never changes while counting.
export default function CountUp({ value, className, duration = 1.6 }: Props) {
  const parsed = parse(value);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const introDone = useIntroDone();
  const reduce = useReducedMotion();
  // Server render shows the final value, so the number is right without JS.
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  // Reset to 0 once on the client, before the stat is seen.
  useEffect(() => {
    if (!parsed || reduce) return;
    if (!started.current) setDisplay(parsed.prefix + format(0, parsed.decimals, parsed.grouped) + parsed.suffix);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce]);

  useEffect(() => {
    if (!parsed || reduce || !inView || !introDone || started.current) return;
    started.current = true;
    const { prefix, suffix, target, decimals, grouped } = parsed;
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (n) => setDisplay(prefix + format(n, decimals, grouped) + suffix),
      onComplete: () => setDisplay(value),
    });
    return () => {
      controls.stop();
      setDisplay(value);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, introDone, reduce, value, duration]);

  return (
    <span ref={ref} className={cn("inline-grid tabular-nums", className)}>
      <span className="sr-only">{value}</span>
      <span className="invisible col-start-1 row-start-1" aria-hidden>
        {value}
      </span>
      <span className="col-start-1 row-start-1 text-left" aria-hidden>
        {display}
      </span>
    </span>
  );
}
