"use client";

import { useEffect, useState } from "react";

// Shared helpers for the live widgets. Everything here runs in the visitor's browser
// against free, keyless APIs, so the site needs no server or secrets.

// Arizona does not observe daylight saving, so Tempe is always UTC-7.
export const TEMPE_TZ = "America/Phoenix";
export const TEMPE = { lat: 33.4255, lon: -111.94 };

// CONFIRM: the day you landed in Tempe. Drives the "in Tempe for" ticker.
export const ARRIVED_IN_TEMPE = "2025-08-10T12:00:00-07:00";

export const GITHUB_USER = "mananbatraa";

/** The current time, updated every `ms`. Null on the server and first render, so nothing mismatches on hydration. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/** Hour (0-23) and minute in Tempe for a given instant. */
export function tempeParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TEMPE_TZ, hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { hour: get("hour") % 24, minute: get("minute") };
}

export function tempeClock(d: Date, seconds = false) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TEMPE_TZ,
    hour: "numeric",
    minute: "2-digit",
    second: seconds ? "2-digit" : undefined,
  }).format(d);
}

export type Mood = "asleep" | "morning" | "working" | "evening" | "late";

/** What Manan is probably up to at this hour in Tempe. */
export function tempeMood(hour: number): Mood {
  if (hour >= 3 && hour < 9) return "asleep";
  if (hour < 3) return "late";
  if (hour < 10) return "morning";
  if (hour < 18) return "working";
  return "evening";
}

export const MOOD_LINE: Record<Mood, string> = {
  asleep: "Manan is probably asleep",
  late: "Manan is probably still up",
  morning: "Manan is grabbing coffee",
  working: "Manan is probably heads-down coding",
  evening: "Manan is winding down",
};

/** "3h ago", "2d ago" and so on. */
export function ago(from: Date, now: Date) {
  const s = Math.max(0, Math.floor((now.getTime() - from.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Fetch JSON once per tab session, so reloads don't burn GitHub's 60 requests/hour limit. */
export async function cachedJson<T>(url: string, maxAgeMs: number): Promise<T> {
  const key = `live:${url}`;
  try {
    const hit = sessionStorage.getItem(key);
    if (hit) {
      const { at, data } = JSON.parse(hit);
      if (Date.now() - at < maxAgeMs) return data as T;
    }
  } catch {}
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status}`);
  const data = (await res.json()) as T;
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {}
  return data;
}
