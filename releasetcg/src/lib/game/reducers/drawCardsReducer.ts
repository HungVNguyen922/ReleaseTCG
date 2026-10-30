import { EngineContext } from "../EngineContext";

import {
    DrawCardsCommand,
} from "../commands";

import {
    findPile,
} from "../queries";

import {
    createMoveCardCommand,
} from "../commands";

import {
    emitEvent,
} from "@/lib/game/events/emitEvent";

import {
    createCardsDrawnEvent,
} from "@/lib/game/events/state";

import {
    PileType,
    LocationType,
} from "@/lib/game/models";

import {
    PileReference,
} from "@/lib/game/refs";

export function drawCardsReducer(
    context: EngineContext,
    command: DrawCardsCommand,
): void {

    if (
        command.source.locationType !==
        LocationType.Pile
    ) {

        throw new Error(
            "DrawCardsReducer: source must be a pile.",
        );

    }

    const sourceReference: PileReference =
        command.source;

    const sourcePile =
        findPile(
            context,
            sourceReference,
        );

    if (!sourcePile) {

        throw new Error(
            "DrawCardsReducer: source pile not found.",
        );

    }

    const availableCards =
        sourcePile.cards.slice(
            0,
            command.count,
        );

    const drawn = [];
    const moves = [];

    for (const card of availableCards) {

        moves.push(

            createMoveCardCommand(

                { id: card.id },

                {
                    locationType: LocationType.Pile,
                    pileType: PileType.Hand,
                    playerId: command.player.id,
                },

            ),

        );

        drawn.push({ id: card.id });

    }

    //
    // Run the moves before anything already queued
    // (max hand, end of turn) so drawn cards are in hand first.
    //

    context.commandQueue.unshift(...moves);

    emitEvent(
        context,
        createCardsDrawnEvent(
            command.player,
            drawn,
        ),
    );

}