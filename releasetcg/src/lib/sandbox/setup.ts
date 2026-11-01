import type { PlayableCard } from "@/types/cards";
import type { DeckEntry } from "@/types/decks";

import { shuffleCards, type Rng } from "./actions";

import { allZoneKeys, extraZone, gateZone, handZone, PUBLIC_ZONE } from "./zones";

import {
    SEATS,
    type SandboxCard,
    type SandboxState,
    type SeatId,
    type ZoneKey,
} from "./types";

export interface SandboxDeckInput {
    mainDeck: PlayableCard[];
    extraDeck: PlayableCard[];
}

export interface SandboxSetupOptions {

    /** Cards each player starts with. Default 4. */
    startingHandSize?: number;

    /** Put one random main-deck card in each player's center gate. Default true. */
    starterGate?: boolean;

    startingHealth?: number;

    firstSeat?: SeatId;

    rng?: Rng;

}

export function emptyZones(): Record<ZoneKey, SandboxCard[]> {

    const zones = {} as Record<ZoneKey, SandboxCard[]>;

    for (const key of allZoneKeys()) {
        zones[key] = [];
    }

    return zones;

}

/**
 * Expand `{ cardId, count }` entries into individual cards.
 * Ids that aren't in the card list are reported in `missing`.
 */
export function expandDeck(
    entries: DeckEntry[],
    cards: readonly PlayableCard[],
): { cards: PlayableCard[]; missing: string[] } {

    const byId = new Map(cards.map(card => [card.id, card]));

    const expanded: PlayableCard[] = [];

    const missing: string[] = [];

    for (const entry of entries) {

        const card = byId.get(entry.cardId);

        if (!card) {
            missing.push(entry.cardId);
            continue;
        }

        for (let copy = 0; copy < entry.count; copy++) {
            expanded.push(card);
        }

    }

    return { cards: expanded, missing };

}

/**
 * A throwaway deck for when nobody is logged in or has a saved deck.
 * Cycles through the card pool so it stays a legal-looking size.
 */
export function buildTestDeck(
    pool: readonly PlayableCard[],
    rng: Rng = Math.random,
    mainSize = 40,
    extraSize = 3,
): SandboxDeckInput {

    if (pool.length === 0) {
        return { mainDeck: [], extraDeck: [] };
    }

    const shuffled = shuffleCards(pool, rng);

    const mainDeck: PlayableCard[] = [];

    for (let i = 0; i < mainSize; i++) {
        mainDeck.push(shuffled[i % shuffled.length]);
    }

    const extraDeck = shuffleCards(pool, rng).slice(0, extraSize);

    return { mainDeck, extraDeck };

}

function makeCards(
    seat: SeatId,
    cards: PlayableCard[],
    prefix: string,
): SandboxCard[] {

    return cards.map((card, index) => ({
        id: `${seat}-${prefix}-${index}`,
        card,
        owner: seat,
        faceUp: true,
    }));

}

/**
 * The same opening the real game uses: shuffled main decks, a random
 * starter gate, an opening hand, and everything left over shuffled
 * together into the shared public pile. After that, nothing is enforced.
 */
export function createSandboxState(
    decks: Record<SeatId, SandboxDeckInput>,
    options: SandboxSetupOptions = {},
): SandboxState {

    const rng = options.rng ?? Math.random;

    const handSize = options.startingHandSize ?? 4;

    const starterGate = options.starterGate ?? true;

    const zones = emptyZones();

    const leftovers: SandboxCard[] = [];

    for (const seat of SEATS) {

        const main = shuffleCards(
            makeCards(seat, decks[seat].mainDeck, "main"),
            rng,
        );

        if (starterGate && main.length > 0) {
            zones[gateZone(seat, 1)] = [main.shift() as SandboxCard];
        }

        zones[handZone(seat)] = main.splice(0, handSize);

        leftovers.push(...main);

        zones[extraZone(seat)] = makeCards(
            seat,
            decks[seat].extraDeck,
            "extra",
        );

    }

    zones[PUBLIC_ZONE] = shuffleCards(leftovers, rng);

    const health = options.startingHealth ?? 10;

    return {
        zones,
        chain: { plays: [], parries: [] },
        health: { P1: health, P2: health },
        passUsed: { P1: false, P2: false },
        activeSeat: options.firstSeat ?? "P1",
        turn: 1,
        log: ["Sandbox started"],
    };

}
