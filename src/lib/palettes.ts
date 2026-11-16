// Every colour the site uses for its two sides lives here. To try a new look,
// add an entry to `palettes` and either change DEFAULT_PALETTE, set the
// NEXT_PUBLIC_PALETTE env var, or open any page with ?palette=<name>
// (the choice sticks for that browser tab).
//
// Each side has a three-stop gradient (headings, buttons, glows, progress bar)
// plus one solid `accent` for small text and lines, picked as the stop that reads
// best on the ground colour. `onAccent` is the text colour on gradient buttons.

export type Side = "personal" | "professional";
export type SideColors = { from: string; via: string; to: string; accent: string; onAccent: string };
export type Palette = { label: string; ground: string; personal: SideColors; professional: SideColors };

export const palettes = {
  aurora: {
    label: "Aurora",
    ground: "#0B0F1A",
    personal: { from: "#7C3AED", via: "#EC4899", to: "#F59E0B", accent: "#EC4899", onAccent: "#FFFFFF" },
    professional: { from: "#06B6D4", via: "#3B82F6", to: "#6366F1", accent: "#06B6D4", onAccent: "#FFFFFF" },
  },
  // What the site looked like before Aurora: coral and cyan on near-black.
  classic: {
    label: "Classic",
    ground: "#070708",
    personal: { from: "#FF8060", via: "#D946EF", to: "#4F46E5", accent: "#FF8060", onAccent: "#070708" },
    professional: { from: "#3EE6FF", via: "#3EE6FF", to: "#3EE6FF", accent: "#3EE6FF", onAccent: "#070708" },
  },
} satisfies Record<string, Palette>;

export type PaletteName = keyof typeof palettes;

export const isPalette = (v: unknown): v is PaletteName => typeof v === "string" && v in palettes;

export const DEFAULT_PALETTE: PaletteName = isPalette(process.env.NEXT_PUBLIC_PALETTE) ? process.env.NEXT_PUBLIC_PALETTE : "aurora";

// "#7C3AED" -> "124 58 237", the form Tailwind's `rgb(var(--x) / <alpha>)` colours need.
const triple = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

const sideVars = (c: SideColors) =>
  `--accent:${triple(c.accent)};--grad-from:${triple(c.from)};--grad-via:${triple(c.via)};--grad-to:${triple(c.to)};--on-accent:${triple(c.onAccent)};`;

// CSS for every palette, keyed off <html data-palette> and each page's data-side.
// Pages outside a side (the intro) use the professional colours.
export function paletteCss() {
  return Object.entries(palettes as Record<string, Palette>)
    .map(([name, p]) => {
      const root = `html[data-palette="${name}"]`;
      return [
        `${root}{--ground:${triple(p.ground)};${sideVars(p.professional)}}`,
        `${root} [data-side="personal"]{${sideVars(p.personal)}}`,
        `${root} [data-side="professional"]{${sideVars(p.professional)}}`,
      ].join("\n");
    })
    .join("\n");
}

const STORE = "mb-palette";

// Runs before first paint so a ?palette= override never flashes the default.
export const paletteBootScript = `(function(){try{var n=${JSON.stringify(Object.keys(palettes))};var q=new URLSearchParams(location.search).get("palette");if(q&&n.indexOf(q)>-1)sessionStorage.setItem("${STORE}",q);var s=sessionStorage.getItem("${STORE}");if(s&&n.indexOf(s)>-1)document.documentElement.dataset.palette=s;}catch(e){}})();`;
