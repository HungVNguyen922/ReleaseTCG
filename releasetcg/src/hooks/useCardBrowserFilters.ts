"use client";

import { useMemo, useState } from "react";

import type {
  CardBrowserFilterState,
  CardSort,
  ColorMatchMode,
  PlayableCard,
  SortDirection,
} from "@/types/cards";

import { matchesColors } from "@/lib/cards/colorFilter";
import { matchesSearch } from "@/lib/cards/filterCards";
import { sortCards } from "@/lib/cards/sortCards";
import { sortSetCodes } from "@/lib/sets/sets";

/**
 * Filtering and sorting shared by the Gallery and the Deck Builder.
 * Spread `filterProps` into <CardBrowserFilters />.
 */
export function useCardBrowserFilters(
  cards: PlayableCard[],
  options: { initialSetName?: string } = {}
) {
  const [filters, setFilters] = useState<CardBrowserFilterState>({
    search: "",
    setName: options.initialSetName ?? "",
    colors: [],
    colorMode: "contains",
    sort: "setName",
    direction: "asc",
  });

  const setOptions = useMemo(() => {
    const names = cards
      .map((card) => card.setName)
      .filter((name): name is string => Boolean(name));

    // Set 1 first, then set 2, and so on.
    return sortSetCodes([...new Set(names)]);
  }, [cards]);

  const filteredCards = useMemo(() => {
    const matched = cards.filter((card) => {
      if (!matchesSearch(card, filters.search)) return false;

      if (filters.setName && card.setName !== filters.setName) return false;

      return matchesColors(card.colors, filters.colors, filters.colorMode);
    });

    return sortCards(matched, filters.sort, filters.direction);
  }, [cards, filters]);

  const filterProps = {
    filters,
    setOptions,
    onSearch: (search: string) => setFilters((prev) => ({ ...prev, search })),
    onSetName: (setName: string) =>
      setFilters((prev) => ({ ...prev, setName })),
    onColors: (colors: string[]) =>
      setFilters((prev) => ({ ...prev, colors })),
    onColorMode: (colorMode: ColorMatchMode) =>
      setFilters((prev) => ({ ...prev, colorMode })),
    onSort: (sort: CardSort) => setFilters((prev) => ({ ...prev, sort })),
    onDirection: (direction: SortDirection) =>
      setFilters((prev) => ({ ...prev, direction })),
  };

  return { filteredCards, filterProps };
}
