export type CardPool =
  | "draft"
  | "private"
  | "beta"
  | "public";

export type CardCore = {
  id: string;
  name: string;

  power: number;
  bulk: number;

  trait: string | null;
  effect1: string | null;
  effect2: string | null;
  clarify1: string | null;
  clarify2: string | null;
  clarify3: string | null;

  artist: string | null;
  cardNumber: string | null;
  setName: string | null;

  flavor: string | null;
  inspiration: string | null;

};

export type PlayableCard = CardCore & {
  colors: string[];
};

/**
 * Represents the complete row stored in Supabase.
 * Extends Card with metadata only needed by the database/admin tools.
 */
export type DatabaseCard = {
  id: string;
  Name: string;

  Power: number;
  Bulk: number;

  Color1: string | null;
  Color2: string | null;
  Color3: string | null;
  Color4: string | null;

  Trait: string | null;
  Effect1: string | null;
  Effect2: string | null;
  Clarify1: string | null;
  Clarify2: string | null;
  Clarify3: string | null;

  CardNumber: string | null;
  SetName: string | null;
  Artist: string | null;
  Art: string | null;
  Flavor: string | null;
  Inspiration: string | null;

  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;

  pool: CardPool;
};

/**
 * Lightweight representation for the admin table.
 * Avoids loading every field unnecessarily.
 */
export type AdminCardSummary = CardCore & {
  pool: CardPool;
  palette: string[];
};

/**
 * How a color filter compares against a card's palette.
 * - "contains": the card has all of the selected colors (and possibly more).
 * - "exact": the card has exactly the selected colors.
 */
export type ColorMatchMode = "contains" | "exact";

/** Used by the admin card manager. */
export type CardFilterValues = {
  search: string;
  pool?: string;
  setName?: string;
  power: string;
  bulk: string;
  /** Up to 4 selected colors. Empty means "any color". */
  colors: string[];
  colorMode: ColorMatchMode;
};

export type CardSort = "name" | "power" | "bulk" | "setName";
export type SortDirection = "asc" | "desc";

/** Used by the Gallery and the Deck Builder, so both filter the same way. */
export type CardBrowserFilterState = {
  search: string;
  /** Empty string means "all sets". */
  setName: string;
  colors: string[];
  colorMode: ColorMatchMode;
  sort: CardSort;
  direction: SortDirection;
};
