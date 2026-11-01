"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import type { MoveOptions, ZoneKey } from "@/lib/sandbox";

import { DRAG_MIME, useSandbox } from "../SandboxProvider";
import { useLongPress } from "../useLongPress";

interface Props {

    /** Where dropped cards go. Not needed when `onCards` is given. */
    zone?: ZoneKey;

    options?: MoveOptions;

    /** Handle the drop yourself instead of moving cards to `zone`. */
    onCards?: (cardIds: string[]) => void;

    /** Right-click (or long press on a touch screen) at screen position x, y. */
    onMenu?: (x: number, y: number) => void;

    title?: string;

    /** Set false for zones nested inside another zone (e.g. each hand card). */
    target?: boolean;

    className?: string;

    children: ReactNode;

}

/** Anything cards can be dropped on. */
export default function DropZone({
    zone,
    options,
    onCards,
    onMenu,
    title,
    target = true,
    className = "",
    children,
}: Props) {

    const { dropCards, moving, completeMove } = useSandbox();

    // While choosing a destination for cards taken from a zone, every
    // other zone lights up and can be clicked.
    const choosing = Boolean(moving) && target && Boolean(zone) && !onCards;

    const isSource = choosing && zone === moving?.from;

    const isChoice = choosing && !isSource;

    const press = useLongPress((x, y) => onMenu?.(x, y));

    const [over, setOver] = useState(false);

    return (
        <div
            title={isChoice ? "Click to move the cards here" : title}
            onClickCapture={event => {

                if (isChoice && zone) {
                    event.stopPropagation();
                    event.preventDefault();
                    completeMove(zone);
                }

            }}
            {...(onMenu ? press.handlers : {})}
            onContextMenu={onMenu
                ? event => {
                    event.preventDefault();
                    onMenu(event.clientX, event.clientY);
                }
                : undefined}
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
                ${isChoice ? "cursor-pointer bg-primary/15 outline outline-2 outline-primary animate-pulse hover:bg-primary/30" : ""}
                ${isSource ? "opacity-40" : ""}
                ${className}
            `}
        >
            {children}
        </div>
    );

}
