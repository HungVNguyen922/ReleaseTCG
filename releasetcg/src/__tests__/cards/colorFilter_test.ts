import {
  matchesColors,
  toggleColor,
  MAX_FILTER_COLORS,
} from "@/lib/cards/colorFilter";
import { filterCards } from "@/lib/cards/filterCards";
import type { CardFilterValues } from "@/types/cards";

describe("matchesColors", () => {
  it("matches every card when no colors are selected", () => {
    expect(matchesColors(["Red", "Blue"], [], "contains")).toBe(true);
    expect(matchesColors(["Red", "Blue"], [], "exact")).toBe(true);
    expect(matchesColors([], [], "exact")).toBe(true);
  });

  describe("contains", () => {
    it("matches cards that have all of the selected colors", () => {
      expect(matchesColors(["Red", "Blue"], ["Red"], "contains")).toBe(true);
      expect(
        matchesColors(["Red", "Blue", "Green"], ["Red", "Blue"], "contains")
      ).toBe(true);
    });

    it("rejects cards missing any selected color", () => {
      expect(matchesColors(["Red"], ["Red", "Blue"], "contains")).toBe(false);
      expect(matchesColors(["Green", "Blue"], ["Red"], "contains")).toBe(false);
    });
  });

  describe("exact", () => {
    it("matches only the same set of colors, in any order", () => {
      expect(matchesColors(["Red", "Blue"], ["Blue", "Red"], "exact")).toBe(
        true
      );
      expect(matchesColors(["Red"], ["Red"], "exact")).toBe(true);
    });

    it("rejects cards with extra or missing colors", () => {
      expect(
        matchesColors(["Red", "Blue", "Green"], ["Red", "Blue"], "exact")
      ).toBe(false);
      expect(matchesColors(["Red"], ["Red", "Blue"], "exact")).toBe(false);
      expect(matchesColors(["Red", "Blue"], ["Red", "Green"], "exact")).toBe(
        false
      );
    });
  });
});

describe("toggleColor", () => {
  it("adds and removes colors", () => {
    expect(toggleColor([], "Red")).toEqual(["Red"]);
    expect(toggleColor(["Red", "Blue"], "Red")).toEqual(["Blue"]);
  });

  it("does not grow past the maximum", () => {
    const full = ["Red", "Orange", "Yellow", "Green"];

    expect(full).toHaveLength(MAX_FILTER_COLORS);
    expect(toggleColor(full, "Blue")).toEqual(full);
  });

  it("still lets you remove a color when full", () => {
    const full = ["Red", "Orange", "Yellow", "Green"];

    expect(toggleColor(full, "Green")).toEqual(["Red", "Orange", "Yellow"]);
  });
});

describe("filterCards color filtering", () => {
  const base: CardFilterValues = {
    search: "",
    pool: "all",
    power: "all",
    bulk: "all",
    colors: [],
    colorMode: "contains",
  };

  const cards = [
    { name: "Mono Red", power: 1, bulk: 1, colors: ["Red"] },
    { name: "Red Blue", power: 2, bulk: 2, colors: ["Red", "Blue"] },
    { name: "Red Blue Green", power: 3, bulk: 3, colors: ["Red", "Blue", "Green"] },
    // Admin summaries use `palette` instead of `colors`.
    { name: "Admin Red Blue", power: 2, bulk: 2, palette: ["Blue", "Red"] },
  ];

  it("filters by combo in contains mode", () => {
    const result = filterCards(cards, {
      ...base,
      colors: ["Red", "Blue"],
    }).map((card) => card.name);

    expect(result).toEqual(["Red Blue", "Red Blue Green", "Admin Red Blue"]);
  });

  it("filters by exact palette in exact mode", () => {
    const result = filterCards(cards, {
      ...base,
      colors: ["Red", "Blue"],
      colorMode: "exact",
    }).map((card) => card.name);

    expect(result).toEqual(["Red Blue", "Admin Red Blue"]);
  });

  it("finds mono-colored cards with a single exact color", () => {
    const result = filterCards(cards, {
      ...base,
      colors: ["Red"],
      colorMode: "exact",
    }).map((card) => card.name);

    expect(result).toEqual(["Mono Red"]);
  });
});
