import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Achievements from "@/components/professional/Achievements";
import ProHero from "@/components/professional/ProHero";
import SkillsEdu from "@/components/professional/SkillsEdu";
import Timeline from "@/components/professional/Timeline";
import Work from "@/components/professional/Work";
import { meta } from "@/lib/copy";

export const metadata: Metadata = {
  title: meta.professional.title,
  description: meta.professional.description,
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
