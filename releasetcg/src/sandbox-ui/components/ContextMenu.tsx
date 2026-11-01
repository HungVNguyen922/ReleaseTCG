"use client";

import { useState } from "react";

import {
    currentPlayGate,
    describeZone,
    SLOTS,
    extraZone,
    findCard,
    gateZone,
    handZone,
    otherSeat,
    parseZone,
    setZone,
    type SeatId,
    type ZoneKey,
} from "@/lib/sandbox";

import { useSandbox } from "../SandboxProvider";

const PILE_KINDS = ["gate", "set", "gap", "public", "extra"];

interface Item {
    label: string;
    run: () => void;
}

/**
 * Right-click menu. Opens on a card (move / flip / parry) and, when that
 * card sits in a pile or stack, also offers looking at its top or bottom
 * cards. It can also open on a pile itself.
 */
export default function ContextMenu() {

    const {
        menu,
        closeMenu,
        game,
        state,
        viewer,
        dropCards,
        browse,
        openPeek,
        startMove,
    } = useSandbox();

    const [count, setCount] = useState(3);

    if (!menu) {
        return null;
    }

    const ids = menu.cardIds.filter(id => findCard(state, id));

    // The pile this menu is about: the one clicked, or the one the card is in.
    let zone: ZoneKey | null = menu.zone;

    if (!zone && ids.length > 0) {

        const zones = new Set(ids.map(id => findCard(state, id)?.zone));

        const only = zones.size === 1 ? [...zones][0] : undefined;

        if (only && PILE_KINDS.includes(parseZone(only).kind)) {
            zone = only;
        }

    }

    if (ids.length === 0 && !zone) {
        return null;
    }

    function sendTo(target: ZoneKey, position?: "top" | "bottom"): () => void {

        return () => {
            dropCards(ids, target, position ? { position } : undefined);
            closeMenu();
        };

    }

    const cardItems: Item[] = [];

    if (ids.length > 0) {

        cardItems.push({
            label: ids.length > 1 ? `Flip ${ids.length} cards` : "Flip face up / down",
            run: () => {
                game.flip(ids);
                closeMenu();
            },
        });

        if (currentPlayGate(state)) {

            cardItems.push({
                label: "Play as parry",
                run: () => {
                    game.parry(ids);
                    closeMenu();
                },
            });

        }

    }

    const zoneCount = zone ? state.zones[zone].length : 0;

    const left = Math.max(8, Math.min(menu.x, window.innerWidth - 310));

    const top = Math.max(8, Math.min(menu.y, window.innerHeight - 560));

    // Where cards are already sitting, so that destination can be greyed out.
    const currentZones = new Set(ids.map(id => findCard(state, id)?.zone));

    const alreadyThere = (target: ZoneKey) =>
        currentZones.size === 1 && currentZones.has(target);

    const chipClass = "rounded-md border px-2 py-1 text-xs hover:bg-muted disabled:opacity-35 disabled:hover:bg-transparent";

    function Chip({
        label,
        target,
        position,
        title,
    }: {
        label: string;
        target: ZoneKey;
        position?: "top" | "bottom";
        title?: string;
    }) {

        return (
            <button
                type="button"
                title={title ?? describeZone(target)}
                disabled={alreadyThere(target) && !position}
                className={chipClass}
                onClick={sendTo(target, position)}
            >
                {label}
            </button>
        );

    }

    const seatOrder: SeatId[] = [viewer, otherSeat(viewer)];

    const seatBlock = (seat: SeatId) => (
        <div key={seat} className="px-3 pb-2">

            <div className="pb-1 text-xs font-medium">
                {seat}{seat === viewer ? " (you)" : " (opponent)"}
            </div>

            <div className="flex flex-wrap gap-1">

                <Chip label="Hand" target={handZone(seat)} />

                <Chip label="Extra deck" target={extraZone(seat)} />

            </div>

            <div className="mt-1 flex items-center gap-1">

                <span className="w-8 text-[11px] text-muted-foreground">Gate</span>

                {SLOTS.map(slot => (
                    <Chip
                        key={slot}
                        label={["Left", "Center", "Right"][slot]}
                        target={gateZone(seat, slot)}
                    />
                ))}

            </div>

            <div className="mt-1 flex items-center gap-1">

                <span className="w-8 text-[11px] text-muted-foreground">Set</span>

                {SLOTS.map(slot => (
                    <Chip
                        key={slot}
                        label={["Left", "Center", "Right"][slot]}
                        target={setZone(seat, slot)}
                    />
                ))}

            </div>

        </div>
    );

    const itemClass = "block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted";

    const lookClass = "rounded-lg border px-3 py-1 text-sm hover:bg-muted disabled:opacity-40";

    return (
        <div
            className="fixed inset-0 z-[60]"
            onClick={closeMenu}
            onContextMenu={event => {
                event.preventDefault();
                closeMenu();
            }}
        >

            <div
                style={{ left, top, maxHeight: window.innerHeight - top - 8 }}
                className="absolute w-72 overflow-y-auto rounded-xl border bg-popover p-1 text-popover-foreground shadow-xl"
                onClick={event => event.stopPropagation()}
            >

                {cardItems.map(item => (
                    <button key={item.label} type="button" onClick={item.run} className={itemClass}>
                        {item.label}
                    </button>
                ))}

                {ids.length > 0 && (
                    <>

                        <div className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">
                            Move {ids.length > 1 ? `${ids.length} cards` : "card"} to
                        </div>

                        {seatOrder.map(seatBlock)}

                        <div className="px-3 pb-2">

                            <div className="pb-1 text-xs font-medium">Shared</div>

                            <div className="flex flex-wrap gap-1">
                                <Chip label="Public top" target="public" position="top" title="Top of the public pile" />
                                <Chip label="Public bottom" target="public" position="bottom" title="Bottom of the public pile" />
                                <Chip label="Gap" target="gap" position="top" title="The gap" />
                            </div>

                        </div>

                    </>
                )}

                {zone && (
                    <>

                        {ids.length > 0 && <div className="my-1 border-t" />}

                        {cardItems.length > 0 && <div className="my-1 border-t" />}

                        <div className="px-3 pb-1 pt-2 text-xs font-medium capitalize text-muted-foreground">
                            {describeZone(zone)} ({zoneCount})
                        </div>

                        <div className="flex items-center gap-1 px-3 py-1">

                            <span className="text-sm">Cards</span>

                            <input
                                type="number"
                                min={1}
                                value={count}
                                onChange={event =>
                                    setCount(Math.max(1, Number(event.target.value) || 1))
                                }
                                aria-label="How many cards"
                                className="h-8 w-14 rounded border bg-background px-1 text-center text-sm"
                            />

                        </div>

                        <div className="px-3 pt-1 text-xs text-muted-foreground">Look at</div>

                        <div className="flex gap-1 px-3 pb-1">

                            <button
                                type="button"
                                className={lookClass}
                                disabled={zoneCount === 0}
                                onClick={() => openPeek(zone, "top", count)}
                            >
                                Top {count}
                            </button>

                            <button
                                type="button"
                                className={lookClass}
                                disabled={zoneCount === 0}
                                onClick={() => openPeek(zone, "bottom", count)}
                            >
                                Bottom {count}
                            </button>

                        </div>

                        <div className="px-3 pt-1 text-xs text-muted-foreground">Move to another zone</div>

                        <div className="flex gap-1 px-3 pb-2">

                            <button
                                type="button"
                                className={lookClass}
                                disabled={zoneCount === 0}
                                onClick={() => startMove(zone, "top", count)}
                            >
                                Top {count}
                            </button>

                            <button
                                type="button"
                                className={lookClass}
                                disabled={zoneCount === 0}
                                onClick={() => startMove(zone, "bottom", count)}
                            >
                                Bottom {count}
                            </button>

                        </div>

                        {zoneCount > 1 && (
                            <button
                                type="button"
                                className={itemClass}
                                onClick={() => {
                                    game.shuffle(zone);
                                    closeMenu();
                                }}
                            >
                                Shuffle
                            </button>
                        )}

                        <button
                            type="button"
                            className={`${itemClass} text-muted-foreground`}
                            disabled={zoneCount === 0}
                            onClick={() => browse(zone)}
                        >
                            Browse all (reveals every card)
                        </button>

                    </>
                )}

            </div>

        </div>
    );

}
