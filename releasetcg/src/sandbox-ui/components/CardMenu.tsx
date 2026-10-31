"use client";

import {
    extraZone,
    findCard,
    handZone,
    type ZoneKey,
} from "@/lib/sandbox";

import { useSandbox } from "../SandboxProvider";

interface Item {
    label: string;
    run: () => void;
}

/** Right-click menu for one card or the current selection. */
export default function CardMenu() {

    const { menu, closeMenu, game, state, viewer, dropCards } = useSandbox();

    if (!menu) {
        return null;
    }

    const ids = menu.cardIds.filter(id => findCard(state, id));

    if (ids.length === 0) {
        return null;
    }

    const owner = findCard(state, ids[0])?.card.owner ?? viewer;

    function sendTo(zone: ZoneKey, position?: "top" | "bottom"): () => void {

        return () => {
            dropCards(ids, zone, position ? { position } : undefined);
            closeMenu();
        };

    }

    const items: Item[] = [
        {
            label: ids.length > 1 ? `Flip ${ids.length} cards` : "Flip face up / down",
            run: () => {
                game.flip(ids);
                closeMenu();
            },
        },
        { label: `To ${viewer} hand`, run: sendTo(handZone(viewer)) },
        { label: "To top of public pile", run: sendTo("public", "top") },
        { label: "To bottom of public pile", run: sendTo("public", "bottom") },
        { label: "To the gap", run: sendTo("gap", "top") },
        { label: `To ${owner} extra deck`, run: sendTo(extraZone(owner)) },
    ];

    const left = Math.min(menu.x, window.innerWidth - 220);

    const top = Math.min(menu.y, window.innerHeight - items.length * 36 - 16);

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
                className="absolute w-52 rounded-xl border bg-popover p-1 text-popover-foreground shadow-xl"
                onClick={event => event.stopPropagation()}
            >

                {items.map(item => (
                    <button
                        key={item.label}
                        type="button"
                        onClick={item.run}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                        {item.label}
                    </button>
                ))}

            </div>

        </div>
    );

}
