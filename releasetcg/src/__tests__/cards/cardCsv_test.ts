import { hasErrors, parseCardCsv, parseCardNumber } from "@/lib/cards/import/cardCsv";

const HEADER = [
    "Name", "Power", "Bulk", "Color1", "Color2", "Color3", "Color4",
    "Trait", "Effect1", "Effect2", "Clarify1", "Clarify2", "Clarify3",
    "CardNumber", "SetName", "Artist", "Art", "Flavor", "Inspiration",
];

function cell(value: string) {
    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

type Card = Partial<Record<(typeof HEADER)[number], string>>;

function csv(cards: Card[], header = HEADER) {

    const lines = [header.join(",")];

    for (const card of cards) {
        lines.push(header.map(key => cell(card[key] ?? "")).join(","));
    }

    return lines.join("\n") + "\n";

}

const FISH: Card = {
    Name: "Searing Fish", Power: "2", Bulk: "2",
    Color1: "Red", Color2: "Green", Color3: "Blue",
    Effect1: "Draw 1", Effect2: "Always: 1 DMG",
    Clarify2: "Draw 1 card from a draw pile.",
    CardNumber: "1/81", SetName: "IRFO", Artist: "InfiniteUno", Art: "SearingFish.png",
};

function errorsOf(text: string, options = {}) {
    return parseCardCsv(text, options).issues.filter(i => i.severity === "error");
}

describe("parseCardCsv", () => {

    it("turns a good row into a card ready to save", () => {

        const { rows, issues } = parseCardCsv(csv([FISH]));

        expect(hasErrors(issues)).toBe(false);
        expect(rows.length).toBe(1);

        expect(rows[0].card).toEqual({
            Name: "Searing Fish", Power: 2, Bulk: 2,
            Color1: "Red", Color2: "Green", Color3: "Blue", Color4: null,
            Trait: null, Effect1: "Draw 1", Effect2: "Always: 1 DMG",
            Clarify1: null, Clarify2: "Draw 1 card from a draw pile.", Clarify3: null,
            Flavor: null, Inspiration: null,
            Artist: "InfiniteUno", Art: "SearingFish.png",
            CardNumber: "1/81", SetName: "IRFO",
        });

    });

    it("turns empty cells into null, never empty text", () => {

        const { card } = parseCardCsv(csv([FISH])).rows[0];

        expect(card.Color4).toBeNull();
        expect(card.Trait).toBeNull();
        expect(card.Flavor).toBeNull();

    });

    it("accepts colors in any capitalization", () => {

        const { rows } = parseCardCsv(csv([{ ...FISH, Color1: "red", Color2: " GREEN ", Color3: "" }]));

        expect(rows[0].card.Color1).toBe("Red");
        expect(rows[0].card.Color2).toBe("Green");
        expect(rows[0].card.Color3).toBeNull();

    });

    it("rejects an unknown color", () => {

        const errors = errorsOf(csv([{ ...FISH, Color2: "Purple" }]));

        expect(errors.length).toBe(1);
        expect(errors[0].field).toBe("Color2");
        expect(errors[0].row).toBe(2);

    });

    it("rejects a repeated color and a card with no color", () => {

        expect(errorsOf(csv([{ ...FISH, Color2: "Red" }])).length).toBe(1);

        expect(errorsOf(csv([{ ...FISH, Color1: "", Color2: "", Color3: "" }])).length).toBe(1);

    });

    it("closes an empty color cell between colors with a heads-up", () => {

        const { rows, issues } = parseCardCsv(csv([{ ...FISH, Color2: "", Color3: "Blue" }]));

        expect(rows[0].card.Color2).toBe("Blue");
        expect(issues.some(i => i.severity === "warning" && i.field === "Colors")).toBe(true);

    });

    it("rejects bad Power and Bulk", () => {

        expect(errorsOf(csv([{ ...FISH, Power: "two" }])).length).toBe(1);
        expect(errorsOf(csv([{ ...FISH, Bulk: "-1" }])).length).toBe(1);
        expect(errorsOf(csv([{ ...FISH, Power: "9" }])).length).toBe(1);

    });

    it("rejects a set that isn't registered", () => {

        const errors = errorsOf(csv([{ ...FISH, SetName: "NOPE" }]));

        expect(errors.length).toBe(1);
        expect(errors[0].field).toBe("SetName");

    });

    it("accepts the set tag in any capitalization", () => {

        expect(parseCardCsv(csv([{ ...FISH, SetName: "irfo" }])).rows[0].card.SetName).toBe("IRFO");

    });

    it("uses the default set for empty SetName cells", () => {

        const text = csv([{ ...FISH, SetName: "" }]);

        expect(errorsOf(text).length).toBe(1);
        expect(errorsOf(text, { defaultSet: "IRFO" }).length).toBe(0);

    });

    it("checks the card number format and range", () => {

        expect(errorsOf(csv([{ ...FISH, CardNumber: "5" }])).length).toBe(1);
        expect(errorsOf(csv([{ ...FISH, CardNumber: "0/81" }])).length).toBe(1);
        expect(errorsOf(csv([{ ...FISH, CardNumber: "82/81" }])).length).toBe(1);
        expect(errorsOf(csv([{ ...FISH, CardNumber: "" }])).length).toBe(1);

    });

    it("tidies card numbers like 01/81", () => {

        const { rows, issues } = parseCardCsv(csv([{ ...FISH, CardNumber: "01 / 81" }]));

        expect(rows[0].card.CardNumber).toBe("1/81");
        expect(issues.some(i => i.severity === "warning" && i.field === "CardNumber")).toBe(true);

    });

    it("warns when the total doesn't match the registered set size", () => {

        const { rows, issues } = parseCardCsv(csv([{ ...FISH, CardNumber: "1/90" }]));

        expect(rows.length).toBe(1);
        expect(issues.some(i => i.severity === "warning" && /registered with 81/.test(i.message))).toBe(true);

    });

    it("rejects the same card number twice in a set", () => {

        const errors = errorsOf(csv([FISH, { ...FISH, Name: "Other Card" }]));

        expect(errors.length).toBe(1);
        expect(errors[0].row).toBe(3);
        expect(errors[0].message).toMatch(/row 2/);

    });

    it("leaves bad rows out and keeps the good ones", () => {

        const { rows } = parseCardCsv(csv([FISH, { ...FISH, Name: "Bad", CardNumber: "2/81", Color1: "Nope" }]));

        expect(rows.length).toBe(1);

    });

    it("skips blank rows", () => {

        const text = csv([FISH]) + ",,,,,,,,,,,,,,,,,,\n";

        expect(parseCardCsv(text).rows.length).toBe(1);
        expect(errorsOf(text).length).toBe(0);

    });

    it("lists missing card numbers as a heads-up, not an error", () => {

        const { issues } = parseCardCsv(csv([FISH]));

        expect(hasErrors(issues)).toBe(false);
        expect(issues.some(i => i.severity === "warning" && /1 of 81/.test(i.message) && /Missing: 2, 3/.test(i.message))).toBe(true);

    });

    it("reports missing columns", () => {

        const errors = errorsOf("Name,Power\nFish,2\n");

        expect(errors.length).toBe(1);
        expect(errors[0].message).toMatch(/Missing columns/);

    });

    it("understands headers in any capitalization and warns about extras", () => {

        const text = "NAME,power,Bulk,COLOR1,CardNumber,SetName,Notes\nFish,2,2,Red,1/81,IRFO,hi\n";

        const { rows, issues } = parseCardCsv(text);

        expect(rows.length).toBe(1);
        expect(issues.some(i => i.severity === "warning" && i.field === "notes")).toBe(true);

    });

    it("reports an empty file and an unclosed quote", () => {

        expect(errorsOf("").length).toBe(1);
        expect(errorsOf('Name\n"oops').length).toBe(1);

    });

});

describe("parseCardNumber", () => {

    it("reads n/total", () => {

        expect(parseCardNumber("12/81")).toEqual({ number: 12, total: 81, text: "12/81" });
        expect(parseCardNumber("03 / 81")?.text).toBe("3/81");

    });

    it("rejects anything else", () => {

        expect(parseCardNumber("12")).toBeNull();
        expect(parseCardNumber("a/b")).toBeNull();

    });

});
