"use client";

import { useState } from "react";

import { useGame } from "../../providers/GameProvider";
import { useGameRevision } from "../../hooks/useGameRevision";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

export default function WinModal() {

    const { engine, resetGame, clearSelection } = useGame();
    useGameRevision();

    const winnerId = engine.state.winnerId;

    //
    // Remember which win was dismissed so a new winner (after a reset)
    // re-opens the dialog without resetting state in an effect.
    //

    const [dismissedWinnerId, setDismissedWinnerId] =
        useState<string | null>(null);

    const open = !!winnerId && dismissedWinnerId !== winnerId;

    function setDismissed(dismissed: boolean) {
        setDismissedWinnerId(dismissed ? winnerId : null);
    }

    function handlePlayAgain() {
        resetGame();
        clearSelection();
    }

    return (
        <Dialog
            open={open}
            onOpenChange={next => { if (!next) setDismissed(true); }}
        >
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {winnerId} Wins!
                    </DialogTitle>
                    <DialogDescription>
                        The game has ended.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center gap-2 pt-2">
                    <Button onClick={handlePlayAgain}>
                        Play Again
                    </Button>
                    <Button variant="outline" onClick={() => setDismissed(true)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );

}