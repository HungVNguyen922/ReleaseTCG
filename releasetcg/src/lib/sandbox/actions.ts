import { describeZone, handZone, isBoardZone, parseZone } from "./zones";

import type {
    SandboxCard,
    SandboxState,
    SeatId,
    ZoneKey,
    ZonePosition,
} from "./types";

import { otherSeat } from "./zones";

const MAX_LOG = 60;

export type Rng = () => number;

export interface CardLocation {
    zone: ZoneKey;
    index: number;
    card: SandboxCard;
}

export function findCard(
    state: SandboxState,
    cardId: string,
): CardLocation | null {

    for (const key of Object.keys(state.zones) as ZoneKey[]) {

        const index = state.zones[key].findIndex(
            card => card.id === cardId,
        );

        if (index !== -1) {
            return { zone: key, index, card: state.zones[key][index] };
        }

    }

    return null;

}

export function withLog(
    state: SandboxState,
    message: string,
): SandboxState {

    return {
        ...state,
        log: [message, ...state.log].slice(0, MAX_LOG),
    };

}

function defaultPosition(zone: ZoneKey): ZonePosition {
    return parseZone(zone).kind === "hand" ? "bottom" : "top";
}

export interface MoveOptions {

    position?: ZonePosition;

    /** Force the face state. Otherwise board/gap keep it, everything else resets to face up. */
    faceUp?: boolean;

}

/**
 * Move any number of cards to a zone. Unknown ids are ignored.
 *
 * With position "top" the first id listed ends up on top.
 */
export function moveCards(
    state: SandboxState,
    cardIds: string[],
    to: ZoneKey,
    options: MoveOptions = {},
): SandboxState {

    const ids = [...new Set(cardIds)];

    const moving: SandboxCard[] = [];

    for (const id of ids) {

        const location = findCard(state, id);

        if (location) {
            moving.push(location.card);
        }

    }

    if (moving.length === 0) {
        return state;
    }

    const movingIds = new Set(moving.map(card => card.id));

    const zones = { ...state.zones };

    for (const key of Object.keys(zones) as ZoneKey[]) {

        if (zones[key].some(card => movingIds.has(card.id))) {
            zones[key] = zones[key].filter(card => !movingIds.has(card.id));
        }

    }

    const keepFace = isBoardZone(to) || to === "gap";

    const arrived = moving.map(card => ({
        ...card,
        faceUp: options.faceUp ?? (keepFace ? card.faceUp : true),
    }));

    const position = options.position ?? defaultPosition(to);

    const target = zones[to];

    if (position === "top") {

        zones[to] = [...arrived, ...target];

    } else if (position === "bottom") {

        zones[to] = [...target, ...arrived];

    } else {

        const at = Math.max(0, Math.min(position, target.length));

        zones[to] = [
            ...target.slice(0, at),
            ...arrived,
            ...target.slice(at),
        ];

    }

    return { ...state, zones };

}

export function drawCards(
    state: SandboxState,
    seat: SeatId,
    count: number,
    from: ZoneKey = "public",
): SandboxState {

    const ids = state.zones[from]
        .slice(0, Math.max(0, count))
        .map(card => card.id);

    return moveCards(state, ids, handZone(seat));

}

export function shuffleCards<T>(items: readonly T[], rng: Rng = Math.random): T[] {

    const copy = [...items];

    for (let i = copy.length - 1; i > 0; i--) {

        const j = Math.floor(rng() * (i + 1));

        [copy[i], copy[j]] = [copy[j], copy[i]];

    }

    return copy;

}

export function shuffleZone(
    state: SandboxState,
    zone: ZoneKey,
    rng: Rng = Math.random,
): SandboxState {

    if (state.zones[zone].length < 2) {
        return state;
    }

    return {
        ...state,
        zones: {
            ...state.zones,
            [zone]: shuffleCards(state.zones[zone], rng),
        },
    };

}

export function flipCards(
    state: SandboxState,
    cardIds: string[],
): SandboxState {

    const ids = new Set(cardIds);

    const zones = { ...state.zones };

    let changed = false;

    for (const key of Object.keys(zones) as ZoneKey[]) {

        if (zones[key].some(card => ids.has(card.id))) {

            changed = true;

            zones[key] = zones[key].map(card =>
                ids.has(card.id)
                    ? { ...card, faceUp: !card.faceUp }
                    : card,
            );

        }

    }

    return changed ? { ...state, zones } : state;

}

export function adjustHealth(
    state: SandboxState,
    seat: SeatId,
    delta: number,
): SandboxState {

    const next = Math.max(0, state.health[seat] + delta);

    if (next === state.health[seat]) {
        return state;
    }

    return {
        ...state,
        health: { ...state.health, [seat]: next },
    };

}

export function setHealth(
    state: SandboxState,
    seat: SeatId,
    value: number,
): SandboxState {

    return adjustHealth(state, seat, value - state.health[seat]);

}

export function endTurn(state: SandboxState): SandboxState {

    return {
        ...state,
        activeSeat: otherSeat(state.activeSeat),
        turn: state.turn + 1,
    };

}

export function cardName(state: SandboxState, cardId: string): string {

    return findCard(state, cardId)?.card.card.name ?? "a card";

}

export function describeMove(
    state: SandboxState,
    cardIds: string[],
    to: ZoneKey,
): string {

    const first = cardIds[0] ? cardName(state, cardIds[0]) : "a card";

    const what = cardIds.length > 1
        ? `${cardIds.length} cards`
        : first;

    return `Moved ${what} to ${describeZone(to)}`;

}
