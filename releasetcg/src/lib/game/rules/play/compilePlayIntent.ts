import { PlayType, TurnPhase } from "../../models";

import { PlayIntent } from "@/lib/game/intents";

import { EngineContext } from "@/lib/game/";

import { RuleResult } from "../RuleResult";

import {
    compileBound,
    compileBurn,
    compileChain,
    compileConstruct,
    compileLiminal,
    compileSplit,
    compileSet,
} from "./";
import { failure } from "../utils";

export function compilePlayIntent(
    context: EngineContext,
    intent: PlayIntent,
): RuleResult {

    if (context.state.parry) {
        return failure("A parry window is open.");
    }

    if (intent.player.id !== context.state.turn.currentPlayerId) {
        return failure("It's not your turn.");
    }

    if (
        intent.playType !== PlayType.Set &&
        (
            context.state.turn.phase !== TurnPhase.Action ||
            context.state.turn.actionTaken
        )
    ) {
        return failure(
            "You've already made your Play this turn.",
        );
    }
    
    switch (intent.playType) {

        case PlayType.Burn:
            return compileBurn(context, intent);

        case PlayType.Chain:
            return compileChain(context, intent);

        case PlayType.Construct:
            return compileConstruct(context, intent);

        case PlayType.Bound:
            return compileBound(context, intent);

        case PlayType.Split:
            return compileSplit(context, intent);

        case PlayType.Liminal:
            return compileLiminal(context, intent);

        case PlayType.Set:
            return compileSet(context, intent);
    }

}