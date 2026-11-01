"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { useSandbox } from "../SandboxProvider";
import { useCompact } from "../useCompact";

export default function Toolbar() {

    const { game, state, viewer, passDevice, exit } = useSandbox();

    const compact = useCompact();

    const [menuOpen, setMenuOpen] = useState(false);

    const [showLog, setShowLog] = useState(false);

    // On a short screen the toolbar would cover the board, so it folds
    // away behind a single Menu button.
    const folded = compact && !menuOpen;

    const [confirmExit, setConfirmExit] = useState(false);

    return (
        <div className="absolute right-2 top-2 z-40 flex w-56 flex-col items-end gap-2 sm:right-3 sm:top-3">

            {compact && (
                <Button size="xs" variant="secondary" onClick={() => setMenuOpen(open => !open)}>
                    {menuOpen ? "Close" : "Menu"}
                </Button>
            )}

            <div className={`flex flex-wrap justify-end gap-1 rounded-xl border bg-card/95 p-2 shadow ${folded ? "hidden" : ""}`}>

                <Button size="xs" variant="outline" onClick={() => game.undo()} disabled={!game.canUndo}>
                    Undo
                </Button>

                <Button size="xs" variant="outline" onClick={() => game.redo()} disabled={!game.canRedo}>
                    Redo
                </Button>

                <Button size="xs" onClick={() => game.nextTurn()}>
                    End turn
                </Button>

                <Button size="xs" variant="secondary" onClick={passDevice}>
                    Pass device to {viewer === "P1" ? "P2" : "P1"}
                </Button>

                <Button size="xs" variant="ghost" onClick={() => setShowLog(value => !value)}>
                    {showLog ? "Hide log" : "Log"}
                </Button>

                {confirmExit ? (
                    <>
                        <Button size="xs" variant="destructive" onClick={exit}>
                            Yes, end sandbox
                        </Button>

                        <Button size="xs" variant="ghost" onClick={() => setConfirmExit(false)}>
                            Cancel
                        </Button>
                    </>
                ) : (
                    <Button size="xs" variant="ghost" onClick={() => setConfirmExit(true)}>
                        New game
                    </Button>
                )}

            </div>

            <div className={`rounded-xl border bg-card/95 px-3 py-1 text-xs shadow ${folded ? "hidden" : ""}`}>
                Turn {state.turn}: <b>{state.activeSeat}</b>. You are <b>{viewer}</b>.
            </div>

            {showLog && !folded && (
                <ul className="max-h-[40dvh] w-full overflow-y-auto rounded-xl border bg-card/95 p-2 text-xs shadow">
                    {state.log.map((entry, index) => (
                        <li key={`${index}-${entry}`} className="border-b py-1 last:border-0">
                            {entry}
                        </li>
                    ))}
                </ul>
            )}

        </div>
    );

}
