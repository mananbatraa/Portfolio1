"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import FadeIn from "@/components/motion/FadeIn";
import SectionHeading from "@/components/motion/SectionHeading";
import { GITHUB_USER, ago, cachedJson, useNow } from "@/lib/live";

type GhEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    ref?: string;
    ref_type?: string;
    action?: string;
    size?: number;
    commits?: { message: string; sha: string }[];
    pull_request?: { title?: string; number?: number };
  };
};
type GhUser = { public_repos: number; followers: number; created_at: string };

type Item = { id: string; at: Date; icon: string; text: string; repo: string; href: string };

// Turn GitHub's raw events into one readable line each.
function toItem(e: GhEvent): Item | null {
  const repo = e.repo.name.replace(`${GITHUB_USER}/`, "");
  const href = `https://github.com/${e.repo.name}`;
  const base = { id: e.id, at: new Date(e.created_at), repo, href };
  switch (e.type) {
    case "PushEvent": {
      const msg = e.payload.commits?.at(-1)?.message.split("\n")[0];
      const n = e.payload.size ?? e.payload.commits?.length;
      const branch = e.payload.ref?.replace("refs/heads/", "");
      return { ...base, icon: "⬆", text: msg ? `${msg}${n && n > 1 ? ` (+${n - 1} more)` : ""}` : `Pushed to ${branch ?? "a branch"}` };
    }
    case "PullRequestEvent":
      return { ...base, icon: "⤴", text: `${e.payload.action === "closed" ? "Merged/closed" : "Opened"} PR${e.payload.pull_request?.title ? `: ${e.payload.pull_request.title}` : ""}` };
    case "CreateEvent":
      return { ...base, icon: "✦", text: e.payload.ref_type === "repository" ? "Created a new repo" : `Created ${e.payload.ref_type} ${e.payload.ref ?? ""}` };
    case "WatchEvent":
      return { ...base, icon: "★", text: "Starred a repo" };
    case "ForkEvent":
      return { ...base, icon: "⑂", text: "Forked a repo" };
    case "IssuesEvent":
      return { ...base, icon: "◎", text: `${e.payload.action ?? "Updated"} an issue` };
    default:
      return null;
  }
}

// Live activity pulled from GitHub's public API in the visitor's browser. Cached per tab for
// ten minutes, so it stays well inside the 60 requests/hour that GitHub allows without a token.
export default function LiveGitHub() {
  const now = useNow(1000);
  const [events, setEvents] = useState<GhEvent[] | null>(null);
  const [user, setUser] = useState<GhUser | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const ttl = 10 * 60 * 1000;
    cachedJson<GhEvent[]>(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=100`, ttl)
      .then(setEvents)
      .catch(() => setFailed(true));
    cachedJson<GhUser>(`https://api.github.com/users/${GITHUB_USER}`, ttl)
      .then(setUser)
      .catch(() => {});
  }, []);

  const items = useMemo(() => (events ?? []).map(toItem).filter(Boolean).slice(0, 6) as Item[], [events]);
  const lastPush = useMemo(() => {
    const e = (events ?? []).find((x) => x.type === "PushEvent");
    return e ? new Date(e.created_at) : null;
  }, [events]);

  // Events per day over the last four weeks, oldest first.
  const days = useMemo(() => {
    const counts = new Array(28).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const e of events ?? []) {
      const d = new Date(e.created_at);
      d.setHours(0, 0, 0, 0);
      const back = Math.round((today.getTime() - d.getTime()) / 86400000);
      if (back >= 0 && back < 28) counts[27 - back] += e.type === "PushEvent" ? Math.max(1, e.payload.size ?? 1) : 1;
    }
    return counts;
  }, [events]);
  const peak = Math.max(1, ...days);
  const total = days.reduce((a, b) => a + b, 0);
  const activeDays = days.filter(Boolean).length;
  const years = user ? new Date().getFullYear() - new Date(user.created_at).getFullYear() : null;

  return (
    <section id="live" className="px-5 py-24 md:px-16">
      <SectionHeading kicker="Live from GitHub" title="WHAT I'M SHIPPING" className="mb-12" />
      <FadeIn className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md md:p-8 lg:col-span-2">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/50">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Last push
          </p>
          <p className="mt-3 font-display text-6xl tabular-nums text-accent md:text-7xl" suppressHydrationWarning>
            {lastPush && now ? ago(lastPush, now) : failed ? "—" : "…"}
          </p>
          <p className="mt-1 text-white/60">{lastPush ? "and counting" : failed ? "GitHub is taking a break" : "asking GitHub"}</p>

          {/* Four weeks of activity, one bar per day; today is on the right. */}
          <div className="mt-8 flex h-20 items-end gap-[3px]" aria-label={`${total} public actions on GitHub over the last 28 days`}>
            {days.map((c, i) => (
              <motion.span
                key={i}
                className="flex-1 rounded-sm bg-accent"
                initial={{ height: 3 }}
                whileInView={{ height: `${Math.max(4, (c / peak) * 100)}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.02, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ opacity: c ? 0.35 + 0.65 * (c / peak) : 0.12 }}
                title={`${c} on ${new Date(Date.now() - (27 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              />
            ))}
          </div>
          <p className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            <span>4 weeks ago</span>
            <span>today</span>
          </p>

          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
            {[
              ["Active days", events ? `${activeDays}/28` : "…"],
              ["Public repos", user ? user.public_repos : "…"],
              ["On GitHub", years !== null ? `${years || "<1"} yr${years === 1 ? "" : "s"}` : "…"],
            ].map(([k, v]) => (
              <div key={k as string}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{k}</dt>
                <dd className="mt-1 font-display text-2xl tabular-nums md:text-3xl">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md md:p-8 lg:col-span-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/50">Recent activity</p>
            <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
              @{GITHUB_USER} ↗
            </a>
          </div>
          <ul className="mt-4 divide-y divide-white/5">
            <AnimatePresence>
              {items.map((it, i) => (
                <motion.li
                  key={it.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <a href={it.href} target="_blank" rel="noreferrer" className="group flex items-start gap-4 py-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">{it.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-white/90 group-hover:text-accent">{it.text}</span>
                      <span className="font-mono text-xs text-white/40">{it.repo}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-white/40" suppressHydrationWarning>
                      {now ? ago(it.at, now) : ""}
                    </span>
                  </a>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {events && items.length === 0 && <p className="py-6 text-white/50">Quiet week on public repos. The private ones are busy.</p>}
          {!events && !failed && (
            <div className="mt-4 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          )}
          {failed && (
            <p className="py-6 text-white/60">
              Couldn&apos;t reach GitHub just now.{" "}
              <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                See the profile directly ↗
              </a>
            </p>
          )}
        </div>
      </FadeIn>
    </section>
  );
}
