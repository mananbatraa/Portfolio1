import RevealText from "@/components/RevealText";
import Section from "@/components/Section";
import { research } from "@/lib/content";

export default function Research() {
  return (
    <Section id="research" index={5} kicker="Down to the silicon" span={6}>
      <RevealText text="MODELS THAT MATTER" className="mb-6 font-display text-5xl md:text-7xl" />
      <h3 className="text-2xl text-white md:text-3xl">{research.title}</h3>
      <p className="mt-4 max-w-2xl text-white/70">{research.summary}</p>
      <dl className="mt-10 grid max-w-3xl grid-cols-3 gap-6">
        {research.stats.map((s) => (
          <div key={s.label} className="border-l border-accent/40 pl-4">
            <dt className="text-xs uppercase tracking-widest text-white/50">{s.label}</dt>
            <dd className="font-display text-4xl text-accent md:text-6xl">{s.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
