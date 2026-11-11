import {
    SETS,
    compareSetCodes,
    findSet,
    isSetCode,
    setGalleryHref,
    setLabel,
    sortSetCodes,
} from "@/lib/sets/sets";

describe("set registry", () => {

    it("has unique tags and numbers", () => {

        expect(new Set(SETS.map(set => set.code)).size).toBe(SETS.length);
        expect(new Set(SETS.map(set => set.number)).size).toBe(SETS.length);

    });

    it("uses tags the database and image names can rely on", () => {

        for (const set of SETS) {
            expect(set.code).toMatch(/^[A-Z0-9]{2,8}$/);
            expect(set.cardCount).toBeGreaterThan(0);
        }

    });

    it("numbers the sets 1, 2, 3 with no gaps", () => {

        const numbers = SETS.map(set => set.number).sort((a, b) => a - b);

        expect(numbers).toEqual(numbers.map((_, index) => index + 1));

    });

    it("knows the first set is IRFO", () => {

        expect(findSet("IRFO")?.number).toBe(1);

    });

});

describe("findSet", () => {

    it("ignores capitals and spaces", () => {

        expect(findSet(" irfo ")?.code).toBe("IRFO");

    });

    it("returns nothing for unknown or empty tags", () => {

        expect(findSet("NOPE")).toBeUndefined();
        expect(findSet("")).toBeUndefined();
        expect(findSet(null)).toBeUndefined();

    });

    it("checks tags exactly with isSetCode", () => {

        expect(isSetCode("IRFO")).toBe(true);
        expect(isSetCode("irfo")).toBe(false);

    });

});

describe("labels and links", () => {

    it("labels sets with their number and name", () => {

        expect(setLabel("IRFO")).toBe("Set 1: Iridescent Foray");

    });

    it("shows unknown tags as they are", () => {

        expect(setLabel("ZZZZ")).toBe("ZZZZ");
        expect(setLabel(null)).toBe("No set");

    });

    it("links to the gallery filtered to the set", () => {

        expect(setGalleryHref(SETS[0])).toBe("/gallery?set=IRFO");

    });

});

describe("ordering sets", () => {

    it("puts known sets first, then unknown ones alphabetically, then no set", () => {

        expect(sortSetCodes(["ZETA", "IRFO", "ALPHA"])).toEqual([
            "IRFO",
            "ALPHA",
            "ZETA",
        ]);

        expect(compareSetCodes(null, "IRFO")).toBeGreaterThan(0);
        expect(compareSetCodes("ALPHA", null)).toBeLessThan(0);
        expect(compareSetCodes(null, undefined)).toBe(0);

    });

});
