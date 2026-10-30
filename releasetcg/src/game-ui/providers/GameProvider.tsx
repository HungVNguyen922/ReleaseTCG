"use client";

import {
    createContext,
    useContext,
    useState,
    useSyncExternalStore,
} from "react";

import { TestGame } from "@/utils/test/builders/TestGame";

import { CardInstance, ParryState, PlayType, TurnPhase } from "@/lib/game/models";

import { getParryOptions } from "@/lib/game/queries/parry";

import { createBeginPhaseCommand } from "@/lib/game/commands";

import { processEngine } from "@/lib/game/processors";

import { LocationReference } from "@/lib/game/refs";

export type ActivePlay = PlayType | "pass";

export type ActingPlayer = "P1" | "P2";

export function locationRefsEqual(
    a: LocationReference,
    b: LocationReference,
): boolean {

    return JSON.stringify(a) === JSON.stringify(b);

}

interface GameContextValue {

    engine: TestGame;
    revision: number;
    revealP2: boolean;
    toggleRevealP2: () => void;

    activePlayerId: ActingPlayer;
    setActivePlayerId: (id: ActingPlayer) => void;

    activePlay: ActivePlay | null;
    setActivePlay: (play: ActivePlay | null) => void;

    selectedCardIds: string[];
    toggleCard: (cardId: string) => void;

    selectedDestinations: LocationReference[];
    toggleDestination: (ref: LocationReference) => void;

    playError: string | null;

    clearSelection: () => void;
    confirmPlay: () => void;

    playCards: (
        playType: PlayType,
        cardIds: string[],
        destinations: LocationReference[],
    ) => void;

    resetGame: () => void;   // ← added

    parry: ParryState | null;   // ← added
    parryOptionIds: string[];   // ← added

    confirmParry: () => void;   // ← added
    declineParry: () => void;   // ← added

}

const GameContext =
    createContext<GameContextValue | null>(
        null,
    );

interface Props {

    engine: TestGame;
    resetGame: () => void;   // ← added

    children: React.ReactNode;

}

export function GameProvider({
    engine,
    resetGame,
    children,
}: Props) {

    const revision = useSyncExternalStore(
        engine.subscribe.bind(engine),
        () => engine.getRevision(),
        () => engine.getRevision(),
    );

    const [revealP2, setRevealP2] =
        useState(false);

    const [activePlayerId, setActivePlayerId] =
        useState<ActingPlayer>("P1");

    const [activePlay, setActivePlay] =
        useState<ActivePlay | null>(null);

    const [selectedCardIds, setSelectedCardIds] =
        useState<string[]>([]);

    const [selectedDestinations, setSelectedDestinations] =
        useState<LocationReference[]>([]);

    const [playError, setPlayError] =
        useState<string | null>(null);

    function toggleCard(cardId: string) {

        setPlayError(null);

        setSelectedCardIds(current =>
            current.includes(cardId)
                ? current.filter(id => id !== cardId)
                : [...current, cardId],
        );

    }

    function toggleDestination(ref: LocationReference) {

        setPlayError(null);

        setSelectedDestinations(current =>
            current.some(existing => locationRefsEqual(existing, ref))
                ? current.filter(existing => !locationRefsEqual(existing, ref))
                : [...current, ref],
        );

    }

    function clearSelection() {

        setActivePlay(null);
        setSelectedCardIds([]);
        setSelectedDestinations([]);
        setPlayError(null);

    }

    // Instant is the default resting phase. Action only exists so
    // compilePlayIntent / compilePass have something to gate on, so flip
    // into it the moment a real Play or Pass is attempted.
    function ensureActionPhase() {
        if (engine.context.state.turn.phase === TurnPhase.Instant) {
            engine.context.commandQueue.push(
                createBeginPhaseCommand(TurnPhase.Action),
            );
            processEngine(engine.context);
        }
    }

    function playCards(
        playType: PlayType,
        cardIds: string[],
        destinations: LocationReference[],
    ) {
        setPlayError(null);

        const cards: CardInstance[] = [];

        for (const id of cardIds) {
            const card = engine.card(id);
            if (!card) {
                setPlayError("One or more selected cards could not be found.");
                return;
            }
            cards.push(card);
        }

        if (playType !== PlayType.Set) {
            ensureActionPhase();
        }

        const intent = {
            type: "play" as const,
            player: { id: activePlayerId },
            playType,
            cards: cards.map(card => ({ id: card.id })),
            destinations,
        };

        try {
            engine.play(intent);
            clearSelection();
        } catch (err) {
            console.error("playCards failed:", err);
            setPlayError((err as Error).message);
        }
    }

    function confirmPlay() {

        setPlayError(null);

        if (activePlay === "pass") {

            try {
                ensureActionPhase();
                engine.pass(activePlayerId);
                clearSelection();
            } catch (err) {
                setPlayError((err as Error).message);
            }

            return;

        }

        if (!activePlay) {
            setPlayError("Choose a play type first.");
            return;
        }

        playCards(activePlay, selectedCardIds, selectedDestinations);

    }

        const parry = engine.context.state.parry;

    const parryOptionIds = parry
        ? getParryOptions(engine.context, parry.responderId).map(card => card.id)
        : [];

    function confirmParry() {

        setPlayError(null);

        if (selectedCardIds.length !== 1) {
            setPlayError("Select one card to parry with.");
            return;
        }

        try {
            engine.parry(activePlayerId, selectedCardIds[0]);
            setSelectedCardIds([]);
        } catch (err) {
            setPlayError((err as Error).message);
        }

    }

    function declineParry() {

        setPlayError(null);

        try {
            engine.declineParry(activePlayerId);
            setSelectedCardIds([]);
        } catch (err) {
            setPlayError((err as Error).message);
        }

    }

    return (

        <GameContext.Provider
            value={{
                engine,
                revision,
                revealP2,
                toggleRevealP2: () => setRevealP2(v => !v),

                activePlayerId,
                setActivePlayerId,

                activePlay,
                setActivePlay,

                selectedCardIds,
                toggleCard,

                selectedDestinations,
                toggleDestination,

                playError,

                clearSelection,
                confirmPlay,
                playCards,

                resetGame,

                parry,
                parryOptionIds,

                confirmParry,
                declineParry,

                
            }}
        >

            {children}

        </GameContext.Provider>

    );

}

export function useGame() {

    const context =
        useContext(
            GameContext,
        );

    if (!context) {

        throw new Error(
            "useGame must be used inside GameProvider.",
        );

    }

    return context;

}