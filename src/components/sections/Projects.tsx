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
          <SheenCard key={p.name} className={i === 0 || p.wide ? "md:col-span-2" : ""}>
            <h3 className="font-display text-3xl">{p.name}</h3>
            {p.note && <p className="mt-2 font-mono text-xs text-accent/80">{p.note}</p>}
            <p className="mt-3 text-white/70">{p.summary}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {p.stack.map((t) => (
                <li key={t} className="font-mono text-xs text-accent/80">
                  #{t}
                </li>
              ))}
            </ul>
            {(p.href || p.demo !== undefined) && (
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {p.href && (
                  <a href={p.href} target="_blank" rel="noreferrer" className="text-white underline-offset-4 hover:underline">
                    View on GitHub →
                  </a>
                )}
                {p.demo ? (
                  <a href={p.demo} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">
                    Live demo →
                  </a>
                ) : p.demo !== undefined ? (
                  <span className="font-mono text-xs text-white/40">Live demo soon</span>
                ) : null}
              </div>
            )}
          </SheenCard>
        ))}
      </div>
    </Section>
  );
}
