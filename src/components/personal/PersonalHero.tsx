"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import RevealText from "@/components/RevealText";
import WolfMascot from "@/components/mascot/WolfMascot";
import { about } from "@/lib/personal";

export default function PersonalHero() {
  const reduce = useReducedMotion();
  const bounds = useRef<HTMLDivElement>(null);

  return (
    <section ref={bounds} className="relative flex min-h-screen flex-col justify-center gap-12 px-5 pb-16 pt-28 md:flex-row md:items-center md:px-16">
      <div className="md:w-3/5">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-accent">The person behind the code</p>
        <RevealText as="h1" text={about.hello.toUpperCase()} className="font-display text-[16vw] leading-[0.88] md:text-[8.5vw]" />
        <motion.p
          className="mt-8 max-w-xl text-lg text-white/75 md:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {about.bio}
        </motion.p>
        <motion.ul
          className="mt-8 flex flex-wrap gap-2"
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.08, delayChildren: 0.8 }}
        >
          {about.tags.map((tag) => (
            <motion.li
              key={tag}
              variants={{ hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1 } }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent"
            >
              {tag}
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* A polaroid you can toss around, with wolf-Manan in his hoodie beside it. */}
      <div className="relative flex justify-center pt-4 md:w-2/5 md:pt-0">
        <motion.div
          drag={!reduce}
          dragConstraints={bounds}
          dragElastic={0.2}
          whileDrag={{ scale: 1.05, rotate: 0, cursor: "grabbing" }}
          initial={{ opacity: 0, rotate: 18, y: 80 }}
          animate={{ opacity: 1, rotate: -5, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 90, damping: 14 }}
          className="relative w-64 cursor-grab touch-none rounded-sm bg-[#f4f1ea] p-3 pb-14 shadow-2xl shadow-black/60 md:w-80"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-accent/80 via-fuchsia-500/60 to-indigo-600/70">
            {about.photo ? (
              <Image src={about.photo} alt="Manan" fill sizes="320px" className="object-cover" draggable={false} />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-8xl text-white/90">MB</div>
            )}
          </div>
          <p className="absolute inset-x-0 bottom-4 text-center font-[cursive] text-lg text-neutral-700">that&apos;s me ✌️</p>
          <span className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-2 bg-white/50 backdrop-blur-sm" />
        </motion.div>
        <WolfMascot
          className="absolute -bottom-16 right-0 z-10 h-56 w-40 md:-bottom-20 md:-right-10 md:h-80 md:w-56"
          outfit="personal"
          rim="#ff8060"
          autoWave
          pokeable
          label="Manan as a wolf in a black MB. hoodie, goggles and Converse"
        />
      </div>
      <p className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 font-mono text-xs uppercase tracking-[0.3em] text-white/40 md:block">
        Drag the photo · scroll for more ↓
      </p>
    </section>
  );
}
