import { EngineContext } from "@/lib/game/EngineContext";

import { BoundAction } from "@/lib/game/actions";

import { createMoveCardCommand, createOpenParryWindowCommand } from "@/lib/game/commands";

import {
    markActionTaken,
    incrementCardsPlayedThisTurn,
} from "@/lib/game/turn";

export function processBoundAction(

    context: EngineContext,

    action: BoundAction,

): void {

    markActionTaken(
        context,
    );
    
    //
    // Move first half.
    //

    context.commandQueue.push(

        createMoveCardCommand(

            action.firstHalf,

            action.gate,

        ),

    );

    //
    // Move middle.
    //

    for (const card of action.middle) {

        context.commandQueue.push(

            createMoveCardCommand(

                card,

                action.gate,

            ),

        );

    }

    //
    // Move second half.
    //

    context.commandQueue.push(

        createMoveCardCommand(

            action.secondHalf,

            action.gate,

        ),

    );

    //
    // Begin priority.
    //

    context.commandQueue.push(
        createOpenParryWindowCommand(
            action.player,
            [action.gate],
            [action.firstHalf, ...action.middle, action.secondHalf],
        ),
    );

    incrementCardsPlayedThisTurn(
        context,
        1 + action.middle.length + 1,
    );
}