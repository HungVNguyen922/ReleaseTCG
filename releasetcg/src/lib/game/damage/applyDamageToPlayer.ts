import {
    EngineContext,
} from "@/lib/game/EngineContext";

import {
    PlayerReference,
} from "@/lib/game/refs";

import { emitEvent } from "@/lib/game/events/emitEvent";

import { createPlayerDamagedEvent } from "@/lib/game/events/state";

import {
    DamageResult,
} from "./DamageResult";

export function applyDamageToPlayer(

    context: EngineContext,

    target: PlayerReference,

    amount: number,

): DamageResult {

    const player =

        context.state.players.find(

            player => player.id === target.id,

        );

    if (!player) {

        throw new Error(
            "Player not found.",
        );

    }

    player.health = Math.max(0, player.health - amount);

    emitEvent(
        context,
        createPlayerDamagedEvent(
            target,
            amount,
        ),
    );

    return {

        amountApplied: amount,

        prevented: 0,

        destroyed: false,

    };

}