"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import PileBack from "@/game-ui/components/piles/PileBack";

import type { ZoneKey } from "@/lib/sandbox";

import CardView from "./CardView";
import DropZone from "./DropZone";

import { useSandbox } from "../SandboxProvider";

interface Props {

    zone: ZoneKey;

    title: string;

    /** Show the top card instead of a card back (e.g. the gap). */
    showTop?: boolean;

    /** Offer Draw / Shuffle controls (the public pile). */
    drawable?: boolean;

}

export default function PilePanel({
    zone,
    title,
    showTop = false,
    drawable = false,
}: Props) {

    const { state, game, viewer, browse, openMenu } = useSandbox();

    const [amount, setAmount] = useState(1);

    const cards = state.zones[zone];

    const top = cards[0];

    return (
        <div className="flex flex-col items-center gap-1">

            <span className="text-xs font-medium text-muted-foreground">
                {title}
            </span>

            <DropZone
                zone={zone}
                className="p-1"
                title="Right-click to look at the top or bottom cards"
                onContextMenu={event => {
                    event.preventDefault();
                    openMenu(event.clientX, event.clientY, [], zone);
                }}
            >

                <div className="aspect-[5/7] h-[var(--card-h)]">

                    {showTop && top ? (
                        <CardView sc={top} />
                    ) : cards.length > 0 ? (
                        <PileBack count={cards.length} />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/40 text-xs text-muted-foreground">
                            empty
                        </div>
                    )}

                </div>

            </DropZone>

            <div className="flex flex-wrap items-center justify-center gap-1">

                {drawable && (
                    <>
                        <input
                            type="number"
                            min={1}
                            value={amount}
                            onChange={event =>
                                setAmount(Math.max(1, Number(event.target.value) || 1))
                            }
                            className="h-6 w-12 rounded border bg-background px-1 text-center text-xs"
                            aria-label="Cards to draw"
                        />

                        <Button
                            size="xs"
                            onClick={() => game.draw(viewer, amount, zone)}
                            disabled={cards.length === 0}
                        >
                            Draw
                        </Button>

                        <Button
                            size="xs"
                            variant="outline"
                            onClick={() => game.shuffle(zone)}
                            disabled={cards.length < 2}
                        >
                            Shuffle
                        </Button>
                    </>
                )}

                {/*
                  The draw pile has no Browse button: looking through it
                  reveals too much. Right-click it to look at the top or
                  bottom few cards instead.
                */}
                {!drawable && (
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={() => browse(zone)}
                        disabled={cards.length === 0}
                    >
                        Browse ({cards.length})
                    </Button>
                )}

                {drawable && (
                    <span className="text-xs text-muted-foreground">
                        {cards.length} cards
                    </span>
                )}

            </div>

        </div>
    );

}
