import CountUp from "@/components/motion/CountUp";
import FadeIn from "@/components/motion/FadeIn";
import SectionHeading from "@/components/motion/SectionHeading";
import TiltCard from "@/components/motion/TiltCard";
import { projects, research } from "@/lib/content";
import { cn } from "@/lib/utils";
import { headings, hints } from "@/lib/copy";

export default function Work() {
  return (
    <section id="projects" className="px-5 py-24 md:px-16">
      <SectionHeading {...headings.work} className="mb-12" />
      <div className="grid gap-4 md:grid-cols-6">
        {projects.map((p, i) => (
          <FadeIn key={p.name} delay={(i % 3) * 0.08} className={cn("h-full", i < 2 ? "md:col-span-3" : "md:col-span-2")}>
            <TiltCard max={6} className="flex h-full flex-col p-6 md:p-8">
              <div className="flex h-full flex-col">
                <p className="font-mono text-xs text-white/40">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-display text-4xl">{p.name}</h3>
                <p className="mt-3 flex-1 text-white/70">{p.summary}</p>
                <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1">
                  {p.stack.map((t) => (
                    <li key={t} className="font-mono text-xs text-accent/80">
                      #{t}
                    </li>
                  ))}
                </ul>
                {p.href && (
                  <a href={p.href} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm text-white underline-offset-4 hover:text-accent hover:underline">
                    {hints.viewCode}
                  </a>
                )}
              </div>
            </TiltCard>
          </FadeIn>
        ))}
        <FadeIn className="md:col-span-6">
          <TiltCard max={3} className="p-6 md:p-10">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Research</p>
                <h3 className="mt-2 font-display text-4xl md:text-5xl">{research.title}</h3>
                <p className="mt-3 text-white/70">{research.summary}</p>
                <p className="mt-4 font-mono text-xs text-white/50">{research.stack.join(" · ")}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 p-4">
                  <CountUp value={93.83} decimals={2} suffix="%" className="block font-display text-3xl text-accent md:text-4xl" />
                  <p className="text-xs uppercase tracking-widest text-white/50">accuracy</p>
                </div>
                <div className="rounded-xl border border-white/10 p-4">
                  <CountUp value={0.9619} decimals={4} className="block font-display text-3xl text-accent md:text-4xl" />
                  <p className="text-xs uppercase tracking-widest text-white/50">ROC-AUC</p>
                </div>
                <div className="rounded-xl border border-white/10 p-4">
                  <CountUp value={4} className="block font-display text-3xl text-accent md:text-4xl" />
                  <p className="text-xs uppercase tracking-widest text-white/50">model families</p>
                </div>
              </div>
            </div>
          </TiltCard>
        </FadeIn>
      </div>
    </section>
  );
}
