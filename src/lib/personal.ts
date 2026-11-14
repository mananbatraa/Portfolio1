// Everything on the Personal page lives here, so it can be edited in one place.
// Lines marked CONFIRM were guessed from the resume and the site itself.
// Change or delete them freely; the page re-flows to whatever is listed.

export const about = {
  hello: "Hi, I'm Manan.",
  // CONFIRM: a first-person intro in your own voice.
  bio: "I grew up in India, studied in Vellore, and now live in Tempe while I do my master's at ASU. Away from the keyboard I'm chasing a good song, a new city or a late-night conversation with friends.",
  // A casual photo of you (not the LinkedIn one). Put it in public/personal/ and set the path.
  photo: "",
  tags: ["From India", "Lives in Tempe, AZ", "MS CS @ ASU", "Night owl"], // CONFIRM "Night owl"
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
    blurb: "Tame Impala on repeat. Psychedelic synths, long drives and playlists that fit the mood exactly.",
    tint: "from-fuchsia-500/30 to-violet-500/10",
  },
  {
    emoji: "✈️",
    title: "New cities",
    blurb: "Delhi, Vellore, Tempe, Goleta. Every move so far has come with a new favourite street and food spot.",
    tint: "from-sky-500/30 to-cyan-500/10",
  },
  {
    emoji: "🎨",
    title: "Design & motion",
    blurb: "I care how things feel: smooth transitions, good type, and interfaces that make you want to scroll.",
    tint: "from-amber-500/30 to-orange-500/10",
  },
  {
    emoji: "🛠️",
    title: "Building for fun",
    blurb: "Weekend side projects with AI agents, mostly to find out whether an idea actually works.",
    tint: "from-emerald-500/30 to-teal-500/10",
  },
  // CONFIRM: add the ones only you know, e.g. a sport, games, cooking, photography.
  {
    emoji: "☕",
    title: "Coffee & long talks",
    blurb: "Best ideas come out of a coffee run with friends that turns into three hours.",
    tint: "from-rose-500/30 to-pink-500/10",
  },
];

// Small facts shown as flip-free stat tiles.
export const nowFacts = [
  { label: "Currently", value: "MS CS at Arizona State" },
  { label: "On repeat", value: "Loser · Tame Impala" },
  { label: "Based in", value: "Tempe, Arizona" },
  { label: "Learning", value: "Agentic AI systems" }, // CONFIRM
];

// The places that shaped me, shown as a horizontal journey.
export const journey = [
  { year: "Before 2021", place: "Faridabad", note: "Home. Family, friends and the first lines of code." },
  { year: "2021 – 2025", place: "Vellore", note: "Four years at VIT, the friends I still call first." },
  { year: "Early 2025", place: "Delhi", note: "Built parking routing for Kumbh Mela crowds at Buntikki." },
  { year: "2025 →", place: "Tempe", note: "Moved across the world for an MS at Arizona State." },
  { year: "Summer 2026", place: "Goleta", note: "Interned at ParentSquare on the California coast." },
];

export type Memory = {
  // Path in public/, e.g. "/memories/vit-farewell.jpg". Empty shows a placeholder slot.
  src: string;
  caption: string;
  place?: string;
  date?: string;
};

// Photos with friends. Drop the files into public/memories/ and fill in src.
// Add or remove entries; the wall lays out any number.
export const memories: Memory[] = [
  { src: "", caption: "The VIT crew", place: "Vellore", date: "2024" },
  { src: "", caption: "Road trip", place: "Somewhere good", date: "" },
  { src: "", caption: "First week in Tempe", place: "Tempe", date: "2025" },
  { src: "", caption: "Late-night food run", place: "", date: "" },
  { src: "", caption: "Hackathon all-nighter", place: "", date: "" },
  { src: "", caption: "Summer on the coast", place: "Goleta", date: "2026" },
];

// The flight on the Personal page globe, in order. Coordinates are city centres.
export const flight = [
  { city: "Faridabad", lat: 28.41, lon: 77.32, years: "Home", note: "Where it all started." },
  { city: "Vellore", lat: 12.92, lon: 79.13, years: "2021 – 2025", note: "BTech at VIT." },
  { city: "Tempe", lat: 33.43, lon: -111.94, years: "2025 →", note: "MS CS at Arizona State." },
];
