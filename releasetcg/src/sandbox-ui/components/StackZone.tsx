"use client";

import type { ZoneKey } from "@/lib/sandbox";

import CardView from "./CardView";
import DropZone from "./DropZone";

import { useSandbox } from "../SandboxProvider";

interface Props {
    zone: ZoneKey;
    label: string;
}

/** A gate or set zone: shows the top card, with a badge to browse the stack. */
export default function StackZone({ zone, label }: Props) {

    const { state, browse } = useSandbox();

    const cards = state.zones[zone];

    const top = cards[0];

    return (
        <DropZone zone={zone} className="relative p-1">

            <div className="aspect-[5/7] h-[var(--card-h)]">

                {top ? (
                    <CardView sc={top} />
                ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/40 text-xs text-muted-foreground">
                        {label}
                    </div>
                )}

            </div>

            {cards.length > 0 && (
                <button
                    type="button"
                    onClick={() => browse(zone)}
                    title="Browse this stack"
                    className="absolute -right-1 -top-1 z-10 min-w-6 rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground shadow"
                >
                    {cards.length}
                </button>
            )}

        </DropZone>
    );

}
