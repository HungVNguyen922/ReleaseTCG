"use client";

import { Button } from "@/components/ui/button";

import {
    describeZone,
    extraZone,
    handZone,
    parseZone,
} from "@/lib/sandbox";

import CardView from "./CardView";

import { useSandbox } from "../SandboxProvider";

/**
 * Full-screen view of one zone, or of just its top/bottom few cards when
 * opened through "Look at" (so the rest of the deck stays unknown).
 */
export default function ZoneBrowser() {

    const {
        peek,
        closePeek,
        browsing,
        browse,
        state,
        game,
        viewer,
        selected,
        toggleSelect,
        clearSelection,
        dropCards,
    } = useSandbox();

    const zone = peek?.zone ?? browsing;

    if (!zone) {
        return null;
    }

    const all = state.zones[zone];

    // A peek only shows the cards that were looked at (if still there).
    const cards = peek
        ? peek.ids.flatMap(id => all.filter(card => card.id === id))
        : all;

    const close = () => (peek ? closePeek() : browse(null));

    const { kind } = parseZone(zone);

    function sendSelected(to: Parameters<typeof dropCards>[1], position?: "top" | "bottom") {

        if (selected.length === 0) {
            return;
        }

        dropCards(selected, to, position ? { position } : undefined);

    }

    const topN = (count: number) => cards.slice(0, count).map(card => card.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">

            <div className="flex max-h-full w-full max-w-6xl flex-col gap-3 rounded-2xl border bg-background p-4 shadow-2xl">

                <div className="flex flex-wrap items-center justify-between gap-2">

                    <h2 className="text-lg font-bold capitalize">
                        {peek
                            ? `${peek.side === "top" ? "Top" : "Bottom"} ${cards.length} of ${describeZone(zone)}`
                            : `${describeZone(zone)} (${cards.length})`}
                    </h2>

                    <div className="flex flex-wrap items-center gap-1">

                        <Button size="sm" variant="outline" onClick={() => game.shuffle(zone)} disabled={all.length < 2}>
                            Shuffle
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => dropCards(topN(1), handZone(viewer))}
                            disabled={cards.length === 0 || peek?.side === "bottom"}
                        >
                            Take top to hand
                        </Button>

                        <Button size="sm" variant="outline" onClick={close}>
                            Close
                        </Button>

                    </div>

                </div>

                <div className="flex flex-wrap items-center gap-1 text-sm">

                    <span className="text-muted-foreground">
                        {selected.length} selected. Send to:
                    </span>

                    <Button size="xs" onClick={() => sendSelected(handZone(viewer))} disabled={selected.length === 0}>
                        {viewer} hand
                    </Button>

                    <Button size="xs" variant="outline" onClick={() => sendSelected("public", "top")} disabled={selected.length === 0}>
                        Public top
                    </Button>

                    <Button size="xs" variant="outline" onClick={() => sendSelected("public", "bottom")} disabled={selected.length === 0}>
                        Public bottom
                    </Button>

                    <Button size="xs" variant="outline" onClick={() => sendSelected("gap")} disabled={selected.length === 0}>
                        Gap
                    </Button>

                    <Button size="xs" variant="outline" onClick={() => sendSelected(extraZone(viewer))} disabled={selected.length === 0}>
                        {viewer} extra
                    </Button>

                    <Button size="xs" variant="ghost" onClick={() => game.flip(selected)} disabled={selected.length === 0}>
                        Flip
                    </Button>

                    <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => (selected.length > 0 ? clearSelection() : cards.forEach(card => toggleSelect(card.id)))}
                    >
                        {selected.length > 0 ? "Clear" : "Select all"}
                    </Button>

                </div>

                <p className="text-xs text-muted-foreground">
                    {peek && "Only these cards were looked at; the rest of the pile stays hidden. "}
                    Top of the {kind === "gate" || kind === "set" ? "stack" : "pile"} is first. Click cards to select; right-click for more options.
                </p>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3 overflow-y-auto p-1">

                    {cards.map((sc, index) => (
                        <div key={sc.id} className="relative">

                            <div className="aspect-[5/7] w-full">
                                <CardView sc={{ ...sc, faceUp: true }} />
                            </div>

                            <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[10px] text-white">
                                {index + 1}
                            </span>

                        </div>
                    ))}

                </div>

            </div>

        </div>
    );

}
