// What the wolf says at each stop of the tour. He's Manan's assistant, so he talks
// about Manan in the third person. `id` is the section's element id, and
// `side` is where he stands while talking about it (he walks across when it changes).
export type TourStop = { id: string; line: string; side: "left" | "right" };

export const tours: Record<"personal" | "professional", TourStop[]> = {
  personal: [
    { id: "hello", line: "I'm Manan's assistant. He's out, so I'm giving the tour. Scroll and follow me.", side: "left" },
    { id: "now", line: "What he's up to these days. The short version.", side: "right" },
    { id: "interests", line: "What Manan does when the laptop's closed. Which isn't often.", side: "left" },
    { id: "flight", line: "Two flights got him from Faridabad to Tempe. Hit replay, the plane enjoys it.", side: "right" },
    { id: "journey", line: "Five cities so far. This bit scrolls sideways, keep going.", side: "left" },
    { id: "memories", line: "His friends. I'd say more, but they'll read this.", side: "right" },
    { id: "next", line: "That's Manan off duty. Want the work side? I'll go find a tie.", side: "left" },
  ],
  professional: [
    { id: "hello", line: "Suit's on, so this is the work side. Manan's busy, I'll walk you through it.", side: "left" },
    { id: "achievements", line: "Numbers first. I hear recruiters like numbers.", side: "right" },
    { id: "experience", line: "Three internships, newest at the top.", side: "left" },
    { id: "projects", line: "Things he's built. Hover a card, it tilts. He spent too long on that.", side: "right" },
    { id: "skills", line: "His toolkit. Languages first, then the ML and backend stuff.", side: "left" },
    { id: "education", line: "Where he studied. Short section, I promise.", side: "right" },
    { id: "next", line: "That's the work. Want to see who he is off the clock? I'll grab my hoodie.", side: "left" },
  ],
};
