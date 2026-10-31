"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { useSandbox } from "../SandboxProvider";

export default function Toolbar() {

    const { game, state, viewer, passDevice, exit } = useSandbox();

    const [showLog, setShowLog] = useState(false);

    const [confirmExit, setConfirmExit] = useState(false);

    return (
        <div className="absolute right-3 top-3 z-40 flex w-56 flex-col items-end gap-2">

            <div className="flex flex-wrap justify-end gap-1 rounded-xl border bg-card/95 p-2 shadow">

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

            <div className="rounded-xl border bg-card/95 px-3 py-1 text-xs shadow">
                Turn {state.turn}: <b>{state.activeSeat}</b>. You are <b>{viewer}</b>.
            </div>

            {showLog && (
                <ul className="max-h-[40vh] w-full overflow-y-auto rounded-xl border bg-card/95 p-2 text-xs shadow">
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
