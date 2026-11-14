// What wolf-Manan says at each stop of the tour. `id` is the section's element id, and
// `side` is where he stands while talking about it (he walks across when it changes).
export type TourStop = { id: string; line: string; side: "left" | "right" };

export const tours: Record<"personal" | "professional", TourStop[]> = {
  personal: [
    { id: "hello", line: "Hey, I'm Manan. Well, the wolf version. Scroll and I'll show you around.", side: "left" },
    { id: "now", line: "Quick snapshot of what I'm up to right now.", side: "right" },
    { id: "interests", line: "The stuff I'm into when the laptop's closed.", side: "left" },
    { id: "flight", line: "Every place I've flown to, traced on the globe.", side: "right" },
    { id: "journey", line: "How I got from India to Tempe. Keep scrolling, this bit moves sideways.", side: "left" },
    { id: "memories", line: "My people. These are the moments I keep coming back to.", side: "right" },
    { id: "next", line: "That's me off the clock. Want to see the work side? I'll suit up.", side: "left" },
  ],
  professional: [
    { id: "hello", line: "Suit's on. This is the work side. Scroll and I'll walk you through it.", side: "left" },
    { id: "achievements", line: "Highlights first: the numbers I'm proudest of.", side: "right" },
    { id: "experience", line: "Where I've worked, newest first.", side: "left" },
    { id: "projects", line: "Things I've built. Tilt the cards, they react.", side: "right" },
    { id: "skills", line: "My toolkit, from models to infra.", side: "left" },
    { id: "education", line: "Where I studied.", side: "right" },
    { id: "next", line: "Want to meet the person behind the work? I'll grab my hoodie.", side: "left" },
  ],
};
