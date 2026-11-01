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

describe("play chain", () => {

    it("starts empty", () => {

        const game = makeGame();

        expect(game.getState().chain).toEqual({ plays: [], parries: [] });
        expect(currentPlayGate(game.getState())).toBeNull();

    });

    it("records a hand -> gate move as a play", () => {

        const game = makeGame();

        const [first] = hand(game);

        game.move([first.id], gateZone("P1", 0));

        expect(game.getState().chain.plays).toEqual([first.id]);
        expect(currentPlayGate(game.getState())).toBe(gateZone("P1", 0));

    });

    it("records a set zone -> gate move as a play, but not hand -> set", () => {

        const game = makeGame();

        const [first, second] = hand(game);

        game.move([first.id], setZone("P1", 0));

        expect(game.getState().chain.plays).toEqual([]);

        game.move([first.id], gateZone("P1", 2));

        expect(game.getState().chain.plays).toEqual([first.id]);

        game.move([second.id], gateZone("P1", 0));

        expect(game.getState().chain.plays).toEqual([first.id, second.id]);

    });

    it("does not record rearranging cards that are already on the board", () => {

        const game = makeGame();

        const starter = game.getState().zones[gateZone("P1", 1)][0];

        game.move([starter.id], gateZone("P1", 0));

        expect(game.getState().chain.plays).toEqual([]);

    });

    it("puts the last card of a multi-card play on top of the gate", () => {

        const game = makeGame();

        const [a, b, c] = hand(game);

        game.move([a.id, b.id, c.id], gateZone("P1", 0));

        expect(game.getState().chain.plays).toEqual([a.id, b.id, c.id]);

        expect(
            game.getState().zones[gateZone("P1", 0)].map(card => card.id),
        ).toEqual([c.id, b.id, a.id]);

    });

    it("records parries onto the gate of the current play", () => {

        const game = makeGame();

        const [played] = hand(game, "P1");

        const [response] = hand(game, "P2");

        game.move([played.id], gateZone("P1", 0));

        game.parry([response.id]);

        const state = game.getState();

        expect(state.chain.parries).toEqual([response.id]);

        expect(state.chain.plays).toEqual([played.id]);

        expect(state.zones[gateZone("P1", 0)][0].id).toBe(response.id);

    });

    it("ignores a parry when there is no play to respond to", () => {

        const game = makeGame();

        const [response] = hand(game, "P2");

        game.parry([response.id]);

        expect(game.getState().chain.parries).toEqual([]);

        expect(hand(game, "P2").some(card => card.id === response.id)).toBe(true);

        expect(game.canUndo).toBe(false);

    });

    it("drops a card from the chain when it leaves the gate", () => {

        const game = makeGame();

        const [first, second] = hand(game);

        game.move([first.id, second.id], gateZone("P1", 0));

        game.move([second.id], "gap");

        expect(game.getState().chain.plays).toEqual([first.id]);

    });

    it("resolves single cards and the whole chain without moving them", () => {

        const game = makeGame();

        const [first, second] = hand(game);

        game.move([first.id, second.id], gateZone("P1", 0));

        game.resolveCard(first.id);

        expect(game.getState().chain.plays).toEqual([second.id]);

        game.resolveChain();

        expect(game.getState().chain.plays).toEqual([]);

        expect(game.getState().zones[gateZone("P1", 0)]).toHaveLength(2);

    });

    it("clears the chain when the turn ends", () => {

        const game = makeGame();

        const [first] = hand(game);

        game.move([first.id], gateZone("P1", 0));

        game.nextTurn();

        expect(game.getState().chain).toEqual({ plays: [], parries: [] });

    });

    it("undoes plays and parries together with the move", () => {

        const game = makeGame();

        const [played] = hand(game, "P1");

        const [response] = hand(game, "P2");

        game.move([played.id], gateZone("P1", 0));

        game.parry([response.id]);

        game.undo();

        expect(game.getState().chain.parries).toEqual([]);

        expect(game.getState().chain.plays).toEqual([played.id]);

        game.undo();

        expect(game.getState().chain.plays).toEqual([]);

    });

    it("can be told a move is not a play", () => {

        const game = makeGame();

        const [first] = hand(game);

        game.move([first.id], gateZone("P1", 0), { as: "none" });

        expect(game.getState().chain.plays).toEqual([]);

    });

});

describe("peeking", () => {

    it("returns the top or bottom cards in stack order", () => {

        const game = makeGame();

        const pile = game.getState().zones.public;

        expect(peekIds(game.getState(), "public", "top", 3)).toEqual(
            pile.slice(0, 3).map(card => card.id),
        );

        expect(peekIds(game.getState(), "public", "bottom", 2)).toEqual(
            pile.slice(-2).map(card => card.id),
        );

    });

    it("never returns more than the zone holds", () => {

        const game = makeGame();

        expect(peekIds(game.getState(), "gap", "top", 5)).toEqual([]);

        expect(
            peekIds(game.getState(), gateZone("P1", 1), "bottom", 99),
        ).toHaveLength(1);

        expect(peekIds(game.getState(), "public", "top", -3)).toEqual([]);

    });

    it("logs a note without adding an undo step", () => {

        const game = makeGame();

        game.note("P1 looked at the top 3 cards of the public pile");

        expect(game.getState().log[0]).toContain("looked at");

        expect(game.canUndo).toBe(false);

    });

});
