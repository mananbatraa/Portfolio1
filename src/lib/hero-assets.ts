// All hero media lives here. Empty strings are valid: the engine skips
// unfilled clips and falls back to cross-fading the two stills, so the
// site works at every stage of production.

export const LAPTOP_ASSEMBLED = "/hero/assembled.svg";
export const LAPTOP_EXPLODED = "/hero/exploded.svg";

// 1080p (mobile) and 2160p (desktop) masters, from Higgsfield + Topaz.
export const DECON = "";
export const DECON_4K = "";
export const ORBIT = "";
export const ORBIT_4K = "";
export const BRIDGE = "";
export const BRIDGE_4K = "";
export const MACRO = "";
export const MACRO_4K = "";

export type Segment = {
  id: string;
  url: string;
  url4K: string;
  reverse: boolean;
  span: number;
};

export const HERO_SEGMENTS: Segment[] = [
  { id: "deconstruct", url: DECON, url4K: DECON_4K, reverse: false, span: 6 },
  { id: "reassemble", url: DECON, url4K: DECON_4K, reverse: true, span: 6 },
  { id: "orbit", url: ORBIT, url4K: ORBIT_4K, reverse: false, span: 6 },
  { id: "bridge", url: BRIDGE, url4K: BRIDGE_4K, reverse: false, span: 5 },
  { id: "detail", url: MACRO, url4K: MACRO_4K, reverse: false, span: 6 },
  { id: "reveal", url: MACRO, url4K: MACRO_4K, reverse: true, span: 6 },
];

export const TOTAL_SPAN = HERO_SEGMENTS.reduce((sum, s) => sum + s.span, 0);
