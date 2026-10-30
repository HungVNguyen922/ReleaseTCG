import {
    EngineContext,
} from "@/lib/game/EngineContext";

import {
    TurnPhase,
} from "@/lib/game/models";

import {
    processInstantPhase,
} from "./phases";

export function processTurnPhase(

    context: EngineContext,

): void {

    switch (

        context.state.turn.phase

    ) {

        case TurnPhase.Instant:

            processInstantPhase(

                context,

            );

            return;


    }

}