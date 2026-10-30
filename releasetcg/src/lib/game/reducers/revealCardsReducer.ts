import { EngineContext } from "../EngineContext";

import {
    RevealCardsCommand,
} from "../commands";

import {
    emitEvent,
} from "@/lib/game/events/emitEvent";

import {
    createCardsRevealedEvent,
} from "@/lib/game/events/state";

export function revealCardsReducer(
    context: EngineContext,
    command: RevealCardsCommand,
): void {

    //
    // Revealing is informational: no state changes.
    //

    emitEvent(
        context,
        createCardsRevealedEvent(
            command.cards,
            command.viewers,
        ),
    );

}
