import { CardFilterValues } from "@/types/cards";

import { matchesColors } from "./colorFilter";

type CardLike = {
  name: string;
  trait?: string | null;
  effect1?: string | null;
  effect2?: string | null;
  clarify1?: string | null;
  clarify2?: string | null;
  clarify3?: string | null;

  power: number;
  bulk: number;

  colors?: string[];
  palette?: string[];

  pool?: string;
};

function getColors(card: CardLike): string[] {
  return card.colors ?? card.palette ?? [];
}

export function matchesSearch(card: CardLike, query: string) {
  if (!query.trim()) return true;

  const q = query.toLowerCase();

  const searchable = [
    card.name,
    card.trait,
    card.effect1,
    card.effect2,
    card.clarify1,
    card.clarify2,
    card.clarify3,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchable.includes(q);
}

function matchesPool(card: CardLike, pool?: string) {
  if (!pool || pool === "all") return true;
  return card.pool === pool;
}

function matchesPower(card: CardLike, power: string) {
  return power === "all" || card.power === Number(power);
}

function matchesBulk(card: CardLike, bulk: string) {
  return bulk === "all" || card.bulk === Number(bulk);
}

export function filterCards<T extends CardLike>(
  cards: T[],
  filters: CardFilterValues
): T[] {
  return cards.filter((card) => {
    return (
      matchesSearch(card, filters.search) &&
      matchesPool(card, filters.pool) &&
      matchesPower(card, filters.power) &&
      matchesBulk(card, filters.bulk) &&
      matchesColors(getColors(card), filters.colors, filters.colorMode)
    );
  });
}
