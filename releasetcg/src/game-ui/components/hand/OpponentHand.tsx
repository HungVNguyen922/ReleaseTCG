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

export default function OpponentHand() {

    const { engine, revealP2, selectedCardIds, toggleCard, activePlayerId } = useGame();
    const revision = useGameRevision();

    const cards = engine.hand("P2").map(card => {
        const definition = engine.cardDefinition(card);
        return toPlayableCardFromInstance(card, definition);
    });

    const isActive = activePlayerId === "P2";

    return (
        <HandFan
            key={revision}
            cards={cards}
            hidden={!revealP2}
            position="top"
            selectedCardIds={isActive ? selectedCardIds : []}
            onCardClick={isActive ? card => toggleCard(card.id) : undefined}
        />
    );

}