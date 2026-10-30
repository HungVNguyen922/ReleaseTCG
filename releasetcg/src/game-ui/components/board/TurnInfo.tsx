"use client";

import { useGame } from "../../providers/GameProvider";

import { useGameRevision } from "../../hooks/useGameRevision";

export default function TurnInfo() {

    const {

        engine,

    } = useGame();

    useGameRevision();

    const turn =
        engine.context.state.turn;

    return (

        <header className="border-b p-4 left-[2%] top-2/5 absolute w-[10%] text-center text-lg font-bold">

            Turn {

                turn.turnNumber

            }

            <div className="mt-2 border-t pt-2 text-sm font-normal capitalize text-muted-foreground">

                {turn.currentPlayerId}&apos;s {turn.phase} phase

            </div>

        </header>

    );

}