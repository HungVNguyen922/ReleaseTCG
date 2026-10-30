"use client";

import {
    useGame,
} from "../../providers/GameProvider";

import {
    useGameRevision,
} from "../../hooks/useGameRevision";

import HandFan from "./HandFan";

import {
    toPlayableCardFromInstance,
} from "@/game-ui/utils/toPlayableCardFromInstance";

export default function PlayerHand() {

    const { engine, selectedCardIds, toggleCard, activePlayerId } = useGame();
    const revision = useGameRevision();

    const cards = engine.hand("P1").map(card => {
        const definition = engine.cardDefinition(card);
        return toPlayableCardFromInstance(card, definition);
    });

    const isActive = activePlayerId === "P1";

    return (
        <HandFan
            key={revision}
            cards={cards}
            position="bottom"
            selectedCardIds={isActive ? selectedCardIds : []}
            onCardClick={isActive ? card => toggleCard(card.id) : undefined}
        />
    );
}