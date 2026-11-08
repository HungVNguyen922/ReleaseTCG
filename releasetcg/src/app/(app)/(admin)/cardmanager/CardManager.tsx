"use client";

import { useMemo, useState } from "react";

import type {
  AdminCardSummary,
  CardFilterValues,
} from "@/types/cards";

import { CardManagerHeader } from "./components/CardManagerHeader";
import { CardFilters } from "@/app/(app)/components/cards/CardFilters";
import { CardTable } from "./components/CardTable";

import { filterCards } from "@/lib/cards/filterCards";

type Props = {
  cards: AdminCardSummary[];
};

export function CardManager({ cards }: Props) {
  const [filters, setFilters] = useState<CardFilterValues>({
    search: "",
    pool: "all",
    power: "all",
    bulk: "all",
    colors: [],
    colorMode: "contains",
  });

  const filteredCards = useMemo(
    () => filterCards(cards, filters),
    [cards, filters]
  );

  return (
    <div className="space-y-6">
      <CardManagerHeader />

      <CardFilters
        filters={filters}
        setFilters={setFilters}
        options={{
          showPool: true,
          showPower: true,
          showBulk: true,
          showColor: true,
        }}
      />

      <p className="text-sm text-muted-foreground">
        Showing {filteredCards.length} of {cards.length} cards
      </p>

      <CardTable cards={filteredCards} />
    </div>
  );
}
