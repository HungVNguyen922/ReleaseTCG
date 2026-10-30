import { EngineContext } from "../EngineContext";

import {
    GameAction,
    ActionType,
} from "../actions";

import {
    processBurnAction, processConstructAction, processChainAction, processBoundAction, processSplitAction, processLiminalAction,
    processSetAction,
    processPassAction,
    processParryAction,
} from "./plays";


export function processAction(
    context: EngineContext,
    action: GameAction,
): void {

    switch (action.type) {

        case ActionType.Burn:

            processBurnAction(
                context,
                action,
            );

            return;

        case ActionType.Construct:

            processConstructAction(
                context,
                action,
            );

            return;
        
        case ActionType.Chain:

            processChainAction(
                context,
                action,
            );

            return;

        case ActionType.Bound:

            processBoundAction(
                context,
                action,
            );

            return;

        case ActionType.Split:

            processSplitAction(
                context,
                action,
            );

            return;

        case ActionType.Liminal:

            processLiminalAction(
                context,
                action,
            );

            return;

        case ActionType.Set:

            processSetAction(
                context,
                action,
            );

            return;
        
        case ActionType.Pass:
            processPassAction(context, action);
            return;

        case ActionType.Parry:
        case ActionType.DeclineParry:
            processParryAction(context, action);
            return;

        default:

            throw new Error(
                `Unhandled action type: ${action.type}`,
            );

    }

}