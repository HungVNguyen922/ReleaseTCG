"use client";

import { useState } from "react";

import {
    currentPlayGate,
    describeZone,
    extraZone,
    findCard,
    handZone,
    parseZone,
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

    const owner = ids[0] ? (findCard(state, ids[0])?.card.owner ?? viewer) : viewer;

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

        cardItems.push(
            { label: `To ${viewer} hand`, run: sendTo(handZone(viewer)) },
            { label: "To top of public pile", run: sendTo("public", "top") },
            { label: "To bottom of public pile", run: sendTo("public", "bottom") },
            { label: "To the gap", run: sendTo("gap", "top") },
            { label: `To ${owner} extra deck`, run: sendTo(extraZone(owner)) },
        );

    }

    const zoneCount = zone ? state.zones[zone].length : 0;

    const left = Math.min(menu.x, window.innerWidth - 260);

    const top = Math.max(8, Math.min(menu.y, window.innerHeight - 420));

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
                style={{ left, top }}
                className="absolute max-h-[90vh] w-60 overflow-y-auto rounded-xl border bg-popover p-1 text-popover-foreground shadow-xl"
                onClick={event => event.stopPropagation()}
            >

                {cardItems.map(item => (
                    <button key={item.label} type="button" onClick={item.run} className={itemClass}>
                        {item.label}
                    </button>
                ))}

                {zone && (
                    <>

                        {cardItems.length > 0 && <div className="my-1 border-t" />}

                        <div className="px-3 pb-1 pt-2 text-xs font-medium capitalize text-muted-foreground">
                            {describeZone(zone)} ({zoneCount})
                        </div>

                        <div className="flex items-center gap-1 px-3 py-1">

                            <span className="text-sm">Look at</span>

                            <input
                                type="number"
                                min={1}
                                value={count}
                                onChange={event =>
                                    setCount(Math.max(1, Number(event.target.value) || 1))
                                }
                                aria-label="How many cards to look at"
                                className="h-8 w-14 rounded border bg-background px-1 text-center text-sm"
                            />

                        </div>

                        <div className="flex gap-1 px-3 pb-2">

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
