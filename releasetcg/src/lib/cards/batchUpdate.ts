import { CARD_COLORS, CARD_POOLS } from "./options";

/** The most cards one batch edit may touch. */
export const MAX_BATCH_SIZE = 500;

/**
 * Values an admin can change on many cards at once. Every key is optional:
 * only the keys present are changed. Text fields and colors treat an empty
 * string as "clear it".
 */
export type BatchChanges = {
  pool?: string;
  power?: number;
  bulk?: number;
  /** Replaces all four color slots, in order (empty slots are cleared). */
  colors?: string[];
  trait?: string;
  artist?: string;
  setName?: string;
};

/** Column updates for the `cards` table. */
export type BatchPatch = Record<string, string | number | null>;

export type BatchResult =
  | { ok: true; patch: BatchPatch }
  | { ok: false; error: string };

const MAX_TEXT_LENGTH = 200;

function text(value: unknown, label: string): string | null | Error {
  if (typeof value !== "string") {
    return new Error(`${label} must be text`);
  }

  const trimmed = value.trim();

  if (trimmed.length > MAX_TEXT_LENGTH) {
    return new Error(`${label} is too long`);
  }

  return trimmed === "" ? null : trimmed;
}

function stat(value: unknown, label: string): number | Error {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0 ||
    value > 99
  ) {
    return new Error(`${label} must be a whole number from 0 to 99`);
  }

  return value;
}

/**
 * Check a batch edit from the client and turn it into column updates.
 * Unknown keys are rejected so a typo can never silently do nothing, and
 * only the fields listed here can ever be written by this route.
 */
export function buildBatchPatch(changes: unknown): BatchResult {
  if (typeof changes !== "object" || changes === null || Array.isArray(changes)) {
    return { ok: false, error: "Nothing to change" };
  }

  const input = changes as Record<string, unknown>;

  const patch: BatchPatch = {};

  for (const key of Object.keys(input)) {
    const value = input[key];

    if (value === undefined) {
      continue;
    }

    switch (key) {
      case "pool": {
        if (
          typeof value !== "string" ||
          !(CARD_POOLS as readonly string[]).includes(value)
        ) {
          return { ok: false, error: "Unknown pool" };
        }

        patch.pool = value;

        break;
      }

      case "power":
      case "bulk": {
        const result = stat(value, key === "power" ? "Power" : "Bulk");

        if (result instanceof Error) {
          return { ok: false, error: result.message };
        }

        patch[key === "power" ? "Power" : "Bulk"] = result;

        break;
      }

      case "colors": {
        if (!Array.isArray(value) || value.length > 4) {
          return { ok: false, error: "Colors must be a list of up to 4" };
        }

        for (const color of value) {
          if (
            typeof color !== "string" ||
            (color !== "" && !(CARD_COLORS as readonly string[]).includes(color))
          ) {
            return { ok: false, error: "Unknown color" };
          }
        }

        const filled = value.filter(color => color !== "");

        if (new Set(filled).size !== filled.length) {
          return { ok: false, error: "A color can only be used once" };
        }

        // Pack the chosen colors to the front: no gaps between slots.
        for (let slot = 0; slot < 4; slot++) {
          patch[`Color${slot + 1}`] = filled[slot] ?? null;
        }

        break;
      }

      case "trait":
      case "artist":
      case "setName": {
        const label = { trait: "Trait", artist: "Artist", setName: "Set name" }[key];

        const result = text(value, label);

        if (result instanceof Error) {
          return { ok: false, error: result.message };
        }

        patch[{ trait: "Trait", artist: "Artist", setName: "SetName" }[key]] = result;

        break;
      }

      default:
        return { ok: false, error: `Cannot batch edit "${key}"` };
    }
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "Pick at least one thing to change" };
  }

  return { ok: true, patch };
}

/** Check the list of card ids sent with a batch edit. */
export function validateBatchIds(
  ids: unknown,
): { ok: true; ids: string[] } | { ok: false; error: string } {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, error: "No cards selected" };
  }

  if (ids.length > MAX_BATCH_SIZE) {
    return {
      ok: false,
      error: `Select at most ${MAX_BATCH_SIZE} cards at a time`,
    };
  }

  if (!ids.every(id => typeof id === "string" && id.length > 0)) {
    return { ok: false, error: "Invalid card id" };
  }

  return { ok: true, ids: [...new Set(ids as string[])] };
}
