import { parseCardNumber, sortCards } from "@/lib/cards/sortCards";

type TestCard = {
  name: string;
  power: number;
  bulk: number;
  setName: string | null;
  cardNumber: string | null;
};

function card(
  name: string,
  cardNumber: string | null,
  overrides: Partial<TestCard> = {}
): TestCard {
  return {
    name,
    power: 1,
    bulk: 1,
    setName: "IRFO",
    cardNumber,
    ...overrides,
  };
}

describe("parseCardNumber", () => {
  it("reads the leading number", () => {
    expect(parseCardNumber("12/81")).toBe(12);
    expect(parseCardNumber("7")).toBe(7);
    expect(parseCardNumber(" 03/81")).toBe(3);
  });

  it("treats missing or unreadable numbers as last", () => {
    expect(parseCardNumber(null)).toBe(Number.POSITIVE_INFINITY);
    expect(parseCardNumber("")).toBe(Number.POSITIVE_INFINITY);
    expect(parseCardNumber("promo")).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("sortCards", () => {
  it("sorts a set by card number numerically, not alphabetically", () => {
    const cards = [
      card("C", "10/81"),
      card("A", "2/81"),
      card("B", "1/81"),
    ];

    expect(sortCards(cards, "setName", "asc").map((c) => c.cardNumber)).toEqual(
      ["1/81", "2/81", "10/81"]
    );
  });

  it("groups by set name before card number", () => {
    const cards = [
      card("B1", "1/10", { setName: "BETA" }),
      card("A2", "2/81", { setName: "ALPHA" }),
      card("A1", "1/81", { setName: "ALPHA" }),
    ];

    expect(sortCards(cards, "setName", "asc").map((c) => c.name)).toEqual([
      "A1",
      "A2",
      "B1",
    ]);
  });

  it("puts cards without a number last when ascending", () => {
    const cards = [card("None", null), card("One", "1/81")];

    expect(sortCards(cards, "setName", "asc").map((c) => c.name)).toEqual([
      "One",
      "None",
    ]);
  });

  it("reverses set and number when descending", () => {
    const cards = [card("A", "1/81"), card("B", "2/81"), card("C", "3/81")];

    expect(sortCards(cards, "setName", "desc").map((c) => c.name)).toEqual([
      "C",
      "B",
      "A",
    ]);
  });

  it("breaks power ties by card number, in a stable order", () => {
    const cards = [
      card("Three", "3/81", { power: 2 }),
      card("One", "1/81", { power: 2 }),
      card("Low", "2/81", { power: 1 }),
    ];

    expect(sortCards(cards, "power", "asc").map((c) => c.name)).toEqual([
      "Low",
      "One",
      "Three",
    ]);

    // Descending reverses the power order but keeps ties in number order.
    expect(sortCards(cards, "power", "desc").map((c) => c.name)).toEqual([
      "One",
      "Three",
      "Low",
    ]);
  });

  it("sorts by name", () => {
    const cards = [card("Beta", "1/81"), card("Alpha", "2/81")];

    expect(sortCards(cards, "name", "asc").map((c) => c.name)).toEqual([
      "Alpha",
      "Beta",
    ]);
  });

  it("does not modify the original array", () => {
    const cards = [card("B", "2/81"), card("A", "1/81")];

    sortCards(cards, "setName", "asc");

    expect(cards.map((c) => c.name)).toEqual(["B", "A"]);
  });
});
