import type { ColorMatchMode } from "@/types/cards";

export const CARD_COLORS = [
  "Red",
  "Orange",
  "Yellow",
  "Green",
  "Cyan",
  "Blue",
  "Violet",
  "Magenta",
  "Pink",
] as const;

/** A card has at most 4 colors, so a filter never needs more than 4. */
export const MAX_FILTER_COLORS = 4;

/**
 * Does a card's palette satisfy a color filter?
 *
 * - No colors selected: every card matches.
 * - "contains": the card has ALL of the selected colors (it may have others too).
 * - "exact": the card's palette is exactly the selected colors, in any order.
 */
export function matchesColors(
  cardColors: string[],
  selected: string[],
  mode: ColorMatchMode
): boolean {
  const wanted = new Set(selected);

  if (wanted.size === 0) return true;

  const palette = new Set(cardColors);

  if (mode === "exact") {
    return (
      palette.size === wanted.size &&
      [...wanted].every((color) => palette.has(color))
    );
  }

  return [...wanted].every((color) => palette.has(color));
}

/** Adds or removes a color, never growing past `max` colors. */
export function toggleColor(
  selected: string[],
  color: string,
  max: number = MAX_FILTER_COLORS
): string[] {
  if (selected.includes(color)) {
    return selected.filter((existing) => existing !== color);
  }

  if (selected.length >= max) return selected;

  return [...selected, color];
}
