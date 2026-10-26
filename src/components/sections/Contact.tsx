import RevealText from "@/components/RevealText";
import Section from "@/components/Section";
import { education, profile } from "@/lib/content";

export default function Contact() {
  const links = [
    ["Email", `mailto:${profile.email}`],
    ["GitHub", profile.github],
    ["LinkedIn", profile.linkedin],
    ["Resume", profile.resume],
  ].filter(([, href]) => href);

  return (
    <Section id="contact" index={6} kicker="Let's build" span={6} className="items-center text-center">
      <RevealText text="LET'S BUILD SOMETHING" className="justify-center font-display text-6xl md:text-9xl" />
      <a
        href={`mailto:${profile.email}`}
        className="mt-10 rounded-full bg-accent px-8 py-4 text-lg font-semibold text-ground transition hover:shadow-[0_0_40px_rgb(var(--accent)/0.6)]"
      >
        {profile.email}
      </a>
      <ul className="mt-8 flex gap-6 text-sm text-white/60">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noreferrer" className="hover:text-accent">
              {label}
            </a>
          </li>
        ))}
      </ul>
      <ul className="mt-16 space-y-1 text-xs text-white/40">
        {education.map((e) => (
          <li key={e.school}>
            {e.degree}, {e.school} · {e.dates}
          </li>
        ))}
      </ul>
    </Section>
  );
}
