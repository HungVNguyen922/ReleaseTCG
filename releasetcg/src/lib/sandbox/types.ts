import type { PlayableCard } from "@/types/cards";

export type SeatId = "P1" | "P2";

export const SEATS: readonly SeatId[] = ["P1", "P2"];

export type SlotIndex = 0 | 1 | 2;

export const SLOTS: readonly SlotIndex[] = [0, 1, 2];

/**
 * Every place a card can be.
 *
 * Index 0 of a zone's card list is always the TOP of that zone.
 * For a hand, index 0 is the leftmost card.
 */
export type ZoneKey =
    | `hand:${SeatId}`
    | `deck:${SeatId}`
    | `extra:${SeatId}`
    | "public"
    | "gap"
    | `gate:${SeatId}:${SlotIndex}`
    | `set:${SeatId}:${SlotIndex}`;

export type ZoneKind =
    | "hand"
    | "deck"
    | "extra"
    | "public"
    | "gap"
    | "gate"
    | "set";

export interface SandboxCard {

    /** Unique for this physical card in this sandbox game. */
    id: string;

    card: PlayableCard;

    /** Who brought this card (and whose deck it returns to). */
    owner: SeatId;

    /** Only meaningful on the board and in the gap. */
    faceUp: boolean;

}

/**
 * The pending Play and the Parries answering it, as card ids in the
 * order they were played. Only cards currently sitting on a gate stay in
 * here, so moving a card away resolves it automatically.
 */
export interface ChainState {

    /** Cards played this turn (hand or set zone -> gate), oldest first. */
    plays: string[];

    /** Parries played in response, oldest first. */
    parries: string[];

}

export interface SandboxState {

    zones: Record<ZoneKey, SandboxCard[]>;

    chain: ChainState;

    health: Record<SeatId, number>;

    /** Each player gets one Pass per game; true once it has been spent. */
    passUsed: Record<SeatId, boolean>;

    /** Purely informational: whose turn the table says it is. */
    activeSeat: SeatId;

    turn: number;

    /** Newest first. */
    log: string[];

}

/** Where inside the destination zone a card lands. */
export type ZonePosition = "top" | "bottom" | number;
