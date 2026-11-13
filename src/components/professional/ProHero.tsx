"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import RevealText from "@/components/RevealText";
import WolfMascot from "@/components/mascot/WolfMascot";
import FlipText from "@/components/ui/flip-text";
import { experience, profile } from "@/lib/content";

export default function ProHero() {
  const reduce = useReducedMotion();
  const links = [
    ["Email me", `mailto:${profile.email}`, true],
    ["LinkedIn", profile.linkedin, false],
    ["GitHub", profile.github, false],
    ["Resume", profile.resume, false],
  ].filter(([, href]) => href) as [string, string, boolean][];

  return (
    <section className="flex min-h-screen flex-col-reverse items-start justify-center gap-12 px-5 pb-16 pt-28 md:flex-row md:items-center md:gap-16 md:px-16">
      <div className="md:w-3/5">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          Open to full-time roles · {profile.location}
        </span>
        <RevealText as="h1" text={profile.name.toUpperCase()} className="font-display text-[16vw] leading-[0.88] md:text-[8vw]" />
        <FlipText duration={3} className="mt-4 font-display text-3xl tracking-wide text-accent md:text-5xl">
          {profile.role.toUpperCase()}
        </FlipText>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-6 max-w-xl text-lg text-white/75"
        >
          {profile.summary}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          {links.map(([label, href, primary]) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className={
                primary
                  ? "rounded-full bg-accent px-6 py-3 text-sm font-semibold text-ground transition hover:shadow-[0_0_32px_rgb(var(--accent)/0.6)]"
                  : "rounded-full border border-white/15 px-6 py-3 text-sm text-white/85 transition hover:border-accent hover:text-accent"
              }
            >
              {label}
            </a>
          ))}
        </motion.div>
        <p className="mt-10 font-mono text-xs uppercase tracking-[0.25em] text-white/40">
          {experience.length} internships · {experience.map((e) => e.company).join(" · ")}
        </p>
      </div>

      {/* LinkedIn photo inside a slowly turning accent ring. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto aspect-square w-56 md:w-[26vw] md:max-w-sm"
      >
        <motion.div
          aria-hidden
          className="absolute -inset-2 rounded-full bg-[conic-gradient(from_0deg,rgb(var(--accent)),transparent_30%,rgb(var(--accent)/0.4)_60%,transparent_80%,rgb(var(--accent)))]"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 overflow-hidden rounded-full border-4 border-ground bg-gradient-to-br from-slate-800 to-slate-950">
          {profile.photo ? (
            <Image src={profile.photo} alt={`${profile.name}, LinkedIn photo`} fill priority sizes="(min-width: 768px) 26vw, 224px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-7xl text-white/80 md:text-8xl">MB</div>
          )}
        </div>
        <motion.span
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="absolute -right-2 bottom-6 rounded-full border border-white/10 bg-ground/80 px-3 py-1.5 text-xs backdrop-blur-md md:-right-6"
        >
          🎓 MS CS · ASU
        </motion.span>
        <WolfMascot
          className="absolute -bottom-16 -left-12 z-10 h-56 w-40 md:-bottom-20 md:-left-24 md:h-80 md:w-56"
          outfit="professional"
          autoWave
          pokeable
          label="Manan as a wolf in a black blazer, white shirt and black tie"
        />
      </motion.div>
    </section>
  );
}
