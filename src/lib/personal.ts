// Everything on the Personal page lives here, so it can be edited in one place.
// Lines marked CONFIRM were guessed from the resume and the site itself.
// Change or delete them freely; the page re-flows to whatever is listed.

export const about = {
  hello: "Hi, I'm Manan.",
  // CONFIRM: only facts we know. Add one real thing about you to the last sentence.
  bio: "I'm from Faridabad, did my bachelor's at VIT in Vellore, and moved to Tempe in 2025 for my master's at ASU. If I'm not coding, Tame Impala is probably on.",
  // A casual photo of you (not the LinkedIn one). Put it in public/personal/ and set the path.
  photo: "",
  tags: ["From Faridabad", "Lives in Tempe, AZ", "MS CS at ASU", "Night owl"], // CONFIRM "Night owl"
};

export type Interest = {
  emoji: string;
  title: string;
  blurb: string;
  // Tailwind gradient classes for the card glow.
  tint: string;
};

export const interests: Interest[] = [
  {
    emoji: "🎧",
    title: "Music",
    blurb: "Mostly Tame Impala. 'Loser' has been on repeat for a while now.",
    tint: "from-fuchsia-500/30 to-violet-500/10",
  },
  {
    emoji: "✈️",
    title: "New cities",
    blurb: "Faridabad, Vellore, Delhi, Tempe, Goleta. Five cities so far, and I'm not done.",
    tint: "from-sky-500/30 to-cyan-500/10",
  },
  {
    emoji: "🎨",
    title: "Making things move",
    blurb: "I spend too long on how things animate. This site is the evidence.",
    tint: "from-amber-500/30 to-orange-500/10",
  },
  {
    emoji: "🛠️",
    title: "Building for fun",
    blurb: "Side projects with AI agents, mostly to see if an idea holds up outside my head.",
    tint: "from-emerald-500/30 to-teal-500/10",
  },
  // CONFIRM: the old "Coffee & long talks" card was made up, so it's off for now.
  // Add the ones only you know (a sport, games, cooking, photography) in the same shape,
  // e.g. { emoji: "⚽", title: "...", blurb: "...", tint: "from-rose-500/30 to-pink-500/10" }.
];

// Small facts shown as flip-free stat tiles.
export const nowFacts = [
  { label: "Doing", value: "MS CS at Arizona State" },
  { label: "On repeat", value: "Loser · Tame Impala" },
  { label: "Living in", value: "Tempe, Arizona" },
  { label: "Building", value: "AI agents" },
];

// The places that shaped me, shown as a horizontal journey.
export const journey = [
  { year: "Before 2021", place: "Faridabad", note: "Where I'm from." },
  { year: "2021 – 2025", place: "Vellore", note: "Four years of CS at VIT." },
  { year: "Early 2025", place: "Delhi", note: "Interned at Buntikki, routing cars for Kumbh Mela crowds." },
  { year: "2025 →", place: "Tempe", note: "Moved here for my master's at ASU." },
  { year: "Summer 2026", place: "Goleta", note: "Spent the summer interning at ParentSquare." },
];

export type Memory = {
  // Path in public/, e.g. "/memories/vit-farewell.jpg". Empty shows a placeholder slot.
  src: string;
  caption: string;
  place?: string;
  date?: string;
};

// Photos with friends. Drop the files into public/memories/ and fill in src.
// CONFIRM: these captions are placeholders until the real photos are in.
// Add or remove entries; the wall lays out any number.
export const memories: Memory[] = [
  { src: "", caption: "The VIT crew", place: "Vellore", date: "2024" },
  { src: "", caption: "Road trip", place: "", date: "" },
  { src: "", caption: "First week in Tempe", place: "Tempe", date: "2025" },
  { src: "", caption: "Late-night food run", place: "", date: "" },
  { src: "", caption: "Hackathon all-nighter", place: "", date: "" },
  { src: "", caption: "Summer on the coast", place: "Goleta", date: "2026" },
];

// The flight on the Personal page globe, in order. Coordinates are city centres.
export const flight = [
  { city: "Faridabad", lat: 28.41, lon: 77.32, years: "Home", note: "Where I'm from." },
  { city: "Vellore", lat: 12.92, lon: 79.13, years: "2021 – 2025", note: "BTech at VIT." },
  { city: "Tempe", lat: 33.43, lon: -111.94, years: "2025 →", note: "MS CS at ASU." },
];
