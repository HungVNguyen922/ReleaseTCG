"use client";

import { useState } from "react";

import type { PlayableCard } from "@/types/cards";

import { SandboxGame, createSandboxState } from "@/lib/sandbox";

import { SandboxProvider } from "./SandboxProvider";

import SandboxBoard from "./components/SandboxBoard";

import SetupScreen from "./SetupScreen";

interface Props {
    cards: PlayableCard[];
}

export default function SandboxController({ cards }: Props) {

    const [game, setGame] = useState<SandboxGame | null>(null);

    if (!game) {

        return (
            <SetupScreen
                cards={cards}
                onStart={(decks, options) =>
                    setGame(new SandboxGame(createSandboxState(decks, options)))
                }
            />
        );

    }

    return (
        <SandboxProvider game={game} onExit={() => setGame(null)}>
            <SandboxBoard />
        </SandboxProvider>
    );

}
