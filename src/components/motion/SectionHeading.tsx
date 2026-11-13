import RevealText from "@/components/RevealText";

// Kicker + big masked headline used by every section on the side pages.
export default function SectionHeading({ kicker, title, className }: { kicker: string; title: string; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-accent">{kicker}</p>
      <RevealText text={title} className="font-display text-5xl leading-[0.95] md:text-7xl" />
    </div>
  );
}
