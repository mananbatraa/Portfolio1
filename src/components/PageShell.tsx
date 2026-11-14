"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import MusicPlayer from "@/components/MusicPlayer";
import CursorTrail from "@/components/CursorTrail";
import Nav from "@/components/Nav";
import TourGuide from "@/components/mascot/TourGuide";
import { profile } from "@/lib/content";

type Props = {
  // "R G B" triple that re-tints every accent on the page.
  accent: string;
  // Which side this is: picks the wolf guide's outfit and tour.
  side: "personal" | "professional";
  next: { label: string; href: string; line: string };
  children: ReactNode;
};

// Frame for the Personal and Professional pages: drifting glow in the page's own
// colour, a scroll progress bar, the nav, and a hand-off to the other side.
export default function PageShell({ accent, side, next, children }: Props) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <div style={{ "--accent": accent } as CSSProperties} className="relative min-h-screen overflow-x-clip">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {[
          "left-[-10%] top-[-10%] h-[50vw] w-[50vw] bg-accent/20",
          "right-[-15%] top-[30%] h-[45vw] w-[45vw] bg-fuchsia-500/10",
          "bottom-[-20%] left-[20%] h-[40vw] w-[40vw] bg-accent/10",
        ].map((cls, i) => (
          <motion.div
            key={cls}
            className={`absolute rounded-full blur-[120px] ${cls}`}
            animate={reduce ? undefined : { x: [0, 60, -40, 0], y: [0, -40, 50, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 22 + i * 6, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>
      <motion.div aria-hidden style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-accent" />
      <Nav solid />
      <MusicPlayer />
      <TourGuide page={side} />
      <CursorTrail variant={side === "personal" ? "pastel" : "code"} />
      <main className="relative z-10">{children}</main>
      <footer id="next" className="relative z-10 px-5 pb-24 pt-10 md:px-16">
        <Link
          href={next.href}
          className="group block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md transition-colors duration-500 hover:border-accent/50 md:p-14"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">{next.line}</p>
          <p className="mt-4 flex items-center gap-4 font-display text-5xl md:text-8xl">
            {next.label}
            <span className="inline-block text-accent transition-transform duration-500 group-hover:translate-x-4">→</span>
          </p>
        </Link>
        <div className="mt-10 flex flex-col justify-between gap-4 text-sm text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {profile.name}</p>
          <ul className="flex gap-6">
            {[
              ["Email", `mailto:${profile.email}`],
              ["GitHub", profile.github],
              ["LinkedIn", profile.linkedin],
            ]
              .filter(([, href]) => href)
              .map(([label, href]) => (
                <li key={label}>
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="hover:text-accent">
                    {label}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}
