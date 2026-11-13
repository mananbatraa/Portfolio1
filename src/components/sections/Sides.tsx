"use client";

import Link from "next/link";
import FadeIn from "@/components/motion/FadeIn";
import TiltCard from "@/components/motion/TiltCard";

const SIDES = [
  {
    href: "/personal",
    kicker: "Personal",
    title: "MEET THE PERSON",
    line: "Music, cities, friends and the photos that go with them.",
    accent: "255 128 96",
    emoji: "🎧",
  },
  {
    href: "/professional",
    kicker: "Professional",
    title: "SEE THE WORK",
    line: "Experience, results, projects, skills and education.",
    accent: "62 230 255",
    emoji: "💼",
  },
];

// Two doors out of the home film: the personal side and the professional side.
export default function Sides() {
  return (
    <div className="grid w-full max-w-5xl gap-4 text-left md:grid-cols-2">
      {SIDES.map((s, i) => (
        <FadeIn key={s.href} delay={i * 0.1} style={{ "--accent": s.accent } as React.CSSProperties}>
          <Link href={s.href} className="block focus-visible:outline-none">
            <TiltCard className="bg-ground/70 p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/25 blur-3xl transition-transform duration-700 group-hover:scale-150" />
              <span className="text-5xl" aria-hidden>
                {s.emoji}
              </span>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-accent">{s.kicker}</p>
              <p className="mt-2 flex items-center gap-3 font-display text-4xl md:text-5xl">
                {s.title}
                <span className="text-accent transition-transform duration-500 group-hover:translate-x-2">→</span>
              </p>
              <p className="mt-3 text-white/70">{s.line}</p>
            </TiltCard>
          </Link>
        </FadeIn>
      ))}
    </div>
  );
}
