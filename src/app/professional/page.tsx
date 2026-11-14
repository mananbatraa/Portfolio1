import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Achievements from "@/components/professional/Achievements";
import ProHero from "@/components/professional/ProHero";
import SkillsEdu from "@/components/professional/SkillsEdu";
import Timeline from "@/components/professional/Timeline";
import Work from "@/components/professional/Work";

export const metadata: Metadata = {
  title: "Manan Batra · Professional",
  description: "Experience, achievements, projects, skills and education of Manan Batra, AI software engineer.",
};

export default function ProfessionalPage() {
  return (
    <PageShell side="professional" accent="62 230 255" next={{ label: "MEET THE PERSON", href: "/personal", line: "The personal side" }}>
      <ProHero />
      <Achievements />
      <Timeline />
      <Work />
      <SkillsEdu />
    </PageShell>
  );
}
