"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/motion/FadeIn";
import SectionHeading from "@/components/motion/SectionHeading";
import TiltCard from "@/components/motion/TiltCard";
import { certifications, education, skills } from "@/lib/content";
import { headings } from "@/lib/copy";

export default function SkillsEdu() {
  return (
    <>
      <section id="skills" className="px-5 py-24 md:px-16">
        <SectionHeading {...headings.skills} className="mb-12" />
        <div className="grid gap-4 md:grid-cols-2">
          {skills.map((s, i) => (
            <FadeIn key={s.group} delay={(i % 2) * 0.08} className="h-full">
              <TiltCard max={5} className="h-full p-6">
                <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-accent">{s.group}</h3>
                <motion.ul
                  className="flex flex-wrap gap-2"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ staggerChildren: 0.04 }}
                >
                  {s.items.map((item) => (
                    <motion.li
                      key={item}
                      variants={{ hidden: { opacity: 0, y: 10, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1 } }}
                      whileHover={{ y: -3 }}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white/85 transition-colors hover:border-accent/60 hover:text-accent"
                    >
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              </TiltCard>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="education" className="px-5 py-24 md:px-16">
        <SectionHeading {...headings.education} className="mb-12" />
        <div className="grid gap-4 md:grid-cols-2">
          {education.map((e, i) => (
            <FadeIn key={e.school} delay={i * 0.1} className="h-full">
              <TiltCard max={6} className="h-full p-6 md:p-8">
                <span className="text-4xl" aria-hidden>
                  🎓
                </span>
                <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-white/50">
                  {e.dates} · {e.place}
                </p>
                <h3 className="mt-2 font-display text-3xl md:text-4xl">{e.school}</h3>
                <p className="mt-1 text-white/70">{e.degree}</p>
              </TiltCard>
            </FadeIn>
          ))}
        </div>
      </section>

      {certifications.length > 0 && (
        <section id="certifications" className="px-5 py-24 md:px-16">
          <SectionHeading {...headings.certifications} className="mb-12" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((c, i) => (
              <FadeIn key={c.name} delay={(i % 3) * 0.08} className="h-full">
                <TiltCard max={6} className="h-full p-6">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">
                    {c.issuer} · {c.year}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{c.name}</h3>
                  {c.href && (
                    <a href={c.href} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-accent hover:underline">
                      View credential →
                    </a>
                  )}
                </TiltCard>
              </FadeIn>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
