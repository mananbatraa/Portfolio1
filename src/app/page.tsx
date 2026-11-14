import Intro from "@/components/Intro";

// There is no home page: the site opens on the name intro, then wolf-Manan asks whether
// you're here for the personal side or the professional side and takes you there.
// (The old home film, LaptopStage and sections/*, is kept in the repo but no longer routed.)
export default function Landing() {
  return (
    <Intro>
      <main className="relative min-h-screen overflow-hidden bg-ground">
        <div aria-hidden className="absolute left-1/2 top-1/3 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[140px]" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />
        <h1 className="sr-only">Manan Batra: choose the personal or professional side</h1>
      </main>
    </Intro>
  );
}
