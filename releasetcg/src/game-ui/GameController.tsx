"use client";

import { GameProvider } from "./providers/GameProvider";

import { useGameEngine } from "./hooks/useGameEngine";

import GameBoard from "./components/board/GameBoard";

import TurnInfo from "./components/board/TurnInfo";

import OpponentHand from "./components/hand/OpponentHand";
import PlayerHand from "./components/hand/PlayerHand";
import DebugRevealToggle from "./components/debug/DebugRevealToggle";

import PlayTypeSelector from "./components/play/PlayTypeSelector";
import PlayConfirmBar from "./components/play/PlayConfirmBar";
import ParryOverlay from "./components/parry/ParryOverlay";
import WinModal from "./components/modals/WinModal";

import { CardDefinition } from "@/lib/game/models";

export default function GameController(
    props: { cardDefinitions: CardDefinition[] },
) {

    const { engine, resetGame } =
        useGameEngine(props.cardDefinitions);

    if (!engine) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                Loading game...
            </div>
        );
    }

    return (
        <GameProvider engine={engine} resetGame={resetGame}>
            <div className="relative h-full w-full overflow-hidden bg-background">
                <GameBoard />
                <OpponentHand />
                <PlayerHand />
                <TurnInfo />
                <DebugRevealToggle />
                <ParryOverlay/>
                <WinModal />

                <div className="absolute bottom-15 left-4 z-50 flex flex-col items-start gap-2">
                    <PlayConfirmBar />
                    <PlayTypeSelector />
                </div>
            </div>
        </GameProvider>
    );

}