import { EngineContext } from "@/lib/game/EngineContext";

import { ChainAction } from "../../actions/ChainAction";

import { createMoveCardCommand, createOpenParryWindowCommand } from "@/lib/game/commands";

import {
    markActionTaken,
    incrementCardsPlayedThisTurn,
} from "@/lib/game/turn";

export function processChainAction(

    context: EngineContext,

    action: ChainAction,

): void {

    markActionTaken(
        context,
    );

    for (

        const reference of [

            ...action.openingUnit,

            ...action.chain,

        ]

    ) {

        context.commandQueue.push(

            createMoveCardCommand(

                reference,

                action.gate,

            ),

        );

    }

    context.commandQueue.push(
        createOpenParryWindowCommand(
            action.player,
            [action.gate],
            [...action.openingUnit, ...action.chain],
        ),
    );

    incrementCardsPlayedThisTurn(
        context,
        action.openingUnit.length + action.chain.length,
    );
}