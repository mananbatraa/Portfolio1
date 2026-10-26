# Manan Batra · Portfolio

A scroll-cinema portfolio. A laptop sits behind the page and comes apart, rebuilds, orbits and zooms as you scroll. Each of the six sections rides one act of that film.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS and Framer Motion.

## Run it

```bash
npm install
npm run dev
```

## How the hero works

- `src/components/FrameStage.tsx` is the scroll engine. On first visit it plays each clip once, captures every frame as WebP, and caches the frames in IndexedDB. After that, scrolling just paints the right frame to a canvas.
- `src/lib/hero-assets.ts` holds every media URL and the six-act segment plan. Empty URLs are fine: until the clips exist, the engine cross-fades between the two stills in `public/hero/`.
- With `prefers-reduced-motion`, only the still is shown.

## Adding the real footage

1. Generate the stills and clips with the prompts in the plan doc (Higgsfield: Nano Banana + Kling 3.0), then upscale the clips with Topaz.
2. Replace `public/hero/assembled.svg` and `exploded.svg` with the real stills, or point the constants at a CDN.
3. Fill in `DECON`, `ORBIT`, `BRIDGE`, `MACRO` (1080p) and their `_4K` versions in `src/lib/hero-assets.ts`. The clips must be served with CORS enabled so the canvas can read them.
4. Re-sample `--accent` in `src/app/globals.css` from the footage's glow.

## Content

All text lives in `src/lib/content.ts`. Add your LinkedIn URL, project GitHub links, and a resume PDF path there.

## UI libraries

The plan is to use Vengeance UI as the base and borrow single components from Skiper UI or Animmaster. Install them from your own machine, for example `npx shadcn@latest add @vengeanceui/glass-dock`. `components.json` is already set up for shadcn.
