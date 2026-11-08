import {
    createSandboxState,
    SandboxGame,
    nextPeekId,
    unseenCount,
    type SandboxDeckInput,
    type SandboxState,
} from "@/lib/sandbox";

import type { PlayableCard } from "@/types/cards";

function card(id: string): PlayableCard {
    return {
        id,
        name: `Card ${id}`,
        power: 1,
        bulk: 1,
        colors: ["red"],
        trait: null,
        effect1: null,
        effect2: null,
        clarify1: null,
        clarify2: null,
        clarify3: null,
        artist: null,
        cardNumber: "1/81",
        setName: "IRFO",
        flavor: null,
        inspiration: null,
    };
}

function deck(prefix: string, main: number): SandboxDeckInput {
    return {
        mainDeck: Array.from({ length: main }, (_, i) => card(`${prefix}m${i}`)),
        extraDeck: [],
    };
}

function makeGame(): SandboxGame {
    const state: SandboxState = createSandboxState(
        { P1: deck("a", 20), P2: deck("b", 20) },
        { rng: () => 0.5 },
    );

    return new SandboxGame(state);
}

/** Flip every card, one at a time, the way the look view does. */
function flipAll(
    game: SandboxGame,
    side: "top" | "bottom",
    limit = 1000,
): string[] {

    const shown: string[] = [];

    for (let i = 0; i < limit; i++) {

        const next = nextPeekId(game.getState(), "public", side, shown);

        if (!next) {
            break;
        }

        shown.push(next);

    }

    return shown;

}

describe("looking one card at a time", () => {

    it("flips from the top in pile order, then runs out", () => {

        const game = makeGame();

        const pile = game.getState().zones.public.map(c => c.id);

        expect(flipAll(game, "top")).toEqual(pile);

    });

    it("flips from the bottom upwards", () => {

        const game = makeGame();

        const pile = game.getState().zones.public.map(c => c.id);

        expect(flipAll(game, "bottom")).toEqual([...pile].reverse());

    });

    it("starts with the very first card when nothing has been flipped", () => {

        const game = makeGame();

        const pile = game.getState().zones.public;

        expect(nextPeekId(game.getState(), "public", "top", [])).toBe(pile[0].id);

        expect(nextPeekId(game.getState(), "public", "bottom", [])).toBe(
            pile[pile.length - 1].id,
        );

    });

    it("returns nothing for an empty zone", () => {

        const game = makeGame();

        expect(nextPeekId(game.getState(), "gap", "top", [])).toBeNull();

    });

    it("keeps its place when a flipped card leaves the pile", () => {

        const game = makeGame();

        const pile = game.getState().zones.public.map(c => c.id);

        const [first, second, third] = pile;

        // Flip two cards, then take the top one into a hand.
        game.draw("P1", 1);

        // The card drawn was `first`; the next unseen card from the top is the third.
        expect(
            nextPeekId(game.getState(), "public", "top", [first, second]),
        ).toBe(third);

    });

    it("counts the cards that have not been flipped", () => {

        const game = makeGame();

        const pile = game.getState().zones.public.map(c => c.id);

        expect(unseenCount(game.getState(), "public", [])).toBe(pile.length);

        expect(unseenCount(game.getState(), "public", pile.slice(0, 3))).toBe(
            pile.length - 3,
        );

        // Cards that are no longer in the pile don't count either way.
        expect(unseenCount(game.getState(), "public", ["not-a-card"])).toBe(
            pile.length,
        );

    });

});
