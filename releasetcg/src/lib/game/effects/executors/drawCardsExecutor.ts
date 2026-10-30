import { EngineContext } from "@/lib/game/EngineContext";

import {
    createMoveCardCommand,
} from "@/lib/game/commands";

import {
    LocationType,
    PileType,
} from "@/lib/game/models";

import {
    findCardReference,
} from "@/lib/game/queries/lookup";

import { findTopCard } from "@/lib/game/queries/piles";

import {
    createCardsDrawnEvent,
} from "@/lib/game/events/state";

import {
    emitEvent,
} from "@/lib/game/events";

import {
    DrawCardsOperation,
} from "../operations";

import {
    PileReference,
} from "@/lib/game/refs";

export function drawCardsExecutor(
    context: EngineContext,
    operation: DrawCardsOperation,
): void {

    const drawn = [];

    const deckReference: PileReference = {

        locationType: LocationType.Pile,

        pileType: PileType.PublicPile,

    };

    const handReference: PileReference = {

        locationType: LocationType.Pile,

        pileType: PileType.Hand,

        playerId: operation.player.id,

    };


    for (
        let i = 0;
        i < operation.amount;
        i++
    ) {

        const card =
            findTopCard(
                context,
                deckReference,
            );


        //
        // Stop if the deck is empty.
        //

        if (!card) {
            break;
        }


        const cardReference =
            findCardReference(
                card,
            );


        drawn.push(
            cardReference,
        );


        context.commandQueue.push(

            createMoveCardCommand(

                cardReference,

                handReference,

            ),

        );

    }


    emitEvent(

        context,

        createCardsDrawnEvent(

            operation.player,

            drawn,

        ),

    );

}