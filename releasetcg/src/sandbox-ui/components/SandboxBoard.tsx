"use client";

import type { CSSProperties } from "react";

import { Button } from "@/components/ui/button";

import {
    SLOTS,
    extraZone,
    gateZone,
    otherSeat,
    setZone,
    type SeatId,
} from "@/lib/sandbox";

import { useSandbox } from "../SandboxProvider";
import { useCompact } from "../useCompact";

import CardPreview from "./CardPreview";
import ChainPanel from "./ChainPanel";
import ContextMenu from "./ContextMenu";
import Hand from "./Hand";
import HealthCounter from "./HealthCounter";
import MoveBanner from "./MoveBanner";
import PositionPrompt from "./PositionPrompt";
import PassButton from "./PassButton";
import PilePanel from "./PilePanel";
import SeatCover from "./SeatCover";
import SelectionBar from "./SelectionBar";
import StackZone from "./StackZone";
import Toolbar from "./Toolbar";
import ZoneBrowser from "./ZoneBrowser";

const SIZES = {
    "--chain-card-h": "8dvh",
    "--hand-card-h": "16dvh",
} as CSSProperties;

/**
 * The play area is a size container so the zones can be sized to exactly
 * fill the space between the two hands: four rows of zones (each with
 * 8px of padding), three 4px gaps and 16px of padding around them.
 */
const FIELD = {
    containerType: "size",
} as CSSProperties;

const ZONES = {
    "--card-h": "calc((100cqh - 64px) / 4)",
    "--pile-h": "calc((100cqh - 64px) / 4 * 0.7)",
} as CSSProperties;

const SLOT_LABELS = ["Left", "Center", "Right"] as const;

function Row({ seat, kind }: { seat: SeatId; kind: "gate" | "set" }) {

    return (
        <div className="flex justify-center gap-2">
            {SLOTS.map(slot => (
                <StackZone
                    key={slot}
                    zone={kind === "gate" ? gateZone(seat, slot) : setZone(seat, slot)}
                    label={`${kind === "gate" ? "Gate" : "Set"} ${SLOT_LABELS[slot]}`}
                />
            ))}
        </div>
    );

}

/** Pass tracker, health counter and extra deck for one player. */
function SeatStats({ seat }: { seat: SeatId }) {

    return (
        <div className="flex items-stretch gap-2">
            <PassButton seat={seat} />
            <HealthCounter seat={seat} />
            <PilePanel zone={extraZone(seat)} title={`${seat} extra deck`} />
        </div>
    );

}

export default function SandboxBoard() {

    const { viewer, selected, clearSelection, game } = useSandbox();

    const opponent = otherSeat(viewer);

    const compact = useCompact();

    return (
        <div
            style={SIZES}
            className="relative flex h-full w-full select-none flex-col overflow-hidden bg-background text-foreground [-webkit-touch-callout:none]"
            onClick={event => {

                // Clicking empty table clears the selection.
                if (event.target === event.currentTarget && selected.length > 0) {
                    clearSelection();
                }

            }}
        >

            <div className="h-[8dvh] shrink-0 border-b bg-muted/30">
                <Hand seat={opponent} />
            </div>

            <div style={FIELD} className="min-h-0 flex-1">

            <div
                style={ZONES}
                className="flex h-full items-stretch justify-between gap-4 overflow-hidden px-3 py-2"
            >

                {/* Left: the chain */}
                <div className={`flex shrink-0 flex-col justify-start ${compact ? "w-[22vw] min-w-36 pl-10" : "w-[22vw] min-w-48"}`}>
                    <ChainPanel />
                </div>

                {/* Middle: the four rows, gates touching */}
                <div className="flex flex-col items-center justify-center gap-1">
                    <Row seat={opponent} kind="set" />
                    <Row seat={opponent} kind="gate" />
                    <Row seat={viewer} kind="gate" />
                    <Row seat={viewer} kind="set" />
                </div>

                {/* Right: [Pass | Health | Extra deck] for each player, piles between */}
                <div className={`flex shrink-0 flex-col items-center justify-between ${compact ? "w-[26vw] min-w-56" : "w-[22vw] min-w-72 pt-16"}`}>

                    <SeatStats seat={opponent} />

                    <div className="flex items-start justify-center gap-4">
                        <PilePanel zone="public" title="Public pile" drawable />
                        <PilePanel zone="gap" title="Gap" showTop />
                    </div>

                    <SeatStats seat={viewer} />

                </div>

            </div>

            </div>

            <div className="flex h-[19dvh] shrink-0 items-stretch border-t bg-muted/30">

                <div className={`flex shrink-0 flex-col items-center justify-center gap-1 px-2 ${compact ? "w-20" : "w-28"}`}>

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
            <SelectionBar />
            <CardPreview />
            <MoveBanner />
            <PositionPrompt />
            <ContextMenu />
            <ZoneBrowser />
            <SeatCover />

            {/* Phones held upright: the board needs a wide screen. */}
            <div className="fixed inset-0 z-[80] hidden flex-col items-center justify-center gap-3 bg-background p-8 text-center max-md:portrait:flex">

                <span className="text-5xl" aria-hidden>&#x21BB;</span>

                <h2 className="text-xl font-bold">Turn your phone sideways</h2>

                <p className="text-sm text-muted-foreground">
                    The sandbox board is laid out for a landscape screen. Rotate your
                    phone (and unlock rotation in Control Centre) to keep playing. Your
                    game is saved while you do.
                </p>

            </div>

        </div>
    );

}
