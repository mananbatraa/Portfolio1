// What wolf-Manan says at each stop of the tour. `id` is the section's element id, and
// `side` is where he stands while talking about it (he walks across when it changes).
export type TourStop = { id: string; line: string; side: "left" | "right" };

export const tours: Record<"personal" | "professional", TourStop[]> = {
  personal: [
    { id: "hello", line: "Hey, I'm Manan. Yes, a wolf. Scroll down and I'll walk you through it.", side: "left" },
    { id: "now", line: "What I'm up to these days. The short version.", side: "right" },
    { id: "interests", line: "What I do when the laptop's closed. Which isn't often.", side: "left" },
    { id: "flight", line: "Two flights got me from Faridabad to Tempe. Hit replay, the plane enjoys it.", side: "right" },
    { id: "journey", line: "Five cities so far. This bit scrolls sideways, keep going.", side: "left" },
    { id: "memories", line: "My friends. I'd say more, but they'll read this.", side: "right" },
    { id: "next", line: "That's me off duty. Want the work side? I'll go find a tie.", side: "left" },
  ],
  professional: [
    { id: "hello", line: "Suit's on, so this is the work side. Scroll and I'll show you around.", side: "left" },
    { id: "achievements", line: "Numbers first. I hear recruiters like numbers.", side: "right" },
    { id: "experience", line: "Three internships, newest at the top.", side: "left" },
    { id: "projects", line: "Things I've built. Hover a card, it tilts. I spent too long on that.", side: "right" },
    { id: "skills", line: "My toolkit. Languages first, then the ML and backend stuff.", side: "left" },
    { id: "education", line: "Where I studied. Short section, I promise.", side: "right" },
    { id: "next", line: "That's the work. Want to meet the person? Hoodie's in the other room.", side: "left" },
  ],
};
