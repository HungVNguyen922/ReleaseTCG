import { describeZone, handZone, isBoardZone, parseZone } from "./zones";

import type {
    ChainState,
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

/**
 * How a move counts toward the chain.
 *
 * - "auto": a card going from a hand or set zone onto a gate is a Play.
 * - "play" / "parry": record it as such no matter where it came from.
 * - "none": never record it.
 */
export type MoveRole = "auto" | "play" | "parry" | "none";

export interface MoveOptions {

    position?: ZonePosition;

    /** Force the face state. Otherwise board/gap keep it, everything else resets to face up. */
    faceUp?: boolean;

    as?: MoveRole;

}

function without(list: string[], id: string): string[] {
    return list.filter(existing => existing !== id);
}

export const EMPTY_CHAIN: ChainState = { plays: [], parries: [] };

/**
 * Move any number of cards to a zone. Unknown ids are ignored.
 *
 * With position "top" the first id listed ends up on top, except for
 * cards recorded as plays or parries on a gate: there the LAST card
 * played ends up on top, matching the order shown in the chain.
 */
export function moveCards(
    state: SandboxState,
    cardIds: string[],
    to: ZoneKey,
    options: MoveOptions = {},
): SandboxState {

    const ids = [...new Set(cardIds)];

    const moving: { card: SandboxCard; from: ZoneKey }[] = [];

    for (const id of ids) {

        const location = findCard(state, id);

        if (location) {
            moving.push({ card: location.card, from: location.zone });
        }

    }

    if (moving.length === 0) {
        return state;
    }

    const movingIds = new Set(moving.map(entry => entry.card.id));

    const zones = { ...state.zones };

    for (const key of Object.keys(zones) as ZoneKey[]) {

        if (zones[key].some(card => movingIds.has(card.id))) {
            zones[key] = zones[key].filter(card => !movingIds.has(card.id));
        }

    }

    const keepFace = isBoardZone(to) || to === "gap";

    let arrived = moving.map(({ card }) => ({
        ...card,
        faceUp: options.faceUp ?? (keepFace ? card.faceUp : true),
    }));

    //
    // Chain bookkeeping.
    //

    const role = options.as ?? "auto";

    let plays = state.chain.plays;

    let parries = state.chain.parries;

    let recorded = 0;

    if (parseZone(to).kind === "gate" && role !== "none") {

        for (const { card, from } of moving) {

            if (role === "parry") {

                parries = [...without(parries, card.id), card.id];

                recorded++;

                continue;

            }

            const fromKind = parseZone(from).kind;

            if (role === "play" || fromKind === "hand" || fromKind === "set") {

                plays = [...without(plays, card.id), card.id];

                recorded++;

            }

        }

    }

    const position = options.position ?? defaultPosition(to);

    if (position === "top" && recorded === moving.length && recorded > 1) {
        arrived = [...arrived].reverse();
    }

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

    //
    // A card that is no longer on a gate has resolved.
    //

    if (plays.length > 0 || parries.length > 0) {

        const onGate = new Set<string>();

        for (const key of Object.keys(zones) as ZoneKey[]) {

            if (parseZone(key).kind === "gate") {

                for (const card of zones[key]) {
                    onGate.add(card.id);
                }

            }

        }

        plays = plays.filter(id => onGate.has(id));

        parries = parries.filter(id => onGate.has(id));

    }

    return { ...state, zones, chain: { plays, parries } };

}

/** The gate the current play sits on (where parries go). */
export function currentPlayGate(state: SandboxState): ZoneKey | null {

    for (let i = state.chain.plays.length - 1; i >= 0; i--) {

        const location = findCard(state, state.chain.plays[i]);

        if (location && parseZone(location.zone).kind === "gate") {
            return location.zone;
        }

    }

    return null;

}

/** Play cards as parries onto the gate of the current play. */
export function playParry(
    state: SandboxState,
    cardIds: string[],
): SandboxState {

    const gate = currentPlayGate(state);

    if (!gate) {
        return state;
    }

    return moveCards(state, cardIds, gate, { as: "parry", position: "top" });

}

/** Mark one card of the chain as resolved. It stays where it is. */
export function resolveChainCard(
    state: SandboxState,
    cardId: string,
): SandboxState {

    const { plays, parries } = state.chain;

    if (!plays.includes(cardId) && !parries.includes(cardId)) {
        return state;
    }

    return {
        ...state,
        chain: {
            plays: without(plays, cardId),
            parries: without(parries, cardId),
        },
    };

}

export function clearChain(state: SandboxState): SandboxState {

    if (state.chain.plays.length === 0 && state.chain.parries.length === 0) {
        return state;
    }

    return { ...state, chain: { plays: [], parries: [] } };

}

/** Ids of the top or bottom `count` cards, in stack order (top first). */
export function peekIds(
    state: SandboxState,
    zone: ZoneKey,
    side: "top" | "bottom",
    count: number,
): string[] {

    const cards = state.zones[zone];

    const n = Math.max(0, Math.min(Math.floor(count), cards.length));

    return (
        side === "top"
            ? cards.slice(0, n)
            : cards.slice(cards.length - n)
    ).map(card => card.id);

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
        chain: { plays: [], parries: [] },
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
    verb: "Moved" | "Played" | "Parried with" = "Moved",
): string {

    const first = cardIds[0] ? cardName(state, cardIds[0]) : "a card";

    const what = cardIds.length > 1
        ? `${cardIds.length} cards`
        : first;

    return `${verb} ${what} ${verb === "Moved" ? "to" : "on"} ${describeZone(to)}`;

}
