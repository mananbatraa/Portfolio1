"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import WolfMascot from "@/components/mascot/WolfMascot";
import { wolf } from "@/lib/copy";
import { tours } from "@/lib/tour";

type Page = keyof typeof tours;
type Prefs = { hidden: boolean; muted: boolean };

const PREFS_KEY = "mb-tour";
const RIM: Record<Page, string> = { personal: "#ff8060", professional: "#3ee6ff" };

function readPrefs(): Prefs {
  try {
    const v = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}");
    return { hidden: !!v.hidden, muted: !!v.muted };
  } catch {
    return { hidden: false, muted: false };
  }
}

function useTypewriter(text: string, instant: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (instant) return setCount(text.length);
    setCount(0);
    const id = setInterval(() => setCount((c) => (c >= text.length ? (clearInterval(id), c) : c + 1)), 24);
    return () => clearInterval(id);
  }, [text, instant]);
  return { shown: text.slice(0, count), done: count >= text.length };
}

// Manan's wolf assistant walks alongside the page as you scroll. At each section he crosses to his
// spot, points at it and says a line in a speech bubble. He can be muted or sent away.
export default function TourGuide({ page }: { page: Page }) {
  const stops = tours[page];
  const reduce = !!useReducedMotion();
  const [prefs, setPrefs] = useState<Prefs>({ hidden: false, muted: false });
  const [ready, setReady] = useState(false);
  const [vw, setVw] = useState(0);
  const [active, setActive] = useState(0);
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState(1);
  const [said, setSaid] = useState(-1);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [walkFor, setWalkFor] = useState(1.4);

  useEffect(() => {
    setPrefs(readPrefs());
    const onResize = () => setVw(window.innerWidth);
    onResize();
    setReady(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const savePrefs = (next: Prefs) => {
    setPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {}
  };

  // The stop is whichever section crosses the middle of the screen.
  useEffect(() => {
    const els = stops.map((s) => document.getElementById(s.id));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = els.indexOf(e.target as HTMLElement);
          if (i >= 0) setActive(i);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [stops]);

  const mobile = vw > 0 && vw < 768;
  const W = mobile ? 112 : 180;
  const H = mobile ? 150 : 240;
  const stop = stops[active];
  // On phones he stays in the corner so he never walks over the text.
  const side = mobile ? "left" : stop.side;
  // Leave room on the right for the music button.
  const x = side === "left" ? 8 : vw - W - 84;

  // Start walking whenever his spot changes; he enters from off-screen on arrival.
  const lastX = useRef<number | null>(null);
  useEffect(() => {
    if (!vw) return;
    const from = lastX.current ?? -W - 40;
    if (from !== x && !reduce) {
      setFacing(x > from ? 1 : -1);
      setWalkFor(Math.max(1.1, Math.abs(x - from) / 520));
      setWalking(true);
    }
    lastX.current = x;
  }, [x, vw, W, reduce]);

  // Say the line once he has arrived, then let the bubble go after a while.
  useEffect(() => {
    if (walking || said === active) return;
    setSaid(active);
    setBubbleOpen(true);
  }, [walking, active, said]);
  const speaking = bubbleOpen && !prefs.muted && !walking;
  useEffect(() => {
    if (!speaking) return;
    const t = setTimeout(() => setBubbleOpen(false), 4000 + stop.line.length * 45);
    return () => clearTimeout(t);
  }, [speaking, said, stop.line]);

  const { shown, done } = useTypewriter(speaking ? stop.line : "", reduce);
  const action = walking ? "walk" : speaking && active === 0 ? "wave" : speaking ? "point" : "idle";

  const replay = useCallback(() => {
    if (prefs.muted) return;
    setBubbleOpen(false);
    requestAnimationFrame(() => setBubbleOpen(true));
  }, [prefs.muted]);

  if (!ready || !vw) return null;

  if (prefs.hidden) {
    return (
      <button
        onClick={() => savePrefs({ ...prefs, hidden: false })}
        className="fixed bottom-5 left-4 z-40 rounded-full border border-white/15 bg-ground/80 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-white/80 backdrop-blur-md transition hover:border-accent hover:text-accent"
      >
        🐺 Tour guide
      </button>
    );
  }

  return (
    <motion.div
      className="pointer-events-none fixed bottom-0 left-0 z-40"
      style={{ width: W, height: H }}
      initial={{ x: reduce ? x : -W - 40 }}
      animate={{ x }}
      transition={reduce ? { duration: 0 } : { duration: walkFor, ease: "linear" }}
      onAnimationComplete={() => setWalking(false)}
    >
      <AnimatePresence>
        {speaking && (
          <motion.div
            key={stop.id}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className={`pointer-events-none absolute w-max max-w-[min(280px,70vw)] rounded-xl border-2 border-white/80 bg-ground/95 px-4 py-3 shadow-[0_0_0_3px_rgb(7_7_8),0_12px_40px_rgba(0,0,0,0.6)] ${
              side === "left" ? "left-[88%]" : "right-[88%]"
            }`}
            style={{ bottom: H * (mobile ? 0.7 : 0.42) }}
            role="status"
            aria-live="polite"
          >
            <span className="absolute -top-3 left-3 rounded border-2 border-accent bg-ground px-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
              {wolf.name}
            </span>
            <p className="font-mono text-[13px] leading-relaxed text-white md:text-sm">
              {shown}
              {!done && <span className="ml-0.5 inline-block h-[1em] w-1.5 translate-y-[0.15em] animate-pulse bg-accent" />}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto absolute inset-0" onClick={replay}>
        <WolfMascot
          className="h-full w-full"
          outfit={page}
          rim={RIM[page]}
          action={action}
          talking={speaking && !done}
          pointAt={side === "left" ? 0.7 : -0.7}
          facing={facing}
          pokeable
          label={wolf.label(page)}
        />
      </div>

      <div className={`pointer-events-auto absolute bottom-2 flex gap-1 ${side === "left" ? "left-full -ml-6" : "right-full -mr-6"}`}>
        <button
          onClick={() => savePrefs({ ...prefs, muted: !prefs.muted })}
          aria-label={prefs.muted ? "Let the guide talk" : "Mute the guide"}
          title={prefs.muted ? "Unmute" : "Mute"}
          className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-ground/80 text-xs text-white/70 backdrop-blur-md transition hover:border-accent hover:text-accent"
        >
          {prefs.muted ? "💬" : "🤫"}
        </button>
        <button
          onClick={() => savePrefs({ ...prefs, hidden: true })}
          aria-label="Send the guide away"
          title="Hide"
          className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-ground/80 text-xs text-white/70 backdrop-blur-md transition hover:border-accent hover:text-accent"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}
