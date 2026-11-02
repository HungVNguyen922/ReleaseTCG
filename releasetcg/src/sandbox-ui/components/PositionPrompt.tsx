"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { describeZone, parseZone } from "@/lib/sandbox";

import { useSandbox, type PendingMove } from "../SandboxProvider";

/**
 * Asked when cards are sent to a zone: top or bottom (when the zone has
 * cards) and face up or face down (where the face is visible).
 */
export default function PositionPrompt() {

    const { pendingMove } = useSandbox();

    if (!pendingMove) {
        return null;
    }

    // Keyed so every new move starts from fresh defaults.
    return (
        <PromptBody
            key={`${pendingMove.target}:${pendingMove.ids.join(",")}`}
            pending={pendingMove}
        />
    );

}

function PromptBody({ pending }: { pending: PendingMove }) {

    const { confirmMove, cancelPendingMove, state } = useSandbox();

    const { ids, target, askPosition, askFace } = pending;

    const [position, setPosition] = useState<"top" | "bottom">("top");

    const [faceUp, setFaceUp] = useState(pending.faceUp);

    const count = ids.length;

    const size = state.zones[target].length;

    const isHand = parseZone(target).kind === "hand";

    const positionLabels = isHand
        ? { top: "Left end", bottom: "Right end" }
        : { top: "Top", bottom: "Bottom" };

    function send() {

        confirmMove({
            ...(askPosition ? { position } : {}),
            ...(askFace ? { faceUp } : {}),
        });

    }

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
                    </p>

                </div>

                {askPosition && (
                    <div className="flex flex-col gap-1">

                        <span className="text-xs font-medium text-muted-foreground">
                            {isHand ? "Which end of the hand?" : "On top or underneath?"}
                        </span>

                        <div className="grid grid-cols-2 gap-2">

                            <Button
                                variant={position === "top" ? "default" : "outline"}
                                aria-pressed={position === "top"}
                                onClick={() => setPosition("top")}
                            >
                                {positionLabels.top}
                            </Button>

                            <Button
                                variant={position === "bottom" ? "default" : "outline"}
                                aria-pressed={position === "bottom"}
                                onClick={() => setPosition("bottom")}
                            >
                                {positionLabels.bottom}
                            </Button>

                        </div>

                    </div>
                )}

                {askFace && (
                    <div className="flex flex-col gap-1">

                        <span className="text-xs font-medium text-muted-foreground">
                            Face up or face down?
                        </span>

                        <div className="grid grid-cols-2 gap-2">

                            <Button
                                variant={faceUp ? "default" : "outline"}
                                aria-pressed={faceUp}
                                onClick={() => setFaceUp(true)}
                            >
                                Face up
                            </Button>

                            <Button
                                variant={!faceUp ? "default" : "outline"}
                                aria-pressed={!faceUp}
                                onClick={() => setFaceUp(false)}
                            >
                                Face down
                            </Button>

                        </div>

                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">

                    <Button variant="ghost" onClick={cancelPendingMove}>
                        Cancel
                    </Button>

                    <Button onClick={send} autoFocus>
                        Send
                    </Button>

                </div>

            </div>

        </div>
    );

}
