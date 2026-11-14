"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useState } from "react";
import FadeIn from "@/components/motion/FadeIn";
import SectionHeading from "@/components/motion/SectionHeading";
import { flight } from "@/lib/personal";
import { cn } from "@/lib/utils";

// WebGL only runs in the browser, and the globe loads once the page is up.
const GlobeScene = dynamic(() => import("@/components/personal/GlobeScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 m-auto aspect-square w-3/4 animate-pulse rounded-full bg-white/[0.04]" />,
});

const ACCENT = "#ff8060";

// Great-circle distance in km.
function km(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
  return Math.round(12742 * Math.asin(Math.sqrt(h)));
}

const legs = flight.slice(1).map((s, i) => km(flight[i], s));
const total = legs.reduce((a, b) => a + b, 0);

// A spinning globe with a plane flying Faridabad → Vellore → Tempe. Click a stop to look at it.
export default function FlightGlobe() {
  const calm = !!useReducedMotion();
  const [focus, setFocus] = useState<number | null>(null);
  const [replay, setReplay] = useState(0);
  const [leg, setLeg] = useState(0);
  const flying = focus === null && !calm;

  return (
    <section id="flight" className="px-5 py-28 md:px-16">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div>
          <SectionHeading kicker="Flight log" title="FARIDABAD TO TEMPE" className="mb-6" />
          <p className="max-w-md text-white/70">
            Two flights, three homes and about <span className="font-semibold text-white">{total.toLocaleString("en-US")} km</span> of sky. Tap a stop to look at
            it, or let the plane fly the route.
          </p>
          <ol className="mt-8 space-y-3">
            {flight.map((s, i) => {
              const active = focus === i || (flying && (i === leg || i === leg + 1));
              return (
                <FadeIn key={s.city} delay={i * 0.08}>
                  <button
                    onClick={() => setFocus(focus === i ? null : i)}
                    aria-pressed={focus === i}
                    className={cn(
                      "group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors duration-300",
                      active ? "border-accent/60 bg-accent/10" : "border-white/10 bg-white/[0.03] hover:border-white/30",
                    )}
                  >
                    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full border font-mono text-sm", active ? "border-accent text-accent" : "border-white/20 text-white/60")}>
                      0{i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-display text-2xl tracking-wide">{s.city}</span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">{s.years}</span>
                      </span>
                      <span className="block text-sm text-white/60">{s.note}</span>
                    </span>
                  </button>
                  {i < legs.length && (
                    <p className="ml-9 border-l border-dashed border-white/15 py-2 pl-8 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
                      ✈ {legs[i].toLocaleString("en-US")} km
                    </p>
                  )}
                </FadeIn>
              );
            })}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setFocus(null);
                setReplay((r) => r + 1);
              }}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ground transition hover:shadow-[0_0_24px_rgb(var(--accent)/0.6)]"
            >
              {calm ? "Show the route" : "Replay the flight ✈"}
            </button>
          </div>
        </div>

        <FadeIn className="relative mx-auto aspect-square w-full max-w-[640px]">
          <GlobeScene stops={flight} accent={ACCENT} focus={focus} replay={replay} calm={calm} onLeg={setLeg} />
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
          <AnimatePresence mode="wait">
            {flying && (
              <motion.p
                key={leg}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="whitespace-nowrap rounded-full border border-white/10 bg-ground/80 px-4 py-1.5 font-mono text-xs text-white/80 backdrop-blur-md"
              >
                Now flying: {flight[leg].city} → {flight[leg + 1]?.city}
              </motion.p>
            )}
          </AnimatePresence>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
