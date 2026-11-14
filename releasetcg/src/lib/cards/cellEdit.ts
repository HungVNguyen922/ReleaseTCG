import { findSet } from "@/lib/sets/sets";

import { parseCardNumber } from "@/lib/cards/import/cardCsv";

import { CARD_COLORS, CARD_POOLS } from "./options";

/** Same limit the CSV importer uses. */
export const MAX_CELL_STAT = 8;

/** Text columns that are simply "text, or empty to clear". */
const TEXT_COLUMNS = {
  trait: { column: "Trait", label: "Trait", max: 200 },
  effect1: { column: "Effect1", label: "Effect1", max: 2000 },
  effect2: { column: "Effect2", label: "Effect2", max: 2000 },
  clarify1: { column: "Clarify1", label: "Clarify1", max: 2000 },
  clarify2: { column: "Clarify2", label: "Clarify2", max: 2000 },
  clarify3: { column: "Clarify3", label: "Clarify3", max: 2000 },
  flavor: { column: "Flavor", label: "Flavor", max: 2000 },
  inspiration: { column: "Inspiration", label: "Inspiration", max: 2000 },
  artist: { column: "Artist", label: "Artist", max: 200 },
  art: { column: "Art", label: "Art", max: 200 },
} as const;

type TextField = keyof typeof TEXT_COLUMNS;

/** Column updates for the `cards` table. */
export type CellPatch = Record<string, string | number | null>;

export type CellResult =
  | { ok: true; patch: CellPatch }
  | { ok: false; error: string };

function fail(error: string): CellResult {
  return { ok: false, error };
}

function isTextField(field: string): field is TextField {
  return Object.prototype.hasOwnProperty.call(TEXT_COLUMNS, field);
}

const COLOR_BY_NAME = new Map<string, string>(
  CARD_COLORS.map((color) => [color.toLowerCase(), color])
);

/**
 * Checks one edited cell and turns it into column updates.
 *
 * `field` is one of: name, power, bulk, colors, trait, effect1, effect2,
 * clarify1, clarify2, clarify3, flavor, inspiration, artist, art,
 * cardNumber, setName, pool.
 *
 * Colors are edited as a whole list (up to 4, in slot order).
 */
export function buildCellPatch(field: unknown, value: unknown): CellResult {
  if (typeof field !== "string") return fail("Missing field");

  if (isTextField(field)) {
    const { column, label, max } = TEXT_COLUMNS[field];

    if (typeof value !== "string") return fail(`${label} must be text`);

    const trimmed = value.trim();

    if (trimmed.length > max) {
      return fail(`${label} is too long (max ${max} characters)`);
    }

    return { ok: true, patch: { [column]: trimmed === "" ? null : trimmed } };
  }

  switch (field) {
    case "name": {
      if (typeof value !== "string") return fail("Name must be text");

      const trimmed = value.trim();

      if (!trimmed) return fail("A card needs a name.");
      if (trimmed.length > 200) return fail("Name is too long");

      return { ok: true, patch: { Name: trimmed } };
    }

    case "power":
    case "bulk": {
      const label = field === "power" ? "Power" : "Bulk";

      const number =
        typeof value === "number"
          ? value
          : typeof value === "string" && /^\s*\d+\s*$/.test(value)
            ? Number(value)
            : Number.NaN;

      if (!Number.isInteger(number) || number < 0 || number > MAX_CELL_STAT) {
        return fail(`${label} must be a whole number from 0 to ${MAX_CELL_STAT}.`);
      }

      return { ok: true, patch: { [label]: number } };
    }

    case "colors": {
      if (!Array.isArray(value) || value.length > 4) {
        return fail("Colors must be a list of up to 4");
      }

      const colors: string[] = [];

      for (const raw of value) {
        if (typeof raw !== "string") return fail("Unknown color");

        const trimmed = raw.trim();

        if (!trimmed) continue;

        const color = COLOR_BY_NAME.get(trimmed.toLowerCase());

        if (!color) {
          return fail(`"${trimmed}" isn't a color. Use ${CARD_COLORS.join(", ")}.`);
        }

        if (colors.includes(color)) return fail(`${color} is listed twice.`);

        colors.push(color);
      }

      if (colors.length === 0) return fail("A card needs at least one color.");

      // Colors are packed to the front: no gaps between slots.
      const patch: CellPatch = {};

      for (let slot = 0; slot < 4; slot++) {
        patch[`Color${slot + 1}`] = colors[slot] ?? null;
      }

      return { ok: true, patch };
    }

    case "cardNumber": {
      if (typeof value !== "string") return fail("Card number must be text");

      const trimmed = value.trim();

      if (!trimmed) return fail("A card needs a card number.");

      const parsed = parseCardNumber(trimmed);

      if (!parsed) return fail(`"${trimmed}" should look like "5/81".`);

      if (parsed.number < 1 || parsed.number > parsed.total) {
        return fail(
          `Card number ${parsed.number} isn't between 1 and ${parsed.total}.`
        );
      }

      return { ok: true, patch: { CardNumber: parsed.text } };
    }

    case "setName": {
      if (typeof value !== "string") return fail("Set must be text");

      const trimmed = value.trim();

      if (!trimmed) return fail("A card needs a set.");

      const set = findSet(trimmed);

      if (!set) {
        return fail(
          `Unknown set "${trimmed}". Add it to src/lib/sets/sets.ts first.`
        );
      }

      return { ok: true, patch: { SetName: set.code } };
    }

    case "pool": {
      if (
        typeof value !== "string" ||
        !(CARD_POOLS as readonly string[]).includes(value)
      ) {
        return fail("Unknown pool");
      }

      return { ok: true, patch: { pool: value } };
    }

    default:
      return fail(`Cannot edit "${field}"`);
  }
}
