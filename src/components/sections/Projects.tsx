import RevealText from "@/components/RevealText";
import Section from "@/components/Section";
import SheenCard from "@/components/SheenCard";
import { projects } from "@/lib/content";

export default function Projects() {
  return (
    <Section id="projects" index={4} kicker="In motion" span={5}>
      <RevealText text="SYSTEMS THAT STREAM" className="mb-10 font-display text-5xl md:text-7xl" />
      <div className="grid gap-4 md:grid-cols-3 lg:max-w-6xl">
        {projects.map((p, i) => (
          <SheenCard key={p.name} className={i === 0 ? "md:col-span-2" : ""}>
            <h3 className="font-display text-3xl">{p.name}</h3>
            <p className="mt-3 text-white/70">{p.summary}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {p.stack.map((t) => (
                <li key={t} className="font-mono text-xs text-accent/80">
                  #{t}
                </li>
              ))}
            </ul>
            {p.href && (
              <a href={p.href} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm text-white underline-offset-4 hover:underline">
                View on GitHub →
              </a>
            )}
          </SheenCard>
        ))}
      </div>
    </Section>
  );
}
