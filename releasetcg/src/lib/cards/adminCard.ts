import type { AdminCardSummary, DatabaseCard } from "@/types/cards";

/**
 * One row of the Card Manager sheet: everything in the CSV, plus the pool.
 * (AdminCardSummary already has every field except `art`.)
 */
export type AdminCardRow = AdminCardSummary & {
  art: string | null;
};

/** Every editable column of the `cards` table. */
export const ADMIN_CARD_SELECT = `
  id,
  Name,
  Power,
  Bulk,
  Color1,
  Color2,
  Color3,
  Color4,
  Trait,
  Effect1,
  Effect2,
  Clarify1,
  Clarify2,
  Clarify3,
  CardNumber,
  SetName,
  Artist,
  Art,
  Flavor,
  Inspiration,
  pool
`;

export function toAdminCard(card: DatabaseCard): AdminCardRow {
  return {
    id: card.id,
    name: card.Name,

    power: card.Power,
    bulk: card.Bulk,

    trait: card.Trait,
    effect1: card.Effect1,
    effect2: card.Effect2,

    clarify1: card.Clarify1,
    clarify2: card.Clarify2,
    clarify3: card.Clarify3,

    artist: card.Artist,
    art: card.Art ?? null,
    cardNumber: card.CardNumber,
    setName: card.SetName,

    flavor: card.Flavor,
    inspiration: card.Inspiration,

    palette: [card.Color1, card.Color2, card.Color3, card.Color4].filter(
      Boolean
    ) as string[],

    pool: card.pool,
  };
}
