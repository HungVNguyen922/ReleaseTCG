import { EngineContext } from "@/lib/game/EngineContext";

import {
    findPlayer,
} from "@/lib/game/queries";

import {
    createPlayerDamagedEvent,
} from "@/lib/game/events/state";

import { emitEvent } from "@/lib/game/events";

import {
    DamagePlayerOperation,
} from "../operations";

export function damagePlayerExecutor(
    context: EngineContext,
    command: DamagePlayerOperation,
): void {

    const player =
        findPlayer(
            context,
            command.player,
        );

    if (!player) {

        throw new Error(
            "Player not found.",
        );

    }

    player.health = Math.max(0, player.health - command.amount);

    emitEvent(

        context,

        createPlayerDamagedEvent(

            command.player,

            command.amount,

        ),

    );

}