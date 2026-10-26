"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const FROM = "MANAN BATRA";
const TO = "PORTFOLIO";
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/";
const SEEN_KEY = "intro-seen";

type Phase = "name" | "scramble" | "word" | "reveal" | "done";

const IntroContext = createContext(true);

// True once the intro has lifted, so content underneath can start its own entrances.
export const useIntroDone = () => useContext(IntroContext);

// Plays once per session: the name rises in, scrambles into "PORTFOLIO",
// then a curtain lifts to reveal the page. The laptop frames buffer underneath.
export default function Intro({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("name");
  const [text, setText] = useState(FROM);

  useEffect(() => {
    let skip = false;
    try {
      skip = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (skip || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return;
    }
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);
    const timers = [
      setTimeout(() => setPhase("scramble"), 1300),
      setTimeout(() => setPhase("word"), 2400),
      setTimeout(() => setPhase("reveal"), 3200),
      setTimeout(() => {
        setPhase("done");
        document.documentElement.style.overflow = "";
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {}
      }, 4100),
    ];
    return () => {
      timers.forEach(clearTimeout);
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Letters cycle through random glyphs and lock into the target left to right.
  useEffect(() => {
    if (phase !== "scramble") return;
    const start = performance.now();
    const duration = 1000;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const len = Math.round(FROM.length + (TO.length - FROM.length) * t);
      const locked = Math.floor(t * TO.length);
      let out = "";
      for (let i = 0; i < len; i++) {
        out += i < locked ? TO[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setText(out);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setText(TO);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const done = phase === "done";

  return (
    <IntroContext.Provider value={done}>
      {children}
      <AnimatePresence>
        {phase !== "done" && (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ground"
            initial={{ clipPath: "inset(0 0 0 0)" }}
            animate={{ clipPath: phase === "reveal" ? "inset(0 0 100% 0)" : "inset(0 0 0 0)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
            aria-hidden
          >
            <div className="overflow-hidden px-4">
              <motion.p
                className="whitespace-nowrap text-center font-display text-[15vw] leading-none md:text-[10vw]"
                initial={{ y: "110%" }}
                animate={{
                  y: "0%",
                  letterSpacing: phase === "word" || phase === "reveal" ? "0.08em" : "0em",
                  color: phase === "name" ? "#ffffff" : "rgb(62 230 255)",
                  scale: phase === "reveal" ? 0.9 : 1,
                }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {text}
              </motion.p>
            </div>
            <motion.div
              className="absolute bottom-10 h-px w-40 origin-left bg-accent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}
