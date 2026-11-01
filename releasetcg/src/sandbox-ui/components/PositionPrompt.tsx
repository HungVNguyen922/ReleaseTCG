"use client";

import { Button } from "@/components/ui/button";

import { describeZone, parseZone } from "@/lib/sandbox";

import { useSandbox } from "../SandboxProvider";

/** Asks whether cards being moved go on top of or underneath the target zone. */
export default function PositionPrompt() {

    const { pendingMove, confirmMove, cancelPendingMove, state } = useSandbox();

    if (!pendingMove) {
        return null;
    }

    const { ids, target } = pendingMove;

    const count = ids.length;

    const size = state.zones[target].length;

    const isHand = parseZone(target).kind === "hand";

    const labels = isHand
        ? { top: "Left end", bottom: "Right end" }
        : { top: "Top", bottom: "Bottom" };

    return (
        <div
            className="fixed inset-0 z-[65] flex items-center justify-center bg-black/50 p-4"
            onClick={cancelPendingMove}
        >

            <div
                className="flex w-80 max-w-full flex-col gap-3 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-2xl"
                onClick={event => event.stopPropagation()}
            >

                <div>

                    <h2 className="font-bold">
                        Send {count === 1 ? "1 card" : `${count} cards`} to{" "}
                        <span className="capitalize">{describeZone(target)}</span>
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        {size} {size === 1 ? "card" : "cards"} there now.
                        {" "}
                        {isHand ? "Which end of the hand?" : "On top or underneath?"}
                    </p>

                </div>

                <div className="grid grid-cols-2 gap-2">

                    <Button onClick={() => confirmMove("top")}>
                        {labels.top}
                    </Button>

                    <Button variant="outline" onClick={() => confirmMove("bottom")}>
                        {labels.bottom}
                    </Button>

                </div>

                <Button size="sm" variant="ghost" onClick={cancelPendingMove}>
                    Cancel
                </Button>

            </div>

        </div>
    );

}
