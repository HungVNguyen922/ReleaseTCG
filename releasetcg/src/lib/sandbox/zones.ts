import {
    SEATS,
    SLOTS,
    type SeatId,
    type SlotIndex,
    type ZoneKey,
    type ZoneKind,
} from "./types";

export const PUBLIC_ZONE: ZoneKey = "public";

export const GAP_ZONE: ZoneKey = "gap";

export function handZone(seat: SeatId): ZoneKey {
    return `hand:${seat}`;
}

export function deckZone(seat: SeatId): ZoneKey {
    return `deck:${seat}`;
}

export function extraZone(seat: SeatId): ZoneKey {
    return `extra:${seat}`;
}

export function gateZone(seat: SeatId, slot: SlotIndex): ZoneKey {
    return `gate:${seat}:${slot}`;
}

export function setZone(seat: SeatId, slot: SlotIndex): ZoneKey {
    return `set:${seat}:${slot}`;
}

export function otherSeat(seat: SeatId): SeatId {
    return seat === "P1" ? "P2" : "P1";
}

export function allZoneKeys(): ZoneKey[] {

    const keys: ZoneKey[] = [PUBLIC_ZONE, GAP_ZONE];

    for (const seat of SEATS) {

        keys.push(handZone(seat), deckZone(seat), extraZone(seat));

        for (const slot of SLOTS) {
            keys.push(gateZone(seat, slot), setZone(seat, slot));
        }

    }

    return keys;

}

export interface ParsedZone {
    kind: ZoneKind;
    seat: SeatId | null;
    slot: SlotIndex | null;
}

export function parseZone(key: ZoneKey): ParsedZone {

    const [kind, seat, slot] = key.split(":");

    return {
        kind: kind as ZoneKind,
        seat: (seat as SeatId | undefined) ?? null,
        slot: slot === undefined ? null : (Number(slot) as SlotIndex),
    };

}

export function isBoardZone(key: ZoneKey): boolean {

    const { kind } = parseZone(key);

    return kind === "gate" || kind === "set";

}

const SLOT_NAMES = ["left", "center", "right"] as const;

export function describeZone(key: ZoneKey): string {

    const { kind, seat, slot } = parseZone(key);

    switch (kind) {

        case "hand":
            return `${seat} hand`;

        case "deck":
            return `${seat} deck`;

        case "extra":
            return `${seat} extra deck`;

        case "public":
            return "the public pile";

        case "gap":
            return "the gap";

        case "gate":
            return `${seat} ${SLOT_NAMES[slot ?? 0]} gate`;

        case "set":
            return `${seat} ${SLOT_NAMES[slot ?? 0]} set zone`;

    }

}
