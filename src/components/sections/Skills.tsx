import RevealText from "@/components/RevealText";
import Section from "@/components/Section";
import SheenCard from "@/components/SheenCard";
import LogoSlider from "@/components/ui/logo-slider";
import { skills } from "@/lib/content";

const stack = skills.flatMap((s) => s.items).map((item) => (
  <span key={item} className="whitespace-nowrap font-mono text-sm uppercase tracking-widest text-white/60">
    {item}
  </span>
));

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
      {/* Logos twice so the marquee loops seamlessly. */}
      <LogoSlider
        logos={[...stack, ...stack]}
        speed={50}
        pauseOnHover
        showBlur={false}
        className="mt-10 lg:max-w-5xl [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
      />
    </Section>
  );
}
