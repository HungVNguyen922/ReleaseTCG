export type Axis = "K" | "L" | "D";

export const AXIS_LABEL: Record<Axis, string> = {
  K: "Knockout",
  L: "Lockout",
  D: "Deckout",
};

export type ColorInfo = {
  name: string;
  /** Two letters: the two win-condition axes this color sits between. */
  code: `${Axis}${Axis}`;
  element: string;
  offers: string;
  themes: string[];
  keywords: string[];
};

/** Tailwind classes for a solid color chip. Matches PaletteChips. */
export const COLOR_CHIP: Record<string, string> = {
  Red: "bg-red-500 text-white",
  Orange: "bg-orange-500 text-white",
  Yellow: "bg-yellow-400 text-black",
  Green: "bg-green-500 text-white",
  Cyan: "bg-cyan-500 text-white",
  Blue: "bg-blue-600 text-white",
  Violet: "bg-violet-600 text-white",
  Magenta: "bg-fuchsia-600 text-white",
  Pink: "bg-pink-500 text-white",
};

export const COLORS: ColorInfo[] = [
  {
    name: "Violet",
    code: "KK",
    element: "Electric",
    offers: "Ways to accelerate the attacking process.",
    themes: [
      "Attacking with anything",
      "Forcing plays through",
      "Sacrifices for tempo",
    ],
    keywords: ["Leech", "Critical", "Unblockable", "Starved", "Raid"],
  },
  {
    name: "Red",
    code: "KL",
    element: "Fire",
    offers: "Ways to pump damage temporarily and recur cards.",
    themes: [
      "Chip and burst damage",
      "Recycling resources",
      "Opponent hand removal",
    ],
    keywords: ["Blitz", "Recycle", "Refresh", "Scrounge", "Gap"],
  },
  {
    name: "Cyan",
    code: "KD",
    element: "Air",
    offers: "Ways to get to, and get value from, long combos.",
    themes: ["Card economy ramping", "Combo spam", "Card duplicating"],
    keywords: ["Recruit", "Mimic", "Detonate", "Shove", "Latent", "Double"],
  },
  {
    name: "Blue",
    code: "LK",
    element: "Water",
    offers: "Ways to close board options while playing defensive.",
    themes: ["Field lock", "Rearranging plays", "Counterattacking"],
    keywords: ["Beat", "Morph", "Shut Down", "Barrier", "Bounce", "Recolor"],
  },
  {
    name: "Yellow",
    code: "LL",
    element: "Earth",
    offers: "Ways to slow down the opponent and the board.",
    themes: ["Board control", "Card prevention", "Slow-setup payoffs"],
    keywords: ["Drought", "Disarm", "Peak", "Scan", "Recolor", "Mute"],
  },
  {
    name: "Orange",
    code: "LD",
    element: "Metal",
    offers: "Ways to mitigate all sources of damage and control what you draw.",
    themes: [
      "Hand-building control",
      "Damage denial",
      "Giving tough decisions",
    ],
    keywords: ["Block", "Armor", "Rend", "Stockpile", "Steal", "Swap"],
  },
  {
    name: "Magenta",
    code: "DK",
    element: "Ghost",
    offers: "Ways to manipulate the board and mitigate damage.",
    themes: ["Multi-Gate plays", "Damage mitigation", "BLK/POW reversal"],
    keywords: ["Reflect", "Shift", "Float", "Underdog", "Surrounded"],
  },
  {
    name: "Pink",
    code: "DL",
    element: "Soul",
    offers: "Ways to get value from taking damage and playing reactive.",
    themes: ["Blood debt", "Card charity and reactivity", "Pass investing"],
    keywords: ["Gift", "Take", "Totem", "React", "Brink"],
  },
  {
    name: "Green",
    code: "DD",
    element: "Plants",
    offers: "Ways to mill the deck quickly and heal.",
    themes: ["Rampant draws", "Flinging cards", "Reanimation"],
    keywords: ["Draw", "Renew", "Heal", "Stockpile", "Ripped"],
  },
];
