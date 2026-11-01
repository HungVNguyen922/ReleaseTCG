"use client";

import { Button } from "@/components/ui/button";

import { useSandbox } from "../SandboxProvider";

/**
 * Touch screens only. Drag-and-drop is awkward with a finger, so selected
 * cards get an Actions button that opens the same move menu as a
 * right-click (a long press on a card does the same).
 */
export default function SelectionBar() {

    const { selected, openMenu, clearSelection } = useSandbox();

    if (selected.length === 0) {
        return null;
    }

    return (
        <div className="absolute bottom-[calc(19dvh+8px)] left-1/2 z-40 hidden -translate-x-1/2 items-center gap-2 rounded-xl border bg-card px-3 py-1.5 text-sm shadow-xl [@media(pointer:coarse)]:flex">

            <span>{selected.length} selected</span>

            <Button
                size="sm"
                onClick={() => openMenu(
                    Math.max(8, window.innerWidth / 2 - 144),
                    8,
                    selected,
                )}
            >
                Move / actions
            </Button>

            <Button size="sm" variant="ghost" onClick={clearSelection}>
                Clear
            </Button>

        </div>
    );

}
