import {
    SandboxGame,
    createSandboxState,
    currentPlayGate,
    gateZone,
    handZone,
    peekIds,
    setZone,
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

function rng(): () => number {
    let seed = 11;
    return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
}

function makeGame(): SandboxGame {
    const state: SandboxState = createSandboxState(
        { P1: deck("a", 20), P2: deck("b", 20) },
        { rng: rng() },
    );
    return new SandboxGame(state, rng());
}

const hand = (game: SandboxGame, seat: "P1" | "P2" = "P1") =>
    game.getState().zones[handZone(seat)];

describe("pass tracker", () => {

    it("starts unused for both players", () => {
        const game = makeGame();
        expect(game.getState().passUsed).toEqual({ P1: false, P2: false });
    });

    it("toggles one player without touching the other", () => {
        const game = makeGame();
        game.togglePass("P1");
        expect(game.getState().passUsed).toEqual({ P1: true, P2: false });
        game.togglePass("P1");
        expect(game.getState().passUsed.P1).toBe(false);
    });

    it("can be undone and logs the change", () => {
        const game = makeGame();
        game.togglePass("P2");
        expect(game.getState().log[0]).toContain("P2 used their Pass");
        game.undo();
        expect(game.getState().passUsed.P2).toBe(false);
    });

    it("survives ending the turn (it is once per game)", () => {
        const game = makeGame();
        game.togglePass("P1");
        game.nextTurn();
        expect(game.getState().passUsed.P1).toBe(true);
    });

});

describe("moving the top N cards of a zone", () => {

    it("moves exactly the top N, keeping their order, to the top of the target", () => {
        const game = makeGame();
        const before = game.getState().zones.public.map(c => c.id);
        const ids = peekIds(game.getState(), "public", "top", 3);
        expect(ids).toEqual(before.slice(0, 3));

        game.move(ids, gateZone("P1", 0));

        const after = game.getState();
        expect(after.zones.public.map(c => c.id)).toEqual(before.slice(3));
        expect(after.zones[gateZone("P1", 0)].slice(0, 3).map(c => c.id)).toEqual(ids);
    });

    it("moves the bottom N too", () => {
        const game = makeGame();
        const before = game.getState().zones.public.map(c => c.id);
        const ids = peekIds(game.getState(), "public", "bottom", 2);
        game.move(ids, "gap");
        expect(game.getState().zones.public.map(c => c.id)).toEqual(before.slice(0, -2));
        expect(game.getState().zones.gap).toHaveLength(2);
    });

    it("clamps to the cards available", () => {
        const game = makeGame();
        const size = game.getState().zones.public.length;
        expect(peekIds(game.getState(), "public", "top", size + 50)).toHaveLength(size);
    });

});
