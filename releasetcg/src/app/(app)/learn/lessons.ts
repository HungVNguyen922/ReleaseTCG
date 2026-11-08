export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
};

/**
 * Ordered curriculum for the Learn tab.
 * The sidebar, the /learn index, and the previous/next links all read from this list,
 * so reordering lessons here updates everything.
 */
export const lessons: Lesson[] = [
  {
    slug: "how-to-win",
    title: "How to Win",
    summary:
      "Start with the goal: three ways to win, and why no two games play out the same.",
    minutes: 3,
  },
  {
    slug: "cards",
    title: "Understanding a Card",
    summary:
      "Power, Bulk, colors, traits and effects: what everything on a card means.",
    minutes: 4,
  },
  {
    slug: "board",
    title: "Knowing the Board",
    summary:
      "Gates, Set Zones, piles and your hand: where everything lives and what it’s for.",
    minutes: 3,
  },
  {
    slug: "setup",
    title: "Setting up a Game",
    summary:
      "Shuffle, draw, build the shared Public Pile, place your Starter, and begin.",
    minutes: 3,
  },
  {
    slug: "phases",
    title: "Game Phases",
    summary:
      "The shape of a turn: Instant, Action, Fill and End, and what happens inside each.",
    minutes: 3,
  },
  {
    slug: "plays",
    title: "Playing Cards",
    summary:
      "Burn, Liminal, Load and Pass, plus multi-card combos built from Pures and PseudoPures.",
    minutes: 6,
  },
  {
    slug: "attacks",
    title: "Attacks and Damage",
    summary:
      "How Pairs and Straights turn the top of a Gate into damage, and how to aim it.",
    minutes: 4,
  },
  {
    slug: "parries",
    title: "Parries and Responses",
    summary:
      "How to stop a Play with an equal Bulk, and how Parry exchanges are won and lost.",
    minutes: 5,
  },
  {
    slug: "deck-building",
    title: "Building a Deck",
    summary:
      "20 Main cards, 6 Extra cards, and how to build around the shared Public Pile.",
    minutes: 5,
  },
  {
    slug: "colors",
    title: "The Nine Colors",
    summary:
      "What each color is good at, and how the colors map onto the three ways to win.",
    minutes: 5,
  },
  {
    slug: "additional-rules",
    title: "Additional Rules",
    summary:
      "Edge cases, health words, board terms, and a glossary of card-text keywords.",
    minutes: 5,
  },
  {
    slug: "faq",
    title: "FAQ",
    summary: "Quick answers to the questions new players ask most.",
    minutes: 4,
  },
];

export function learnHref(slug: string) {
  return `/learn/${slug}`;
}

export function getLessonNeighbors(slug: string) {
  const index = lessons.findIndex((lesson) => lesson.slug === slug);

  return {
    prev: index > 0 ? lessons[index - 1] : null,
    next:
      index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null,
  };
}
