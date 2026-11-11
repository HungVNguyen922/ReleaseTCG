import { planImport, type ExistingCard } from "@/lib/cards/import/planImport";
import type { CardInsertRow } from "@/lib/cards/import/types";

function row(overrides: Partial<CardInsertRow> = {}): CardInsertRow {
    return {
        Name: "Searing Fish", Power: 2, Bulk: 2,
        Color1: "Red", Color2: "Green", Color3: null, Color4: null,
        Trait: null, Effect1: "Draw 1", Effect2: null,
        Clarify1: null, Clarify2: null, Clarify3: null,
        Flavor: null, Inspiration: null, Artist: "Artist", Art: null,
        CardNumber: "1/81", SetName: "IRFO",
        ...overrides,
    };
}

function saved(id: string, overrides: Partial<CardInsertRow> = {}): ExistingCard {
    return { ...row(overrides), id, pool: "public" };
}

describe("planImport", () => {

    it("creates cards that aren't saved yet", () => {

        const plan = planImport([row(), row({ CardNumber: "2/81", Name: "Two" })], []);

        expect(plan.create.length).toBe(2);
        expect(plan.update.length).toBe(0);

    });

    it("leaves matching cards alone", () => {

        const plan = planImport([row()], [saved("a")]);

        expect(plan.create.length).toBe(0);
        expect(plan.unchanged).toBe(1);

    });

    it("treats null, empty and blank text as the same thing", () => {

        const plan = planImport(
            [row({ Trait: null, Flavor: null })],
            [saved("a", { Trait: "" as unknown as null, Flavor: "  " as unknown as null })],
        );

        expect(plan.unchanged).toBe(1);

    });

    it("lists only the columns that differ", () => {

        const plan = planImport(
            [row({ Power: 3, Effect1: "Draw 2", Trait: "React" })],
            [saved("a")],
        );

        expect(plan.update.length).toBe(1);
        expect(plan.update[0].id).toBe("a");
        expect(plan.update[0].changes).toEqual({ Power: 3, Effect1: "Draw 2", Trait: "React" });

    });

    it("clears a column when the sheet is empty and the database isn't", () => {

        const plan = planImport([row({ Effect1: null })], [saved("a")]);

        expect(plan.update[0].changes).toEqual({ Effect1: null });

    });

    it("matches cards by set and card number, ignoring formatting", () => {

        const plan = planImport(
            [row({ CardNumber: "1/81" })],
            [saved("a", { CardNumber: "01/81", SetName: "irfo" })],
        );

        expect(plan.create.length).toBe(0);
        expect(plan.unchanged).toBe(1);

    });

    it("treats the same number in a different set as a different card", () => {

        const plan = planImport([row({ SetName: "NEXT" })], [saved("a")]);

        expect(plan.create.length).toBe(1);

    });

    it("flags numbers the database already has more than once", () => {

        const plan = planImport([row()], [saved("a"), saved("b")]);

        expect(plan.ambiguous).toEqual([{ SetName: "IRFO", CardNumber: "1/81", count: 2 }]);
        expect(plan.create.length).toBe(0);
        expect(plan.update.length).toBe(0);

    });

});
