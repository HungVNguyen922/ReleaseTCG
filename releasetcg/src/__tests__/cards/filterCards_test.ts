import { filterCards, matchesSearch, parseSearch } from "@/lib/cards/filterCards";
import type { CardFilterValues } from "@/types/cards";

const base = {
  name: "Searing Fish",
  power: 3,
  bulk: 2,
  trait: "BLK 3 & 4",
  effect1: "Draw 1 card when this is Parried.",
  effect2: null,
  clarify1: "This is also a Bulk 3.",
  clarify2: null,
  clarify3: null,
  flavor: "It was hot.",
  inspiration: null,
  artist: "InfiniteUno",
  art: "SearingFish.png",
  cardNumber: "1/81",
  setName: "IRFO",
  palette: ["Red", "Orange"],
  pool: "draft",
};

const other = {
  ...base,
  name: "Sandy Dues",
  power: 5,
  bulk: 1,
  trait: null,
  effect1: "Deal 2 DMG.",
  clarify1: null,
  flavor: null,
  artist: "Someone Else",
  art: "sandy.png",
  cardNumber: "2/27",
  setName: "PRBR",
  palette: ["Blue"],
  pool: "public",
};

const filters = (over: Partial<CardFilterValues> = {}): CardFilterValues => ({
  search: "",
  pool: "all",
  power: "all",
  bulk: "all",
  colors: [],
  colorMode: "contains",
  ...over,
});

describe("matchesSearch", () => {
  it("matches an empty search", () => {
    expect(matchesSearch(base, "")).toBe(true);
    expect(matchesSearch(base, "   ")).toBe(true);
  });

  it("finds words in any field", () => {
    expect(matchesSearch(base, "parried")).toBe(true);
    expect(matchesSearch(base, "infiniteuno")).toBe(true);
    expect(matchesSearch(base, "searingfish.png")).toBe(true);
    expect(matchesSearch(base, "hot")).toBe(true);
    expect(matchesSearch(base, "orange")).toBe(true);
    expect(matchesSearch(base, "draft")).toBe(true);
    expect(matchesSearch(base, "nonsense")).toBe(false);
  });

  it("finds a set by tag or by name", () => {
    expect(matchesSearch(base, "irfo")).toBe(true);
    expect(matchesSearch(base, "iridescent")).toBe(true);
    expect(matchesSearch(other, "iridescent")).toBe(false);
  });

  it("needs every word to match, in any order", () => {
    expect(matchesSearch(base, "draw parried")).toBe(true);
    expect(matchesSearch(base, "parried draw")).toBe(true);
    expect(matchesSearch(base, "draw dmg")).toBe(false);
  });

  it("treats quotes as an exact phrase", () => {
    expect(matchesSearch(base, '"draw 1 card"')).toBe(true);
    expect(matchesSearch(base, '"card draw"')).toBe(false);
  });

  it("can leave things out with a minus sign", () => {
    expect(matchesSearch(base, "-dmg")).toBe(true);
    expect(matchesSearch(other, "-dmg")).toBe(false);
    expect(matchesSearch(base, "draw -parried")).toBe(false);
  });

  it("searches one field with a prefix", () => {
    expect(matchesSearch(base, "effect:parried")).toBe(true);
    expect(matchesSearch(base, "effect:bulk")).toBe(true); // clarify text counts
    expect(matchesSearch(base, "trait:parried")).toBe(false);
    expect(matchesSearch(base, "trait:blk")).toBe(true);
    expect(matchesSearch(base, "artist:uno")).toBe(true);
    expect(matchesSearch(base, "name:fish")).toBe(true);
    expect(matchesSearch(base, "flavor:hot")).toBe(true);
    expect(matchesSearch(base, 'effect:"draw 1"')).toBe(true);
    expect(matchesSearch(base, "-effect:parried")).toBe(false);
  });

  it("filters by set", () => {
    expect(matchesSearch(base, "set:irfo")).toBe(true);
    expect(matchesSearch(other, "set:irfo")).toBe(false);
    expect(matchesSearch(other, "set:prbr")).toBe(true);
    expect(matchesSearch(other, "set:2")).toBe(true);
    expect(matchesSearch(base, "set:2")).toBe(false);
    expect(matchesSearch(base, "set:foray")).toBe(true);
  });

  it("filters by color, pool, and number", () => {
    expect(matchesSearch(base, "color:red")).toBe(true);
    expect(matchesSearch(other, "color:red")).toBe(false);
    expect(matchesSearch(base, "pool:draft")).toBe(true);
    expect(matchesSearch(other, "pool:draft")).toBe(false);
    expect(matchesSearch(other, "number:2/27")).toBe(true);
  });

  it("compares power and bulk", () => {
    expect(matchesSearch(base, "power:3")).toBe(true);
    expect(matchesSearch(base, "power:>=3")).toBe(true);
    expect(matchesSearch(base, "power:>3")).toBe(false);
    expect(matchesSearch(other, "power:>3")).toBe(true);
    expect(matchesSearch(base, "bulk:<=2")).toBe(true);
    expect(matchesSearch(other, "bulk:<1")).toBe(false);
    expect(matchesSearch(base, "power:abc")).toBe(false);
  });

  it("treats unknown prefixes as plain text and ignores a prefix being typed", () => {
    expect(matchesSearch(base, "foo:bar")).toBe(false);
    expect(matchesSearch(base, "set:")).toBe(true);
    expect(matchesSearch(base, 'draw "unclosed')).toBe(false);
  });
});

describe("parseSearch", () => {
  it("splits a search into terms", () => {
    expect(parseSearch('set:IRFO -trait:blk "draw 1" parry')).toEqual([
      { field: "set", text: "irfo", negate: false },
      { field: "trait", text: "blk", negate: true },
      { field: null, text: "draw 1", negate: false },
      { field: null, text: "parry", negate: false },
    ]);
  });
});

describe("filterCards", () => {
  const cards = [base, other];

  it("combines search with the other filters", () => {
    expect(filterCards(cards, filters({ search: "effect:draw" }))).toEqual([base]);
    expect(filterCards(cards, filters({ pool: "public" }))).toEqual([other]);
    expect(filterCards(cards, filters({ colors: ["Blue"] }))).toEqual([other]);
  });

  it("filters by set", () => {
    expect(filterCards(cards, filters({ setName: "IRFO" }))).toEqual([base]);
    expect(filterCards(cards, filters({ setName: "prbr" }))).toEqual([other]);
    expect(filterCards(cards, filters({ setName: "all" })).length).toBe(2);
    expect(filterCards(cards, filters()).length).toBe(2);
  });
});
