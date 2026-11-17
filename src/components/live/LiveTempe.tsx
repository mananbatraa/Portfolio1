"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import FadeIn from "@/components/motion/FadeIn";
import { ARRIVED_IN_TEMPE, MOOD_LINE, TEMPE, TEMPE_TZ, cachedJson, tempeClock, tempeMood, tempeParts, useNow } from "@/lib/live";

type MeteoResponse = {
  current: { temperature_2m: number; weather_code: number; is_day: number };
  daily: { sunrise: string[]; sunset: string[] };
};
type Weather = { temp: number; code: number; isDay: boolean; sunrise: string; sunset: string };

// WMO weather codes from Open-Meteo, grouped into something a person would say.
function describe(code: number, isDay: boolean) {
  if (code === 0) return isDay ? ["☀️", "clear and sunny"] : ["🌙", "clear skies"];
  if (code <= 2) return isDay ? ["🌤️", "mostly sunny"] : ["🌙", "a few clouds"];
  if (code === 3) return ["☁️", "overcast"];
  if (code <= 48) return ["🌫️", "foggy"];
  if (code <= 67 || (code >= 80 && code <= 82)) return ["🌧️", "raining"];
  if (code <= 77 || code === 85 || code === 86) return ["❄️", "snowing (rare!)"];
  return ["⛈️", "stormy"];
}

// Sky colours for each part of the day, top to bottom.
function sky(hour: number) {
  if (hour < 5 || hour >= 21) return ["#05060f", "#151a3a"];
  if (hour < 7) return ["#2b2a5c", "#f2937a"];
  if (hour < 17) return ["#2f7ad6", "#9fd4ff"];
  if (hour < 19) return ["#5b3b8c", "#ff9a5c"];
  return ["#151a3a", "#4b3a78"];
}

function useTempeWeather() {
  const [w, setW] = useState<Weather | null>(null);
  useEffect(() => {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${TEMPE.lat}&longitude=${TEMPE.lon}` +
      `&current=temperature_2m,weather_code,is_day&daily=sunrise,sunset&forecast_days=1&timezone=${encodeURIComponent(TEMPE_TZ)}`;
    cachedJson<MeteoResponse>(url, 15 * 60 * 1000)
      .then((d) =>
        setW({
          temp: Math.round(d.current.temperature_2m),
          code: d.current.weather_code,
          isDay: d.current.is_day === 1,
          sunrise: d.daily.sunrise[0],
          sunset: d.daily.sunset[0],
        }),
      )
      .catch(() => setW(null));
  }, []);
  return w;
}

function duration(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { d, hms: `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}` };
}

// A live window into Tempe: the clock, the sky, the weather and how long Manan has lived there.
export default function LiveTempe() {
  const now = useNow(1000);
  const weather = useTempeWeather();
  const [unit, setUnit] = useState<"C" | "F">("F");

  const hour = now ? tempeParts(now).hour : 12;
  const [top, bottom] = sky(hour);
  const mood = tempeMood(hour);
  const night = hour < 6 || hour >= 19;
  const since = now ? duration(now.getTime() - new Date(ARRIVED_IN_TEMPE).getTime()) : null;
  const [icon, words] = weather ? describe(weather.code, weather.isDay) : ["", ""];
  const temp = weather ? (unit === "F" ? Math.round(weather.temp * 1.8 + 32) : weather.temp) : null;
  const hhmm = (iso: string) => iso.slice(11, 16);

  return (
    <section id="live" className="px-5 pt-3 md:px-16">
      <FadeIn className="relative overflow-hidden rounded-3xl border border-white/10">
        {/* The sky behind the card follows the real time in Tempe. */}
        <div aria-hidden className="absolute inset-0 transition-[background] duration-[2000ms]" style={{ background: `linear-gradient(180deg, ${top}, ${bottom})` }} />
        {night && (
          <div aria-hidden className="absolute inset-0 opacity-70 [background-image:radial-gradient(1px_1px_at_10%_20%,white,transparent),radial-gradient(1px_1px_at_30%_60%,white,transparent),radial-gradient(1.5px_1.5px_at_55%_25%,white,transparent),radial-gradient(1px_1px_at_75%_45%,white,transparent),radial-gradient(1px_1px_at_90%_15%,white,transparent),radial-gradient(1px_1px_at_65%_80%,white,transparent)]" />
        )}
        <motion.div
          aria-hidden
          className="absolute right-[8%] top-6 h-14 w-14 rounded-full md:h-20 md:w-20"
          style={{ background: night ? "#f4f1e6" : "#ffd65a", boxShadow: night ? "0 0 40px #f4f1e655" : "0 0 70px #ffcf4a" }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="relative grid gap-6 p-6 md:grid-cols-3 md:p-10">
          <div>
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              Live from Tempe
            </p>
            <p className="mt-3 font-display text-5xl tabular-nums md:text-6xl" suppressHydrationWarning>
              {now ? tempeClock(now, true) : "--:--:--"}
            </p>
            <AnimatePresence mode="wait">
              <motion.p key={mood} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-white/80">
                {MOOD_LINE[mood]}
                {mood === "asleep" ? " 💤" : mood === "late" ? " 🦉" : mood === "working" ? " 💻" : mood === "morning" ? " ☕" : " 🌆"}
              </motion.p>
            </AnimatePresence>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">Weather right now</p>
            {weather ? (
              <>
                <button
                  type="button"
                  onClick={() => setUnit((u) => (u === "F" ? "C" : "F"))}
                  className="mt-3 flex items-baseline gap-3 text-left"
                  aria-label={`Show temperature in ${unit === "F" ? "Celsius" : "Fahrenheit"}`}
                >
                  <span className="text-4xl md:text-5xl">{icon}</span>
                  <span className="font-display text-5xl tabular-nums md:text-6xl">
                    {temp}°<span className="text-2xl text-white/60">{unit}</span>
                  </span>
                </button>
                <p className="mt-2 text-white/80">
                  {words[0].toUpperCase() + words.slice(1)} in Tempe · ☀ {hhmm(weather.sunrise)} · ☾ {hhmm(weather.sunset)}
                </p>
              </>
            ) : (
              <p className="mt-3 text-white/60">Checking the sky…</p>
            )}
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">Calling Tempe home for</p>
            <p className="mt-3 font-display text-5xl tabular-nums md:text-6xl">
              {since ? since.d : "--"}
              <span className="text-2xl text-white/60"> days</span>
            </p>
            <p className="mt-2 font-mono tabular-nums text-white/80">{since ? `+ ${since.hms}` : ""}</p>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
