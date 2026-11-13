"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import WolfMascot from "@/components/mascot/WolfMascot";

type Path = "personal" | "professional" | "explore";

const CHOICES: { id: Path; key: string; label: string; hint: string; href?: string; reply: string }[] = [
  {
    id: "professional",
    key: "1",
    label: "💼 Professional",
    hint: "I'm hiring, or I want to see the work",
    href: "/professional",
    reply: "A recruiter! Hold on, let me suit up. Experience, results, the lot.",
  },
  {
    id: "personal",
    key: "2",
    label: "🎧 Personal",
    hint: "I want to get to know Manan",
    href: "/personal",
    reply: "Ooh, the good stuff. Music, cities, friends. Follow me!",
  },
  {
    id: "explore",
    key: "3",
    label: "🧭 Just exploring",
    hint: "Show me the whole place",
    reply: "A wanderer. Scroll down and watch the laptop come apart.",
  },
];

const STORAGE_KEY = "mb-quest-path";

function readLast(): Path | null {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    return v === "personal" || v === "professional" || v === "explore" ? v : null;
  } catch {
    return null;
  }
}

// Types a line out one character at a time. Calling `finish` shows it in full at once.
function useTypewriter(text: string, speed = 28, instant = false) {
  const [count, setCount] = useState(instant ? text.length : 0);
  useEffect(() => {
    if (instant) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, instant]);
  return { shown: text.slice(0, count), done: count >= text.length, finish: () => setCount(text.length) };
}

// The story-mode scene after the intro: Manan, as a 3D wolf, walks in, talks in an RPG dialogue box,
// and asks the visitor why they're here. The answer routes to that side of the site.
export default function Quest({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const reduce = !!useReducedMotion();
  const [last] = useState(readLast);
  const lastLabel = CHOICES.find((c) => c.id === last)?.label.replace(/^\S+\s/, "");

  const lines = useMemo(
    () =>
      last
        ? [
            "Welcome back, traveller!",
            `Last time you took the ${lastLabel} path. Where are we headed now?`,
          ]
        : [
            "Oh! A visitor. Welcome to my corner of the internet.",
            "I'm Manan. Well, the wolf version: hoodie up, goggles on.",
            "So, traveller... what brings you here today?",
          ],
    [last, lastLabel],
  );

  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<(typeof CHOICES)[number] | null>(null);
  const [focus, setFocus] = useState(() => Math.max(0, CHOICES.findIndex((c) => c.id === last)));
  const text = picked ? picked.reply : lines[step];
  const { shown, done, finish } = useTypewriter(text, 26, reduce);
  const asking = !picked && step === lines.length - 1 && done;

  // The wolf previews the outfit for whichever side is in focus, and points at it.
  const outfit = (picked ?? (asking ? CHOICES[focus] : null))?.id === "professional" ? "professional" : "personal";
  const wolfAction = asking ? "point" : (step === 0 && !picked) || picked?.id === "explore" ? "wave" : "idle";
  const pointAt = [-0.8, 0, 0.8][focus] ?? 0;

  // Lock the page behind the scene.
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  const choose = useCallback(
    (c: (typeof CHOICES)[number]) => {
      if (picked) return;
      try {
        sessionStorage.setItem(STORAGE_KEY, c.id);
      } catch {}
      setPicked(c);
    },
    [picked],
  );

  // After the wolf answers, head to the chosen side.
  useEffect(() => {
    if (!picked || !done) return;
    const t = setTimeout(() => {
      onClose();
      if (picked.href) router.push(picked.href);
    }, 1100);
    return () => clearTimeout(t);
  }, [picked, done, onClose, router]);

  const advance = useCallback(() => {
    if (!done) return finish();
    if (!picked && step < lines.length - 1) setStep((s) => s + 1);
  }, [done, finish, picked, step, lines.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (asking) {
        const byKey = CHOICES.find((c) => c.key === e.key);
        if (byKey) return choose(byKey);
        if (e.key === "ArrowDown" || e.key === "ArrowRight") return setFocus((f) => (f + 1) % CHOICES.length);
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") return setFocus((f) => (f - 1 + CHOICES.length) % CHOICES.length);
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          return choose(CHOICES[focus]);
        }
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [asking, advance, choose, focus, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex flex-col items-center justify-end overflow-hidden bg-ground/85 px-4 pb-6 backdrop-blur-sm md:pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome: choose where to go"
      onClick={advance}
    >
      {/* Scanlines and a vignette for the game-screen feel. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_3px)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7))]" />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 rounded-full border border-white/15 bg-ground/60 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-white/70 transition hover:border-accent hover:text-accent md:right-8 md:top-8"
      >
        Skip ›
      </button>

      <motion.div
        className="relative mb-8 flex flex-1 items-end justify-center"
        initial={reduce ? false : { y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.15 }}
      >
        <WolfMascot
          className="h-72 w-56 md:h-[26rem] md:w-80"
          outfit={outfit}
          action={wolfAction}
          talking={!done}
          pointAt={pointAt}
          label="Manan as a wolf in a hoodie and goggles"
        />
        <AnimatePresence>
          {picked && (
            <motion.span
              className="absolute -right-6 top-0 text-4xl"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
              aria-hidden
            >
              ✨
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="relative w-full max-w-3xl"
        initial={reduce ? false : { y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="absolute -top-4 left-6 z-10 rounded-md border-2 border-accent bg-ground px-3 py-0.5 font-mono text-xs font-bold uppercase tracking-[0.25em] text-accent">
          Manan
        </span>
        <div className="relative rounded-xl border-2 border-white/80 bg-ground/95 p-6 pt-7 shadow-[0_0_0_4px_rgb(7_7_8),0_0_0_6px_rgba(255,255,255,0.25),0_20px_60px_rgba(0,0,0,0.6)] md:p-8 md:pt-9">
          <p className="min-h-[3.5em] font-mono text-base leading-relaxed text-white md:text-xl" aria-live="polite">
            {shown}
            {!done && <span className="ml-0.5 inline-block h-[1em] w-2 translate-y-[0.15em] animate-pulse bg-accent" />}
          </p>

          <AnimatePresence mode="wait">
            {asking ? (
              <motion.ul
                key="choices"
                className="mt-5 grid gap-2 md:grid-cols-3"
                initial="hidden"
                animate="show"
                transition={{ staggerChildren: 0.08 }}
              >
                {CHOICES.map((c, i) => (
                  <motion.li key={c.id} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        choose(c);
                      }}
                      onMouseEnter={() => setFocus(i)}
                      className={`group relative h-full w-full rounded-lg border-2 px-4 py-3 text-left transition ${
                        focus === i ? "border-accent bg-accent/10" : "border-white/15 hover:border-white/40"
                      }`}
                    >
                      <span className="flex items-center gap-2 font-semibold">
                        <span className={`font-mono text-accent transition-opacity ${focus === i ? "opacity-100" : "opacity-0"}`}>▶</span>
                        {c.label}
                      </span>
                      <span className="mt-1 block pl-5 text-sm text-white/60">{c.hint}</span>
                      <span className="absolute right-3 top-3 font-mono text-[10px] text-white/30">{c.key}</span>
                      {last === c.id && (
                        <span className="absolute -top-2.5 right-6 rounded bg-accent px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-ground">
                          last pick
                        </span>
                      )}
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              done &&
              !picked && (
                <motion.p
                  key="next"
                  className="mt-3 text-right font-mono text-xs uppercase tracking-[0.2em] text-white/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  Click or press Enter ▼
                </motion.p>
              )
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
