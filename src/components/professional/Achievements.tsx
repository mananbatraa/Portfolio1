import CountUp from "@/components/motion/CountUp";
import FadeIn from "@/components/motion/FadeIn";
import SectionHeading from "@/components/motion/SectionHeading";
import TiltCard from "@/components/motion/TiltCard";
import { achievements } from "@/lib/content";

export default function Achievements() {
  return (
    <section id="achievements" className="px-5 py-24 md:px-16">
      <SectionHeading kicker="By the numbers" title="RESULTS I SHIPPED" className="mb-12" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a, i) => (
          <FadeIn key={a.label} delay={(i % 3) * 0.08} className="h-full">
            <TiltCard max={6} className="h-full p-6 md:p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">{a.source}</p>
              <CountUp
                value={a.value}
                decimals={a.decimals}
                suffix={a.suffix}
                className="mt-3 block font-display text-6xl text-accent md:text-7xl"
              />
              <p className="mt-2 text-white/75">{a.label}</p>
            </TiltCard>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
