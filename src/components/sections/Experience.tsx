import RevealText from "@/components/RevealText";
import Section from "@/components/Section";
import SheenCard from "@/components/SheenCard";
import { experience } from "@/lib/content";

export default function Experience() {
  return (
    <Section id="experience" index={3} kicker="Every angle" span={6}>
      <RevealText text="WHERE I'VE SHIPPED" className="mb-10 font-display text-5xl md:text-7xl" />
      <div className="grid gap-4 lg:max-w-6xl lg:grid-cols-3">
        {experience.map((job) => (
          <SheenCard key={job.company}>
            <p className="font-mono text-xs text-white/40">{job.dates}</p>
            <h3 className="mt-2 font-display text-3xl">{job.company}</h3>
            <p className="text-sm text-white/60">
              {job.role} · {job.place}
            </p>
            <p className="mt-5 font-display text-4xl text-accent">{job.stat.value}</p>
            <p className="text-xs uppercase tracking-widest text-white/50">{job.stat.label}</p>
            <ul className="mt-5 space-y-2 text-sm text-white/75">
              {job.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-accent">/</span>
                  {p}
                </li>
              ))}
            </ul>
          </SheenCard>
        ))}
      </div>
    </Section>
  );
}
