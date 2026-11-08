"use client";

import { useMemo, useState } from "react";

import { PlayableCard, ColorMatchMode } from "@/types/cards";
import { matchesColors } from "@/lib/cards/colorFilter";
import { GalleryFilterState, GallerySort, SortDirection } from "../types";

export function useGalleryFilters(cards: PlayableCard[]) {
  const [filters, setFilters] = useState<GalleryFilterState>({
    search: "",
    setName: "",
    colors: [],
    colorMode: "contains",
    sort: "name",
    direction: "asc",
  });

  function setSearch(search: string) {
    setFilters((prev) => ({ ...prev, search }));
  }

  function setSetName(setName: string) {
    setFilters((prev) => ({ ...prev, setName }));
  }

  function setColors(colors: string[]) {
    setFilters((prev) => ({ ...prev, colors }));
  }

  function setColorMode(colorMode: ColorMatchMode) {
    setFilters((prev) => ({ ...prev, colorMode }));
  }

  function setSort(sort: GallerySort) {
    setFilters((prev) => ({ ...prev, sort }));
  }

  function setDirection(direction: SortDirection) {
    setFilters((prev) => ({ ...prev, direction }));
  }

  const filteredCards = useMemo(() => {
    const filtered = cards.filter((card) => {
      if (
        filters.search &&
        !card.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (filters.setName && card.setName !== filters.setName) {
        return false;
      }

      if (!matchesColors(card.colors, filters.colors, filters.colorMode)) {
        return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sort) {
        case "power":
          comparison = a.power - b.power;
          break;
        case "bulk":
          comparison = a.bulk - b.bulk;
          break;
        case "setName":
          comparison = (a.setName ?? "").localeCompare(b.setName ?? "");
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return filters.direction === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [cards, filters]);

  return {
    filters,
    filteredCards,
    setSearch,
    setSetName,
    setColors,
    setColorMode,
    setSort,
    setDirection,
  };
}
