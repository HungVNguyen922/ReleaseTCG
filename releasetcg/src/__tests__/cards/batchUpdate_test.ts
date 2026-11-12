import {
  MAX_BATCH_SIZE,
  buildBatchPatch,
  validateBatchIds,
} from "@/lib/cards/batchUpdate";

describe("buildBatchPatch", () => {
  it("maps pool to its column", () => {
    expect(buildBatchPatch({ pool: "public" })).toEqual({
      ok: true,
      patch: { pool: "public" },
    });
  });

  it("rejects unknown pools", () => {
    expect(buildBatchPatch({ pool: "everyone" }).ok).toBe(false);
  });

  it("maps stats to capitalised columns and checks the range", () => {
    expect(buildBatchPatch({ power: 3, bulk: 0 })).toEqual({
      ok: true,
      patch: { Power: 3, Bulk: 0 },
    });

    expect(buildBatchPatch({ power: -1 }).ok).toBe(false);
    expect(buildBatchPatch({ power: 1.5 }).ok).toBe(false);
    expect(buildBatchPatch({ bulk: 100 }).ok).toBe(false);
    expect(buildBatchPatch({ bulk: "3" }).ok).toBe(false);
  });

  it("packs colors to the front and clears the unused slots", () => {
    expect(buildBatchPatch({ colors: ["", "Red", "Blue"] })).toEqual({
      ok: true,
      patch: { Color1: "Red", Color2: "Blue", Color3: null, Color4: null },
    });
  });

  it("clears every color slot when none are picked", () => {
    expect(buildBatchPatch({ colors: [] })).toEqual({
      ok: true,
      patch: { Color1: null, Color2: null, Color3: null, Color4: null },
    });
  });

  it("rejects unknown or repeated colors", () => {
    expect(buildBatchPatch({ colors: ["Purple"] }).ok).toBe(false);
    expect(buildBatchPatch({ colors: ["Red", "Red"] }).ok).toBe(false);
    expect(buildBatchPatch({ colors: ["Red", "", "", "", "Blue"] }).ok).toBe(false);
  });

  it("trims text and turns blank text into null", () => {
    expect(
      buildBatchPatch({ trait: "  Fire  ", artist: "", setName: "IRFO" }),
    ).toEqual({
      ok: true,
      patch: { Trait: "Fire", Artist: null, SetName: "IRFO" },
    });
  });

  it("rejects non-text and over-long text", () => {
    expect(buildBatchPatch({ trait: 5 }).ok).toBe(false);
    expect(buildBatchPatch({ artist: "x".repeat(201) }).ok).toBe(false);
  });

  it("refuses anything it does not know, including per-card fields", () => {
    expect(buildBatchPatch({ name: "Oops" }).ok).toBe(false);
    expect(buildBatchPatch({ id: "1" }).ok).toBe(false);
    expect(buildBatchPatch({ cardNumber: "5/81" }).ok).toBe(false);
  });

  it("needs at least one change", () => {
    expect(buildBatchPatch({}).ok).toBe(false);
    expect(buildBatchPatch(null).ok).toBe(false);
    expect(buildBatchPatch([]).ok).toBe(false);
    expect(buildBatchPatch({ pool: undefined }).ok).toBe(false);
  });

  it("combines several changes", () => {
    const result = buildBatchPatch({ pool: "beta", power: 2, colors: ["Green"] });

    expect(result).toEqual({
      ok: true,
      patch: {
        pool: "beta",
        Power: 2,
        Color1: "Green",
        Color2: null,
        Color3: null,
        Color4: null,
      },
    });
  });
});

describe("validateBatchIds", () => {
  it("accepts a list and removes duplicates", () => {
    expect(validateBatchIds(["a", "b", "a"])).toEqual({ ok: true, ids: ["a", "b"] });
  });

  it("rejects empty, non-list and invalid ids", () => {
    expect(validateBatchIds([]).ok).toBe(false);
    expect(validateBatchIds("a").ok).toBe(false);
    expect(validateBatchIds([1]).ok).toBe(false);
    expect(validateBatchIds([""]).ok).toBe(false);
  });

  it("caps the batch size", () => {
    const many = Array.from({ length: MAX_BATCH_SIZE + 1 }, (_, i) => `id${i}`);

    expect(validateBatchIds(many).ok).toBe(false);
    expect(validateBatchIds(many.slice(0, MAX_BATCH_SIZE)).ok).toBe(true);
  });
});
