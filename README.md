# Manan Batra · Portfolio

A scroll-driven portfolio. A 3D laptop sits behind the page and comes apart, rebuilds, orbits and zooms as you scroll. Each of the six sections rides one act of that animation. An intro scrambles the name into "PORTFOLIO" on every page load.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion and Three.js (react-three-fiber).

## Run it

```bash
npm install
npm run dev
```

## How the hero works

- `src/components/LaptopStage.tsx` builds the laptop from simple meshes and maps scroll progress onto six acts: deconstruct, reassemble, orbit, bridge, detail (camera push into the keyboard) and reveal.
- `src/lib/hero-assets.ts` holds the act spans. Change a span to make that act longer or shorter.
- The screen is a canvas texture drawn in `makeScreenTexture`. Edit it to change what the laptop shows.
- With `prefers-reduced-motion`, the laptop stays still.

## Content

All text lives in `src/lib/content.ts`. Add your LinkedIn URL, project GitHub links, and a resume PDF path there.

## UI libraries

The plan is to use Vengeance UI as the base and borrow single components from Skiper UI or Animmaster. Install them from your own machine, for example `npx shadcn@latest add @vengeanceui/glass-dock`. `components.json` is already set up for shadcn.
