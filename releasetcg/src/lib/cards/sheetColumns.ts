import { SETS, compareSetCodes } from "@/lib/sets/sets";

import type { AdminCardRow } from "./adminCard";
import { CARD_COLORS, CARD_POOLS } from "./options";
import { compareCards, parseCardNumber } from "./sortCards";

export type SheetColumnKey =
  | "name"
  | "power"
  | "bulk"
  | "color1"
  | "color2"
  | "color3"
  | "color4"
  | "trait"
  | "effect1"
  | "effect2"
  | "clarify1"
  | "clarify2"
  | "clarify3"
  | "cardNumber"
  | "setName"
  | "artist"
  | "art"
  | "flavor"
  | "inspiration"
  | "pool";

export type SheetColumn = {
  key: SheetColumnKey;
  label: string;
  /** Tailwind width classes for the column. */
  width: string;
  /**
   * text   - one line
   * long   - opens a bigger box when edited (effects, flavor text)
   * number - whole number
   * select - always a dropdown
   */
  kind: "text" | "long" | "number" | "select";
  options?: readonly string[];
};

/** Same order as the CSV, with the pool added at the end. */
export const SHEET_COLUMNS: SheetColumn[] = [
  { key: "name", label: "Name", width: "min-w-48 w-48", kind: "text" },
  { key: "power", label: "Power", width: "min-w-16 w-16", kind: "number" },
  { key: "bulk", label: "Bulk", width: "min-w-16 w-16", kind: "number" },
  { key: "color1", label: "Color1", width: "min-w-28 w-28", kind: "select", options: CARD_COLORS },
  { key: "color2", label: "Color2", width: "min-w-28 w-28", kind: "select", options: CARD_COLORS },
  { key: "color3", label: "Color3", width: "min-w-28 w-28", kind: "select", options: CARD_COLORS },
  { key: "color4", label: "Color4", width: "min-w-28 w-28", kind: "select", options: CARD_COLORS },
  { key: "trait", label: "Trait", width: "min-w-40 w-40", kind: "text" },
  { key: "effect1", label: "Effect1", width: "min-w-64 w-64 max-w-64", kind: "long" },
  { key: "effect2", label: "Effect2", width: "min-w-64 w-64 max-w-64", kind: "long" },
  { key: "clarify1", label: "Clarify1", width: "min-w-56 w-56 max-w-56", kind: "long" },
  { key: "clarify2", label: "Clarify2", width: "min-w-56 w-56 max-w-56", kind: "long" },
  { key: "clarify3", label: "Clarify3", width: "min-w-56 w-56 max-w-56", kind: "long" },
  { key: "cardNumber", label: "CardNumber", width: "min-w-28 w-28", kind: "text" },
  {
    key: "setName",
    label: "SetName",
    width: "min-w-28 w-28",
    kind: "select",
    options: SETS.map((set) => set.code),
  },
  { key: "artist", label: "Artist", width: "min-w-36 w-36", kind: "text" },
  { key: "art", label: "Art", width: "min-w-40 w-40", kind: "text" },
  { key: "flavor", label: "Flavor", width: "min-w-56 w-56 max-w-56", kind: "long" },
  { key: "inspiration", label: "Inspiration", width: "min-w-48 w-48 max-w-48", kind: "long" },
  { key: "pool", label: "Pool", width: "min-w-28 w-28", kind: "select", options: CARD_POOLS },
];

/** What a cell shows, as text. */
export function cellValue(card: AdminCardRow, key: SheetColumnKey): string {
  switch (key) {
    case "name":
      return card.name;
    case "power":
      return String(card.power);
    case "bulk":
      return String(card.bulk);
    case "color1":
      return card.palette[0] ?? "";
    case "color2":
      return card.palette[1] ?? "";
    case "color3":
      return card.palette[2] ?? "";
    case "color4":
      return card.palette[3] ?? "";
    case "trait":
      return card.trait ?? "";
    case "effect1":
      return card.effect1 ?? "";
    case "effect2":
      return card.effect2 ?? "";
    case "clarify1":
      return card.clarify1 ?? "";
    case "clarify2":
      return card.clarify2 ?? "";
    case "clarify3":
      return card.clarify3 ?? "";
    case "cardNumber":
      return card.cardNumber ?? "";
    case "setName":
      return card.setName ?? "";
    case "artist":
      return card.artist ?? "";
    case "art":
      return card.art ?? "";
    case "flavor":
      return card.flavor ?? "";
    case "inspiration":
      return card.inspiration ?? "";
    case "pool":
      return card.pool;
  }
}

function colorSlot(key: SheetColumnKey): number | null {
  switch (key) {
    case "color1":
      return 0;
    case "color2":
      return 1;
    case "color3":
      return 2;
    case "color4":
      return 3;
    default:
      return null;
  }
}

/**
 * What to send to the server when a cell is edited. Colors are saved as a
 * whole list, so editing one color cell sends all four slots.
 */
export function editRequest(
  card: AdminCardRow,
  key: SheetColumnKey,
  raw: string
): { field: string; value: string | string[] } {
  const slot = colorSlot(key);

  if (slot === null) return { field: key, value: raw };

  const slots = Array.from({ length: 4 }, (_, i) => card.palette[i] ?? "");

  slots[slot] = raw;

  return { field: "colors", value: slots };
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

export type SortState = {
  key: SheetColumnKey;
  direction: "asc" | "desc";
};

/** Set order, then card number: the order a set is printed in. */
export const DEFAULT_SORT: SortState = { key: "setName", direction: "asc" };

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

function compareNumbers(a: number, b: number) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/**
 * Sorts the sheet by one column. Empty cells always go last, and ties fall
 * back to set + card number so the order never jumps around.
 */
export function sortRows<T extends AdminCardRow>(
  rows: T[],
  sort: SortState
): T[] {
  const dir = sort.direction === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    const tie = () => compareCards(a, b, "setName", "asc");

    switch (sort.key) {
      case "setName":
        return compareCards(a, b, "setName", sort.direction);

      case "power":
        return compareNumbers(a.power, b.power) * dir || tie();

      case "bulk":
        return compareNumbers(a.bulk, b.bulk) * dir || tie();

      case "cardNumber": {
        const byNumber =
          compareNumbers(parseCardNumber(a.cardNumber), parseCardNumber(b.cardNumber)) *
          dir;

        return byNumber || compareSetCodes(a.setName, b.setName) || a.name.localeCompare(b.name);
      }

      case "pool": {
        const order = (pool: string) => {
          const index = (CARD_POOLS as readonly string[]).indexOf(pool);
          return index === -1 ? CARD_POOLS.length : index;
        };

        return compareNumbers(order(a.pool), order(b.pool)) * dir || tie();
      }

      default: {
        const x = cellValue(a, sort.key);
        const y = cellValue(b, sort.key);

        if (!x && !y) return tie();
        if (!x) return 1;
        if (!y) return -1;

        return collator.compare(x, y) * dir || tie();
      }
    }
  });
}
