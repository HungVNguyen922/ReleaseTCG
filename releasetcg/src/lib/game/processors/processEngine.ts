import { EngineContext } from "../EngineContext";

import { processCommandQueue } from "./processCommandQueue";

import { processGame } from "./";

import { hasPendingInteractions } from "@/lib/game/interactions";

import { checkWinConditions } from "../rules/wincons";

import { processPendingResolutionQueue } from "../resolution";

export function processEngine(
    context: EngineContext,
): void {

    while (true) {

        let processed = processCommandQueue(
            context,
        );

        //
        // Resolve "on play" abilities queued by played cards.
        //

        if (
            !hasPendingInteractions(context) &&
            context.pendingResolutions.length > 0
        ) {

            processed += context.pendingResolutions.length;

            processPendingResolutionQueue(
                context,
            );

        }

        checkWinConditions(
            context,
        );

        if (
            context.state.winnerId
        ) {
            return;
        }

        if (
            hasPendingInteractions(
                context,
            )
        ) {
            return;
        }

        processGame(
            context,
        );

        //
        // Nothing happened.
        //

        if (

            processed === 0 &&
            context.commandQueue.length === 0 &&
            context.pendingResolutions.length === 0

        ) {

            return;

        }

    }

}