import Dock from "@/components/Dock";
import Intro from "@/components/Intro";
import LaptopStageLoader from "@/components/LaptopStageLoader";
import Nav from "@/components/Nav";
import Contact from "@/components/sections/Contact";
import Experience from "@/components/sections/Experience";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Research from "@/components/sections/Research";
import Skills from "@/components/sections/Skills";

export default function Home() {
  return (
    <Intro>
      <LaptopStageLoader />
      <Nav />
      <Dock />
      <main className="relative z-10">
        <Hero />
        <Skills />
        <Experience />
        <Projects />
        <Research />
        <Contact />
      </main>
    </Intro>
  );
}
