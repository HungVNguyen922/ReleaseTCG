"use client";

import type { CSSProperties } from "react";

import { Button } from "@/components/ui/button";

import { otherSeat } from "@/lib/sandbox";

import { useSandbox } from "../SandboxProvider";

import CardMenu from "./CardMenu";
import CardPreview from "./CardPreview";
import Hand from "./Hand";
import PilePanel from "./PilePanel";
import SeatCover from "./SeatCover";
import SeatField from "./SeatField";
import Toolbar from "./Toolbar";
import ZoneBrowser from "./ZoneBrowser";

const SIZES = {
    "--card-h": "11vh",
    "--hand-card-h": "16vh",
} as CSSProperties;

export default function SandboxBoard() {

    const { viewer, selected, clearSelection, game } = useSandbox();

    const opponent = otherSeat(viewer);

    return (
        <div
            style={SIZES}
            className="relative flex h-full w-full flex-col overflow-hidden bg-background text-foreground"
            onClick={event => {

                // Clicking empty table clears the selection.
                if (event.target === event.currentTarget && selected.length > 0) {
                    clearSelection();
                }

            }}
        >

            <div className="h-[8vh] shrink-0 border-b bg-muted/30">
                <Hand seat={opponent} />
            </div>

            <div className="flex min-h-0 flex-1 flex-col items-center justify-evenly">

                <SeatField seat={opponent} edge="top" />

                <div className="flex items-center justify-center gap-8">
                    <PilePanel zone="public" title="Public pile" drawable />
                    <PilePanel zone="gap" title="Gap" showTop />
                </div>

                <SeatField seat={viewer} edge="bottom" />

            </div>

            <div className="flex h-[19vh] shrink-0 items-stretch border-t bg-muted/30">

                <div className="flex w-28 shrink-0 flex-col items-center justify-center gap-1 px-2">

                    <span className="text-xs font-medium">{viewer} hand</span>

                    <Button size="xs" onClick={() => game.draw(viewer, 1)}>
                        Draw 1
                    </Button>

                </div>

                <div className="min-w-0 flex-1">
                    <Hand seat={viewer} />
                </div>

            </div>

            <Toolbar />
            <CardPreview />
            <CardMenu />
            <ZoneBrowser />
            <SeatCover />

        </div>
    );

}
