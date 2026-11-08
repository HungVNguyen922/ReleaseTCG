"use client";

import { useMemo, useState } from "react";

import type { PlayableCard, CardFilterValues } from "@/types/cards";

import {
  filterCards,
} from "@/lib/cards/filterCards";

export function useCardFilters(cards: PlayableCard[]) {
  const [filters, setFilters] = useState<CardFilterValues>({
    search: "",
    power: "all",
    bulk: "all",
    colors: [],
    colorMode: "contains",
    pool: "all",
  });

  const filteredCards = useMemo(() => {
    return filterCards(cards, filters);
  }, [cards, filters]);

  return {
    filters,
    setFilters,
    filteredCards,
  };
}
