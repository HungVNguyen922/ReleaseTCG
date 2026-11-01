"use client";

import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";

import type { MoveOptions, ZoneKey } from "@/lib/sandbox";

import { DRAG_MIME, useSandbox } from "../SandboxProvider";

interface Props {

    /** Where dropped cards go. Not needed when `onCards` is given. */
    zone?: ZoneKey;

    options?: MoveOptions;

    /** Handle the drop yourself instead of moving cards to `zone`. */
    onCards?: (cardIds: string[]) => void;

    onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void;

    title?: string;

    className?: string;

    children: ReactNode;

}

/** Anything cards can be dropped on. */
export default function DropZone({
    zone,
    options,
    onCards,
    onContextMenu,
    title,
    className = "",
    children,
}: Props) {

    const { dropCards } = useSandbox();

    const [over, setOver] = useState(false);

    return (
        <div
            title={title}
            onContextMenu={onContextMenu}
            onDragOver={event => {

                if (event.dataTransfer.types.includes(DRAG_MIME)) {
                    event.preventDefault();
                    setOver(true);
                }

            }}
            onDragLeave={() => setOver(false)}
            onDrop={event => {

                event.preventDefault();
                event.stopPropagation();

                setOver(false);

                const raw = event.dataTransfer.getData(DRAG_MIME);

                if (!raw) {
                    return;
                }

                try {

                    const ids = JSON.parse(raw) as string[];

                    if (onCards) {
                        onCards(ids);
                    } else if (zone) {
                        dropCards(ids, zone, options);
                    }

                } catch {
                    // Not one of our drags; ignore it.
                }

            }}
            className={`
                rounded-xl transition-colors
                ${over ? "bg-primary/20 outline outline-2 outline-primary" : ""}
                ${className}
            `}
        >
            {children}
        </div>
    );

}
