import { EngineContext } from "@/lib/game/EngineContext";

import { createPassAction } from "@/lib/game/actions/PassAction";

import { TurnPhase } from "@/lib/game/models";

import { PlayerReference } from "@/lib/game/refs";

import { RuleResult } from "../RuleResult";

import { failure, success } from "../utils";

export function compilePass(
    context: EngineContext,
    player: PlayerReference,
): RuleResult {

    if (context.state.winnerId) {
        return failure("The game is over.");
    }

    if (player.id !== context.state.turn.currentPlayerId) {
        return failure("It's not your turn.");
    }

    if (context.state.parry) {
        return failure("You can't pass while a parry window is open.");
    }

    if (
        context.state.turn.phase !== TurnPhase.Action ||
        context.state.turn.actionTaken
    ) {
        return failure("You've already made your Play this turn.");
    }

    return success(
        createPassAction(player),
    );

}
