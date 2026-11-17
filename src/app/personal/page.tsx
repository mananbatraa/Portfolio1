import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import FlightGlobe from "@/components/personal/FlightGlobe";
import Interests from "@/components/personal/Interests";
import Journey from "@/components/personal/Journey";
import Memories from "@/components/personal/Memories";
import NowStrip from "@/components/personal/NowStrip";
import PersonalHero from "@/components/personal/PersonalHero";
import { meta } from "@/lib/copy";

export const metadata: Metadata = {
  title: meta.personal.title,
  description: meta.personal.description,
};

export default function PersonalPage() {
  return (
    <PageShell side="personal" accent="255 128 96" next={{ label: "SEE THE WORK", href: "/professional", line: "The professional side" }}>
      <PersonalHero />
      <NowStrip />
      <Interests />
      <FlightGlobe />
      <Journey />
      <Memories />
    </PageShell>
  );
}
