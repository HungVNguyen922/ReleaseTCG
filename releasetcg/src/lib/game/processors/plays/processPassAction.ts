import { EngineContext } from "@/lib/game/EngineContext";

import { PassAction } from "../../actions/PassAction";

import { findPlayer } from "../../queries";

import {
    createBeginPhaseCommand,
    createPassCommand,
} from "@/lib/game/commands";

import {
    markActionTaken,
} from "@/lib/game/turn";

import { TurnPhase } from "../../models";

export function processPassAction(
    context: EngineContext,
    action: PassAction,
): void {

    const player = findPlayer(
        context,
        action.player,
    );

    if (!player) {
        throw new Error(
            "PassAction references a player that does not exist.",
        );
    }

    //
    // The pass reducer spends a pass, or ends the game
    // if the player has none left.
    //

    context.commandQueue.push(
        createPassCommand(),
    );

    if (player.passesRemaining <= 0) {
        return;
    }

    markActionTaken(context);

    context.commandQueue.push(
        createBeginPhaseCommand(
            TurnPhase.Fill,
        ),
    );

}
