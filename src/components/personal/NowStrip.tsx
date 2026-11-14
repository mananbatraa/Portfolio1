import FadeIn from "@/components/motion/FadeIn";
import { nowFacts } from "@/lib/personal";

export default function NowStrip() {
  return (
    <section id="now" className="px-5 md:px-16">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {nowFacts.map((f, i) => (
          <FadeIn key={f.label} delay={i * 0.08} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/45">{f.label}</p>
            <p className="mt-2 text-base font-medium md:text-lg">{f.value}</p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
