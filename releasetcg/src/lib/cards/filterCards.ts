import { CardFilterValues } from "@/types/cards";

import { findSet } from "@/lib/sets/sets";

import { matchesColors } from "./colorFilter";

type CardLike = {
  name: string;
  trait?: string | null;
  effect1?: string | null;
  effect2?: string | null;
  clarify1?: string | null;
  clarify2?: string | null;
  clarify3?: string | null;
  flavor?: string | null;
  inspiration?: string | null;
  artist?: string | null;
  art?: string | null;
  cardNumber?: string | null;
  setName?: string | null;

  power: number;
  bulk: number;

  colors?: string[];
  palette?: string[];

  pool?: string;
};

function getColors(card: CardLike): string[] {
  return card.colors ?? card.palette ?? [];
}

// ---------------------------------------------------------------------------
// Search
//
// A search is a list of terms separated by spaces. A card must match ALL of
// them. Each term can be:
//
//   parry            plain word: looked for in every text field of the card
//   "draw 1"         exact phrase (quotes keep the words together)
//   -parry           NOT: leave out cards that contain it
//   effect:parry     only look in effect + clarify text
//   set:IRFO         a set tag, set name, or set number (set:1)
//   trait:blk        name:  flavor:  inspiration:  artist:  art:  number:
//   color:red        pool:draft
//   power:3  power:>=3  bulk:<2     numbers (>, >=, <, <=, =)
//
// Everything is case-insensitive. Unknown prefixes ("foo:bar") are searched
// as plain text.
// ---------------------------------------------------------------------------

type SearchField =
  | "name"
  | "trait"
  | "effect"
  | "flavor"
  | "inspiration"
  | "artist"
  | "art"
  | "set"
  | "number"
  | "color"
  | "pool"
  | "power"
  | "bulk";

const FIELD_ALIASES: Record<string, SearchField> = {
  name: "name",
  trait: "trait",
  effect: "effect",
  effects: "effect",
  text: "effect",
  rules: "effect",
  flavor: "flavor",
  flavour: "flavor",
  inspiration: "inspiration",
  artist: "artist",
  art: "art",
  set: "set",
  number: "number",
  num: "number",
  color: "color",
  colors: "color",
  colour: "color",
  pool: "pool",
  power: "power",
  pow: "power",
  bulk: "bulk",
};

export type SearchTerm = {
  field: SearchField | null;
  text: string;
  negate: boolean;
};

const TOKEN = /(-?)(?:([A-Za-z]+):)?(?:"([^"]*)"|(\S+))/g;

/** Turns what was typed in the search box into terms. Call once per search. */
export function parseSearch(query: string): SearchTerm[] {
  const terms: SearchTerm[] = [];

  for (const match of query.matchAll(TOKEN)) {
    const negate = match[1] === "-";
    const prefix = match[2];
    const quoted = match[3];
    const bare = match[4];

    // "set:" with nothing after it yet (still typing): ignore it.
    if (!prefix && bare && /^[A-Za-z]+:$/.test(bare)) {
      if (FIELD_ALIASES[bare.slice(0, -1).toLowerCase()]) continue;
    }

    const field = prefix ? (FIELD_ALIASES[prefix.toLowerCase()] ?? null) : null;

    let text = quoted ?? bare ?? "";

    // An unknown prefix is just part of the word.
    if (prefix && !field) text = `${prefix}:${text}`;

    // An opening quote that was never closed.
    text = text.replace(/^"/, "").trim().toLowerCase();

    if (!text) continue;

    terms.push({ field, text, negate });
  }

  return terms;
}

function lower(values: (string | null | undefined)[]) {
  return values.filter(Boolean).join("\n").toLowerCase();
}

function generalText(card: CardLike) {
  const set = findSet(card.setName);

  return lower([
    card.name,
    card.trait,
    card.effect1,
    card.effect2,
    card.clarify1,
    card.clarify2,
    card.clarify3,
    card.flavor,
    card.inspiration,
    card.artist,
    card.art,
    card.cardNumber,
    card.setName,
    set?.name,
    ...getColors(card),
    card.pool,
  ]);
}

const NUMBER_TEST = /^(>=|<=|>|<|=)?\s*(\d+)$/;

function matchesNumber(value: number, text: string) {
  const match = NUMBER_TEST.exec(text);

  if (!match) return false;

  const target = Number(match[2]);

  switch (match[1]) {
    case ">":
      return value > target;
    case ">=":
      return value >= target;
    case "<":
      return value < target;
    case "<=":
      return value <= target;
    default:
      return value === target;
  }
}

function matchesField(card: CardLike, field: SearchField, text: string) {
  switch (field) {
    case "name":
      return lower([card.name]).includes(text);
    case "trait":
      return lower([card.trait]).includes(text);
    case "effect":
      return lower([
        card.effect1,
        card.effect2,
        card.clarify1,
        card.clarify2,
        card.clarify3,
      ]).includes(text);
    case "flavor":
      return lower([card.flavor]).includes(text);
    case "inspiration":
      return lower([card.inspiration]).includes(text);
    case "artist":
      return lower([card.artist]).includes(text);
    case "art":
      return lower([card.art]).includes(text);
    case "number":
      return lower([card.cardNumber]).includes(text);
    case "color":
      return lower(getColors(card)).includes(text);
    case "pool":
      return lower([card.pool]).includes(text);
    case "power":
      return matchesNumber(card.power, text);
    case "bulk":
      return matchesNumber(card.bulk, text);
    case "set": {
      const set = findSet(card.setName);

      if (set && /^\d+$/.test(text) && set.number === Number(text)) {
        return true;
      }

      return lower([card.setName, set?.name]).includes(text);
    }
  }
}

/** Does a card satisfy every term? */
export function matchesTerms(card: CardLike, terms: SearchTerm[]) {
  if (terms.length === 0) return true;

  let everything: string | null = null;

  for (const term of terms) {
    let found: boolean;

    if (term.field === null) {
      everything ??= generalText(card);
      found = everything.includes(term.text);
    } else {
      found = matchesField(card, term.field, term.text);
    }

    if (found === term.negate) return false;
  }

  return true;
}

export function matchesSearch(card: CardLike, query: string) {
  return matchesTerms(card, parseSearch(query));
}

// ---------------------------------------------------------------------------

function matchesPool(card: CardLike, pool?: string) {
  if (!pool || pool === "all") return true;
  return card.pool === pool;
}

function matchesSet(card: CardLike, setName?: string) {
  if (!setName || setName === "all") return true;
  return card.setName?.trim().toUpperCase() === setName.toUpperCase();
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
  const terms = parseSearch(filters.search);

  return cards.filter((card) => {
    return (
      matchesTerms(card, terms) &&
      matchesPool(card, filters.pool) &&
      matchesSet(card, filters.setName) &&
      matchesPower(card, filters.power) &&
      matchesBulk(card, filters.bulk) &&
      matchesColors(getColors(card), filters.colors, filters.colorMode)
    );
  });
}
