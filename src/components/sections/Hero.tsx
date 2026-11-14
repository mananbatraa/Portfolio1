import RevealText from "@/components/RevealText";
import Link from "next/link";
import Section from "@/components/Section";
import FlipText from "@/components/ui/flip-text";
import { profile } from "@/lib/content";

export default function Hero() {
  return (
    <Section id="top" index={1} kicker="Open it up" span={6} className="items-start">
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        Open to full-time roles · {profile.location}
      </span>
      <RevealText as="h1" text={profile.name.toUpperCase()} className="font-display text-[18vw] leading-[0.85] md:text-[11vw]" />
      <FlipText duration={3} className="mt-6 font-display text-3xl tracking-wide text-accent md:text-5xl">
        {profile.role.toUpperCase()}
      </FlipText>
      <p className="mt-4 max-w-xl text-lg text-white/70 md:text-2xl">{profile.tagline}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/personal" className="rounded-full border border-white/15 bg-ground/60 px-5 py-2.5 text-sm backdrop-blur-md transition hover:border-[#ff8060] hover:text-[#ff8060]">
          Meet the person →
        </Link>
        <Link href="/professional" className="rounded-full border border-white/15 bg-ground/60 px-5 py-2.5 text-sm backdrop-blur-md transition hover:border-accent hover:text-accent">
          See the work →
        </Link>
      </div>
      <p className="mt-12 font-mono text-xs uppercase tracking-[0.3em] text-white/40">Scroll to take it apart ↓</p>
    </Section>
  );
}
