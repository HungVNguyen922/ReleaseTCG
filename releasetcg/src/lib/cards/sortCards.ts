import type { CardSort, SortDirection } from "@/types/cards";

import { compareSetCodes } from "@/lib/sets/sets";

export const CARD_SORT_OPTIONS: { label: string; value: CardSort }[] = [
  { label: "Name", value: "name" },
  { label: "Power", value: "power" },
  { label: "Bulk", value: "bulk" },
  { label: "Set (card number)", value: "setName" },
];

type SortableCard = {
  name: string;
  power: number;
  bulk: number;
  setName: string | null;
  cardNumber: string | null;
};

/**
 * Card numbers are stored as text like "12/81". This reads the leading number
 * so "2/81" sorts before "10/81". Cards without a readable number sort last.
 */
export function parseCardNumber(value: string | null | undefined): number {
  const match = /^\s*(\d+)/.exec(value ?? "");

  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function compareNumbers(a: number, b: number) {
  if (a === b) return 0;

  return a < b ? -1 : 1;
}

/** Set order first (set 1, then set 2...), then the card's number within the set. */
function compareSetAndNumber(a: SortableCard, b: SortableCard) {
  return (
    compareSetCodes(a.setName, b.setName) ||
    compareNumbers(parseCardNumber(a.cardNumber), parseCardNumber(b.cardNumber))
  );
}

/**
 * Compares two cards. The chosen sort (and direction) decides the order,
 * and ties are always broken the same way: set, card number, then name.
 * That keeps the order stable instead of depending on how the database
 * happened to return the cards.
 */
export function compareCards(
  a: SortableCard,
  b: SortableCard,
  sort: CardSort,
  direction: SortDirection
) {
  const dir = direction === "asc" ? 1 : -1;

  let primary = 0;

  switch (sort) {
    case "power":
      primary = a.power - b.power;
      break;
    case "bulk":
      primary = a.bulk - b.bulk;
      break;
    case "setName":
      primary = compareSetAndNumber(a, b);
      break;
    default:
      primary = a.name.localeCompare(b.name);
  }

  if (primary !== 0) return primary * dir;

  return compareSetAndNumber(a, b) || a.name.localeCompare(b.name);
}

export function sortCards<T extends SortableCard>(
  cards: T[],
  sort: CardSort,
  direction: SortDirection
): T[] {
  return [...cards].sort((a, b) => compareCards(a, b, sort, direction));
}
