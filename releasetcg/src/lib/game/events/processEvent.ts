import { EngineContext } from "../EngineContext";

import {
    EngineEvent,
} from ".";

import { getEventListeners } from "./listeners/EventListenerRegistry";

export function processEvent(
    context: EngineContext,
    event: EngineEvent,
): void {
    for (const listener of getEventListeners()) {
        if (listener.accepts(event)) {
            listener.execute(context, event);
        }
    }
}