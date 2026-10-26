import RevealText from "@/components/RevealText";
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
      <p className="mt-16 font-mono text-xs uppercase tracking-[0.3em] text-white/40">Scroll to take it apart ↓</p>
    </Section>
  );
}
