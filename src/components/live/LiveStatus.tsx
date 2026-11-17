"use client";

import { hints } from "@/lib/copy";
import { MOOD_LINE, tempeClock, tempeMood, tempeParts, useNow } from "@/lib/live";

// The hero pill: open to roles, plus whether Manan is likely around right now in Tempe.
export default function LiveStatus({ location }: { location: string }) {
  const now = useNow(30_000);
  const mood = now ? tempeMood(tempeParts(now).hour) : null;
  const online = mood === "working" || mood === "morning" || mood === "evening";
  return (
    <span className="mb-6 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">
      <span className={`h-2 w-2 rounded-full ${online ? "animate-pulse bg-emerald-400" : mood ? "bg-amber-400" : "bg-accent"}`} />
      {hints.openToWork} · {location}
      {now && mood && (
        <span className="text-white/60" title={MOOD_LINE[mood]}>
          · {online ? "Online now" : "Away"} · {tempeClock(now)} there
        </span>
      )}
    </span>
  );
}
