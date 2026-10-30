import {
    EventListener,
} from "./EventListener";

import {
    EngineContext,
} from "@/lib/game/EngineContext";

import {
    EngineEvent,
    EventType,
} from "@/lib/game/events";

import {
    CardMovedEvent,
} from "@/lib/game/events/state";

import {
    enqueuePendingResolution,
} from "@/lib/game/resolution";

import {
    LocationType,
    PileType,
} from "@/lib/game/models";


export const cardPlayedEventListener: EventListener<CardMovedEvent> = {

    accepts(
        event: EngineEvent,
    ): event is CardMovedEvent {

        return (
            event.type === EventType.CardMoved
        );

    },


    execute(
        context,
        event,
    ) {

        const fromHand =
            event.from.locationType === LocationType.Pile &&
            event.from.pileType === PileType.Hand;

        const fromSet =
            event.from.locationType === LocationType.Set;

        if (!fromHand && !fromSet) {
            return;
        }

        if (
            event.to.locationType !== LocationType.Gate
        ) {
            return;
        }

        enqueuePendingResolution(
            context,
            event.card,
        );

    }
};