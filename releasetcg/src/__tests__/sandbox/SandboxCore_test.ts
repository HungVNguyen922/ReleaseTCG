import {
    SandboxGame,
    buildTestDeck,
    createSandboxState,
    expandDeck,
    findCard,
    gateZone,
    handZone,
    setZone,
    type SandboxDeckInput,
    type SandboxState,
    type SeatId,
} from "@/lib/sandbox";

import type { PlayableCard } from "@/types/cards";

function card(id: string, colors: string[] = ["red"]): PlayableCard {
    return {
        id,
        name: `Card ${id}`,
        power: 1,
        bulk: 1,
        colors,
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

function deck(prefix: string, main: number, extra = 2): SandboxDeckInput {
    return {
        mainDeck: Array.from({ length: main }, (_, i) => card(`${prefix}m${i}`)),
        extraDeck: Array.from({ length: extra }, (_, i) => card(`${prefix}x${i}`)),
    };
}

function fixedRng(): () => number {
    let seed = 7;
    return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
}

function makeState(): SandboxState {
    return createSandboxState(
        { P1: deck("a", 20), P2: deck("b", 20) },
        { rng: fixedRng() },
    );
}

function total(state: SandboxState): number {
    return Object.values(state.zones).reduce((sum, cards) => sum + cards.length, 0);
}

describe("createSandboxState", () => {

    it("deals the opening: starter gate, hand, extra deck and a shared public pile", () => {

        const state = makeState();

        for (const seat of ["P1", "P2"] as SeatId[]) {
            expect(state.zones[handZone(seat)]).toHaveLength(4);
            expect(state.zones[gateZone(seat, 1)]).toHaveLength(1);
            expect(state.zones[`extra:${seat}`]).toHaveLength(2);
        }

        // 20 per player - 1 gate - 4 hand = 15 each, shared.
        expect(state.zones.public).toHaveLength(30);

        expect(state.health).toEqual({ P1: 10, P2: 10 });

        expect(total(state)).toBe(44);

    });

    it("gives every physical card a unique id", () => {

        const state = makeState();

        const ids = Object.values(state.zones).flat().map(c => c.id);

        expect(new Set(ids).size).toBe(ids.length);

    });

    it("can skip the starter gate and use a custom hand size", () => {

        const state = createSandboxState(
            { P1: deck("a", 10), P2: deck("b", 10) },
            { starterGate: false, startingHandSize: 6, rng: fixedRng() },
        );

        expect(state.zones[gateZone("P1", 1)]).toHaveLength(0);
        expect(state.zones[handZone("P1")]).toHaveLength(6);

    });

});

describe("SandboxGame moves", () => {

    it("moves a card between zones and never duplicates or loses cards", () => {

        const game = new SandboxGame(makeState());

        const before = total(game.getState());

        const target = game.getState().zones[handZone("P1")][0];

        game.move([target.id], gateZone("P1", 0));

        const location = findCard(game.getState(), target.id);

        expect(location?.zone).toBe(gateZone("P1", 0));

        expect(total(game.getState())).toBe(before);

    });

    it("lets any number of cards go to the board at once", () => {

        const game = new SandboxGame(makeState());

        const ids = game.getState().zones[handZone("P1")].map(c => c.id);

        game.move(ids, gateZone("P1", 2));

        expect(game.getState().zones[handZone("P1")]).toHaveLength(0);
        expect(game.getState().zones[gateZone("P1", 2)]).toHaveLength(4);

    });

    it("puts the newest card on top of a gate stack", () => {

        const game = new SandboxGame(makeState());

        const [first, second] = game.getState().zones[handZone("P1")];

        game.move([first.id], gateZone("P1", 0));
        game.move([second.id], gateZone("P1", 0));

        expect(game.getState().zones[gateZone("P1", 0)][0].id).toBe(second.id);

    });

    it("ignores unknown card ids", () => {

        const game = new SandboxGame(makeState());

        const before = game.getState();

        game.move(["nope"], gateZone("P1", 0));

        expect(game.getState()).toBe(before);
        expect(game.canUndo).toBe(false);

    });

    it("lets a player move cards out of the opponent's zones", () => {

        const game = new SandboxGame(makeState());

        const theirs = game.getState().zones[handZone("P2")][0];

        game.move([theirs.id], setZone("P1", 0));

        expect(findCard(game.getState(), theirs.id)?.zone).toBe(setZone("P1", 0));

    });

});

describe("SandboxGame draw, shuffle, flip", () => {

    it("draws any number from the public pile into a hand", () => {

        const game = new SandboxGame(makeState());

        game.draw("P1", 7);

        expect(game.getState().zones[handZone("P1")]).toHaveLength(11);
        expect(game.getState().zones.public).toHaveLength(23);

    });

    it("stops drawing when the pile runs out", () => {

        const game = new SandboxGame(makeState());

        game.draw("P2", 999);

        expect(game.getState().zones.public).toHaveLength(0);

        const before = game.getState();

        game.draw("P2", 1);

        expect(game.getState()).toBe(before);

    });

    it("shuffles a zone without changing its contents", () => {

        const game = new SandboxGame(makeState(), fixedRng());

        const before = game.getState().zones.public.map(c => c.id);

        game.shuffle("public");

        const after = game.getState().zones.public.map(c => c.id);

        expect(after).not.toEqual(before);
        expect([...after].sort()).toEqual([...before].sort());

    });

    it("flips cards face down and back up", () => {

        const game = new SandboxGame(makeState());

        const target = game.getState().zones[gateZone("P1", 1)][0];

        expect(target.faceUp).toBe(true);

        game.flip([target.id]);

        expect(findCard(game.getState(), target.id)?.card.faceUp).toBe(false);

        game.flip([target.id]);

        expect(findCard(game.getState(), target.id)?.card.faceUp).toBe(true);

    });

    it("keeps a card face down on the board but resets it when it goes to a hand", () => {

        const game = new SandboxGame(makeState());

        const target = game.getState().zones[handZone("P1")][0];

        game.move([target.id], setZone("P1", 0));
        game.flip([target.id]);
        game.move([target.id], gateZone("P1", 0));

        expect(findCard(game.getState(), target.id)?.card.faceUp).toBe(false);

        game.move([target.id], handZone("P1"));

        expect(findCard(game.getState(), target.id)?.card.faceUp).toBe(true);

    });

});

describe("SandboxGame health and turns", () => {

    it("changes health freely and never goes below zero", () => {

        const game = new SandboxGame(makeState());

        game.changeHealth("P2", -3);

        expect(game.getState().health.P2).toBe(7);

        game.changeHealth("P2", -99);

        expect(game.getState().health.P2).toBe(0);

        game.changeHealth("P2", 5);

        expect(game.getState().health.P2).toBe(5);

    });

    it("does not end the game at zero health", () => {

        const game = new SandboxGame(makeState());

        game.changeHealth("P1", -10);

        expect(game.getState().health.P1).toBe(0);

        game.draw("P1", 1);

        expect(game.getState().zones[handZone("P1")]).toHaveLength(5);

    });

    it("passes the turn marker back and forth", () => {

        const game = new SandboxGame(makeState());

        expect(game.getState().activeSeat).toBe("P1");

        game.nextTurn();

        expect(game.getState().activeSeat).toBe("P2");
        expect(game.getState().turn).toBe(2);

    });

});

describe("SandboxGame undo/redo", () => {

    it("undoes and redoes moves", () => {

        const game = new SandboxGame(makeState());

        const target = game.getState().zones[handZone("P1")][0];

        game.move([target.id], gateZone("P1", 0));
        game.draw("P1", 2);
        game.changeHealth("P1", -2);

        game.undo();
        game.undo();
        game.undo();

        expect(findCard(game.getState(), target.id)?.zone).toBe(handZone("P1"));
        expect(game.getState().health.P1).toBe(10);
        expect(game.canUndo).toBe(false);

        game.redo();

        expect(findCard(game.getState(), target.id)?.zone).toBe(gateZone("P1", 0));

    });

    it("drops redo history after a new action", () => {

        const game = new SandboxGame(makeState());

        game.draw("P1", 1);
        game.undo();

        expect(game.canRedo).toBe(true);

        game.draw("P1", 2);

        expect(game.canRedo).toBe(false);

    });

    it("notifies subscribers on every change", () => {

        const game = new SandboxGame(makeState());

        let calls = 0;

        const stop = game.subscribe(() => { calls++; });

        game.draw("P1", 1);
        game.undo();
        game.redo();

        stop();

        game.draw("P1", 1);

        expect(calls).toBe(3);

    });

});

describe("deck helpers", () => {

    it("expands deck entries and reports unknown cards", () => {

        const pool = [card("a"), card("b")];

        const { cards, missing } = expandDeck(
            [
                { cardId: "a", count: 3 },
                { cardId: "b", count: 1 },
                { cardId: "gone", count: 2 },
            ],
            pool,
        );

        expect(cards.map(c => c.id)).toEqual(["a", "a", "a", "b"]);
        expect(missing).toEqual(["gone"]);

    });

    it("builds a test deck from any card pool", () => {

        const pool = [card("a"), card("b"), card("c")];

        const built = buildTestDeck(pool, fixedRng(), 10, 2);

        expect(built.mainDeck).toHaveLength(10);
        expect(built.extraDeck).toHaveLength(2);

        expect(buildTestDeck([], fixedRng())).toEqual({ mainDeck: [], extraDeck: [] });

    });

});
