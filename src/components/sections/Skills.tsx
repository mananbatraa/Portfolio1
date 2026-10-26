import RevealText from "@/components/RevealText";
import Section from "@/components/Section";
import SheenCard from "@/components/SheenCard";
import { skills } from "@/lib/content";

export default function Skills() {
  return (
    <Section id="skills" index={2} kicker="Built from parts" span={6}>
      <RevealText text="EVERY LAYER, BY HAND" className="mb-10 font-display text-5xl md:text-7xl" />
      <div className="grid gap-4 md:grid-cols-2 lg:max-w-5xl">
        {skills.map((s) => (
          <SheenCard key={s.group}>
            <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-accent">{s.group}</h3>
            <ul className="flex flex-wrap gap-2">
              {s.items.map((item) => (
                <li key={item} className="rounded-md border border-white/10 px-2.5 py-1 text-sm text-white/80">
                  {item}
                </li>
              ))}
            </ul>
          </SheenCard>
        ))}
      </div>
    </Section>
  );
}
