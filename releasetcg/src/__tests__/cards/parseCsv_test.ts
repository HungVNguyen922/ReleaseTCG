import { parseCsv } from "@/lib/cards/import/parseCsv";

describe("parseCsv", () => {

    it("reads plain rows", () => {

        expect(parseCsv("a,b,c\n1,2,3\n")).toEqual([
            ["a", "b", "c"],
            ["1", "2", "3"],
        ]);

    });

    it("keeps commas and line breaks inside quotes", () => {

        expect(parseCsv('name,text\nFish,"Draw 1, then\nDeal 1"\n')).toEqual([
            ["name", "text"],
            ["Fish", "Draw 1, then\nDeal 1"],
        ]);

    });

    it("reads doubled quotes as one quote", () => {

        expect(parseCsv('a\n"say ""hi"""\n')).toEqual([["a"], ['say "hi"']]);

    });

    it("handles Windows line endings and a byte-order mark", () => {

        expect(parseCsv("\uFEFFa,b\r\n1,2\r\n")).toEqual([
            ["a", "b"],
            ["1", "2"],
        ]);

    });

    it("keeps empty cells", () => {

        expect(parseCsv("a,,c\n,,\n")).toEqual([
            ["a", "", "c"],
            ["", "", ""],
        ]);

    });

    it("works without a final line break", () => {

        expect(parseCsv("a,b\n1,2")).toEqual([
            ["a", "b"],
            ["1", "2"],
        ]);

    });

    it("treats a quote in the middle of a cell as text", () => {

        expect(parseCsv('5" tall,x\n')).toEqual([['5" tall', "x"]]);

    });

    it("reports a quoted cell that never closes", () => {

        expect(() => parseCsv('a,"oops\n1,2\n')).toThrow();

    });

});
