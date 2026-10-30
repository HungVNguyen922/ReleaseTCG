import { EngineContext } from "@/lib/game/EngineContext";

import {
    SplitAction,
} from "@/lib/game/actions";

import { createMoveCardCommand, createOpenParryWindowCommand } from "@/lib/game/commands";

import {
    markActionTaken,
    incrementCardsPlayedThisTurn,
} from "@/lib/game/turn";

export function processSplitAction(

    context: EngineContext,

    action: SplitAction,

): void {

    markActionTaken(
        context,
    );
    
    for (

        let i = 0;

        i < action.cards.length;

        i++

    ) {


        context.commandQueue.push(

            createMoveCardCommand(

                action.cards[i],

                action.gates[i],

            ),

        );

    }

    context.commandQueue.push(
        createOpenParryWindowCommand(action.player, action.gates, action.cards),
    );

    incrementCardsPlayedThisTurn(context, action.cards.length);
}