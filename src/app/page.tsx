import FrameStage from "@/components/FrameStage";
import Nav from "@/components/Nav";
import Contact from "@/components/sections/Contact";
import Experience from "@/components/sections/Experience";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Research from "@/components/sections/Research";
import Skills from "@/components/sections/Skills";
import { HERO_SEGMENTS, LAPTOP_ASSEMBLED, LAPTOP_EXPLODED } from "@/lib/hero-assets";

export default function Home() {
  return (
    <>
      <FrameStage assembled={LAPTOP_ASSEMBLED} exploded={LAPTOP_EXPLODED} segments={HERO_SEGMENTS} dbName="laptop-scroll" />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Skills />
        <Experience />
        <Projects />
        <Research />
        <Contact />
      </main>
    </>
  );
}
