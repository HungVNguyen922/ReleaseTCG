import { isRouteActive } from "@/components/nav-utils";

const params = (query = "") => new URLSearchParams(query);

describe("isRouteActive", () => {

    it("never marks # placeholders active", () => {

        expect(isRouteActive("/", params(), "#")).toBe(false);

    });

    it("matches a page and the pages below it", () => {

        expect(isRouteActive("/deckbuilder", params(), "/deckbuilder")).toBe(true);
        expect(isRouteActive("/deckbuilder/123", params(), "/deckbuilder")).toBe(true);
        expect(isRouteActive("/community", params(), "/deckbuilder")).toBe(false);

    });

    it("doesn't match a different page that only starts the same way", () => {

        expect(isRouteActive("/gallery-extra", params(), "/gallery")).toBe(false);

    });

    it("lights up one set link, not All Cards, when a set is chosen", () => {

        expect(isRouteActive("/gallery", params("set=IRFO"), "/gallery?set=IRFO")).toBe(true);
        expect(isRouteActive("/gallery", params("set=IRFO"), "/gallery")).toBe(false);
        expect(isRouteActive("/gallery", params(), "/gallery")).toBe(true);
        expect(isRouteActive("/gallery", params(), "/gallery?set=IRFO")).toBe(false);

    });

    it("tells different sets apart", () => {

        expect(isRouteActive("/gallery", params("set=NEXT"), "/gallery?set=IRFO")).toBe(false);

    });

});
