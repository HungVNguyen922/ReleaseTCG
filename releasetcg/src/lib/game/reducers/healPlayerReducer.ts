import { EngineContext } from "../EngineContext";

import {
    HealPlayerCommand,
} from "../commands";

import {
    emitEvent,
} from "@/lib/game/events/emitEvent";

import {
    createPlayerHealedEvent,
} from "@/lib/game/events/state";

export function healPlayerReducer(
    context: EngineContext,
    command: HealPlayerCommand,
): void {

    const player =
        context.state.players.find(
            player => player.id === command.player.id,
        );

    if (!player) {

        throw new Error(
            "HealPlayerReducer: player not found.",
        );

    }

    player.health += command.amount;

    emitEvent(
        context,
        createPlayerHealedEvent(
            command.player,
            command.amount,
        ),
    );

}
