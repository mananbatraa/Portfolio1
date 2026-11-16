// Media for the scroll-scrubbed "Under the hood" film on the Professional page.
//
// Empty strings are valid. The engine skips an empty clip and cross-fades the two
// stills instead, and the whole section stays hidden until at least the assembled
// still exists, so this file can be filled in one asset at a time.
//
// Where the files come from (see the PR for the exact prompts):
//   stills  Higgsfield Nano Banana, 16:9, Enhance OFF
//   clips   Kling 3.0, 5s, 1080p, Audio OFF; keepers upscaled to 2160p with Topaz
// Put them in public/film/ (or a CDN that sends CORS headers, since frames are
// read back from a canvas).

export const FILM_ASSEMBLED = ""; // e.g. "/film/assembled.webp"
export const FILM_EXPLODED = ""; // e.g. "/film/exploded.webp"

// 1080p for phones, 2160p for large screens. The 4K slot may stay empty.
export const DECON = "";
export const DECON_4K = "";
export const ORBIT = "";
export const ORBIT_4K = "";
export const MACRO = "";
export const MACRO_4K = "";

export type FilmSegment = {
  id: string;
  url: string;
  url4K: string;
  // Play the clip backwards: reassemble and reveal cost no extra generation.
  reverse: boolean;
  // Relative share of the section's scroll length.
  span: number;
  // How far the stills cross-fade toward the exploded view across this act (0 to 1, start and end).
  explode: [number, number];
  kicker: string;
  title: string;
  line: string;
};

export const FILM_SEGMENTS: FilmSegment[] = [
  {
    id: "deconstruct",
    url: DECON,
    url4K: DECON_4K,
    reverse: false,
    span: 6,
    explode: [0, 1],
    kicker: "Scene 01 · Deconstruct",
    title: "EVERY LAYER HAS A JOB",
    line: "Data pipelines, models, APIs and the UI on top. I like knowing what each part does before I ship it.",
  },
  {
    id: "reassemble",
    url: DECON,
    url4K: DECON_4K,
    reverse: true,
    span: 5,
    explode: [1, 0],
    kicker: "Scene 02 · Reassemble",
    title: "THEN IT CLICKS BACK TOGETHER",
    line: "Taking a system apart is only useful if you can put it back so it runs better than before.",
  },
  {
    id: "orbit",
    url: ORBIT,
    url4K: ORBIT_4K,
    reverse: false,
    span: 6,
    explode: [0, 0],
    kicker: "Scene 03 · Orbit",
    title: "BUILT FROM EVERY ANGLE",
    line: "Python and Go on the backend, PyTorch and XGBoost for the models, React and Next.js for the people using it.",
  },
  {
    id: "detail",
    url: MACRO,
    url4K: MACRO_4K,
    reverse: false,
    span: 6,
    explode: [0, 0],
    kicker: "Scene 04 · Detail",
    title: "DOWN TO THE LAST LINE",
    line: "The interesting part is usually one function deep. That is where I spend my time.",
  },
];

export const FILM_READY = Boolean(FILM_ASSEMBLED);
