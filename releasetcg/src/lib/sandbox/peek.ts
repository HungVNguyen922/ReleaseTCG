import type { SandboxState, ZoneKey } from "./types";

/**
 * Looking through a pile one flip at a time: the first card, counting in
 * from `side`, that has not been flipped yet.
 *
 * `shown` is every card flipped so far. Cards that have since left the pile
 * are simply not found there, so the rest keep their place.
 */
export function nextPeekId(
    state: SandboxState,
    zone: ZoneKey,
    side: "top" | "bottom",
    shown: string[],
): string | null {

    const seen = new Set(shown);

    const cards = state.zones[zone];

    const inOrder = side === "top" ? cards : [...cards].reverse();

    return inOrder.find(card => !seen.has(card.id))?.id ?? null;

}

/** How many cards of a pile have not been flipped yet. */
export function unseenCount(
    state: SandboxState,
    zone: ZoneKey,
    shown: string[],
): number {

    const seen = new Set(shown);

    return state.zones[zone].filter(card => !seen.has(card.id)).length;

}
