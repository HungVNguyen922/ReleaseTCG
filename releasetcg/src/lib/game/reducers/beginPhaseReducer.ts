import { EngineContext } from "../EngineContext";

import { TurnPhase } from "../models";
import {
    BeginPhaseCommand,
} from "../commands";

import {
    emitEvent,
} from "@/lib/game/events/emitEvent";

import {
    createPhaseStartedEvent,
} from "@/lib/game/events/gameplay";

export function beginPhaseReducer(
    context: EngineContext,
    command: BeginPhaseCommand,
): void {

    if (
        command.phase === TurnPhase.Fill &&
        context.state.turn.phase === TurnPhase.Fill
    ) {
        return;
    }

    context.state.turn.phase = command.phase;

    emitEvent(
        context,
        createPhaseStartedEvent(
            command.phase,
        ),
    );

}