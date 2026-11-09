import { generateShowcaseState } from "@/lib/showcase/generateShowcaseState";
import { mulberry32 } from "@/lib/showcase/seededRng";

import {
    SLOTS,
    SEATS,
    gateZone,
    handZone,
    setZone,
    type SandboxState,
} from "@/lib/sandbox";

import type { PlayableCard } from "@/types/cards";

const COLORS = [
    "Red",
    "Orange",
    "Yellow",
    "Green",
    "Cyan",
    "Blue",
    "Violet",
    "Magenta",
    "Pink",
];

/** A made-up card pool with a spread of colors, Power and Bulk. */
function makePool(size = 60): PlayableCard[] {

    const rng = mulberry32(12345);

    return Array.from({ length: size }, (_, i) => {

        const count = 1 + Math.floor(rng() * 3);

        const colors = [...COLORS]
            .sort(() => rng() - 0.5)
            .slice(0, count);

        return {
            id: `card-${i}`,
            name: `Card ${i}`,
            power: Math.floor(rng() * 6),
            bulk: 1 + Math.floor(rng() * 5),
            colors,
            trait: null,
            effect1: null,
            effect2: null,
            clarify1: null,
            clarify2: null,
            clarify3: null,
            artist: null,
            cardNumber: `${i + 1}/${size}`,
            setName: "TEST",
            flavor: null,
            inspiration: null,
        };

    });

}

function everyCard(state: SandboxState) {
    return Object.values(state.zones).flat();
}

const SEEDS = [1, 2, 3, 42, 99, 2024, 31337, 777, 5, 123456];

describe("generateShowcaseState", () => {

    const pool = makePool();

    it("needs a real card pool", () => {
        expect(generateShowcaseState(makePool(5), 1)).toBeNull();
    });

    it("builds the same match from the same seed", () => {

        for (const seed of SEEDS) {
            expect(JSON.stringify(generateShowcaseState(pool, seed))).toBe(
                JSON.stringify(generateShowcaseState(pool, seed)),
            );
        }

    });

    it("builds different matches from different seeds", () => {

        const boards = new Set(
            SEEDS.map(seed => JSON.stringify(generateShowcaseState(pool, seed)?.zones)),
        );

        expect(boards.size).toBeGreaterThan(5);

    });

    it("never loses or duplicates a card", () => {

        for (const seed of SEEDS) {

            const state = generateShowcaseState(pool, seed) as SandboxState;

            const cards = everyCard(state);

            // 2 players x (20 main + 6 extra)
            expect(cards.length).toBe(52);

            expect(new Set(cards.map(c => c.id)).size).toBe(52);

        }

    });

    it("looks like a game in progress", () => {

        for (const seed of SEEDS) {

            const state = generateShowcaseState(pool, seed) as SandboxState;

            for (const seat of SEATS) {

                expect(state.health[seat]).toBeGreaterThanOrEqual(1);
                expect(state.health[seat]).toBeLessThanOrEqual(10);

                expect(state.zones[handZone(seat)].length).toBeLessThanOrEqual(8);

                for (const slot of SLOTS) {

                    // Gates are face up; Set Zones hold one face-down card at most.
                    for (const sc of state.zones[gateZone(seat, slot)]) {
                        expect(sc.faceUp).toBe(true);
                    }

                    const set = state.zones[setZone(seat, slot)];

                    expect(set.length).toBeLessThanOrEqual(1);

                    for (const sc of set) {
                        expect(sc.faceUp).toBe(false);
                    }

                }

            }

            expect(state.turn).toBeGreaterThan(4);

        }

    });

    it("follows the color-matching rule when nobody Parries", () => {

        for (const seed of SEEDS) {

            const state = generateShowcaseState(pool, seed, {
                parryChance: 0,
            }) as SandboxState;

            for (const seat of SEATS) {
                for (const slot of SLOTS) {

                    const stack = state.zones[gateZone(seat, slot)];

                    // Every card sits on a card it shares a color with.
                    for (let i = 0; i < stack.length - 1; i++) {

                        const shared = stack[i].card.colors.filter(color =>
                            stack[i + 1].card.colors.includes(color),
                        );

                        expect(shared.length).toBeGreaterThanOrEqual(1);

                    }

                }
            }

        }

    });

    it("can play out an exact number of turns", () => {

        const state = generateShowcaseState(pool, 7, { turns: 3 }) as SandboxState;

        expect(state.turn).toBe(4);

    });

});
