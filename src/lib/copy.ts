// Every bit of site text that isn't resume data: the opening dialogue, section headings,
// small hints and labels. Resume facts live in content.ts, personal stuff in personal.ts,
// and the wolf's tour lines in tour.ts.
//
// Voice: Manan talking, first person, plain words, short sentences. No "passionate",
// "journey", "crafting" or "corner of the internet". A little dry humour is fine.

// The wolf is Manan's assistant, not Manan. He runs the tour while Manan's away and
// always talks about Manan in the third person. Page text stays in Manan's own voice.
export const wolf = {
  // The name tag on his speech bubbles.
  name: "Wolfie",
  label: (outfit: "personal" | "professional") =>
    `Wolfie, Manan's wolf assistant, in his ${outfit === "personal" ? "hoodie" : "suit"}`,
};

// The question after the name intro.
export const quest = {
  firstVisit: [
    "Oh, hey. Someone actually clicked the link.",
    "I'm Wolfie, Manan's assistant. He's not around right now, so you get me.",
    "I can show you his work, or who he is outside it. Which one?",
  ],
  returning: (lastSide: string) => [
    "You're back. Manan will be thrilled. I'll tell him later.",
    `Last time it was ${lastSide}. Where to this time?`,
  ],
  choices: {
    professional: {
      label: "💼 Professional",
      hint: "I'm hiring, or I want to see his work",
      reply: "Hiring? Give me a second, I'll put the suit on. He'd want me to.",
    },
    personal: {
      label: "🎧 Personal",
      hint: "I want to know who Manan is",
      reply: "Good pick. Less tie, more Tame Impala.",
    },
  },
};

// Section headings: a small label above, and the big title.
export const headings = {
  interests: { kicker: "Outside work", title: "OFF THE CLOCK" },
  flight: { kicker: "Flight log", title: "FARIDABAD TO TEMPE" },
  journey: { kicker: "Where I've lived", title: "FIVE CITIES SO FAR" },
  memories: { kicker: "Friends", title: "MY PEOPLE" },
  achievements: { kicker: "Highlights", title: "THE NUMBERS" },
  experience: { kicker: "Experience", title: "WHERE I'VE WORKED" },
  work: { kicker: "Projects & research", title: "THINGS I'VE BUILT" },
  skills: { kicker: "Skills", title: "WHAT I WORK WITH" },
  education: { kicker: "Education", title: "WHERE I STUDIED" },
  certifications: { kicker: "Certifications & awards", title: "CREDENTIALS" },
};

// The flight globe on the Personal page. `km` is the route length, worked out from the map.
export const globe = {
  intro: (km: string) =>
    `Faridabad to Vellore for my bachelor's, then Vellore to Tempe for my master's. About ${km} km in all. Tap a stop to look closer, or replay the flight.`,
  replay: "Replay the flight ✈",
  showRoute: "Show the route",
  flying: (from: string, to: string) => `Flying ${from} → ${to}`,
  landed: (city: string) => `Landed in ${city}. That's home now.`,
  // Said by the wolf, so third person.
  bubble: "Manan lives here now",
};

export const hints = {
  personalKicker: "The off-duty version",
  polaroid: "that's me ✌️",
  photoSoon: "Photo coming soon",
  personalHero: "Drag the photo · scroll for more ↓",
  shuffleWall: "Shuffle the wall ↻",
  openToWork: "Open to full-time roles",
  viewCode: "View on GitHub →",
};

// Search and link-preview text for each page.
export const meta = {
  site: {
    title: "Manan Batra · AI Software Engineer",
    description: "Manan Batra, AI software engineer and MS CS student at Arizona State.",
  },
  personal: {
    title: "Manan Batra · Personal",
    description: "Manan Batra outside work: music, the cities he's lived in, and his friends.",
  },
  professional: {
    title: "Manan Batra · Professional",
    description: "Manan Batra's internships, projects, skills and education.",
  },
};
