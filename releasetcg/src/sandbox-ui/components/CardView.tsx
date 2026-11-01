"use client";

import type { MouseEvent } from "react";

import CardBack from "@/game-ui/components/cards/CardBack";

import { getCardImageUrl } from "@/lib/images/getCardImageUrl";

import type { SandboxCard } from "@/lib/sandbox";

import { DRAG_MIME, useSandbox } from "../SandboxProvider";
import { useLongPress } from "../useLongPress";

interface Props {

    sc: SandboxCard;

    /** Force the back to show (e.g. the opponent's hand). */
    hidden?: boolean;

    draggable?: boolean;

    className?: string;

    onClick?: (event: MouseEvent) => void;

}

/**
 * One card. Sized by its parent (h-full / w-full).
 * Handles selection highlight, dragging (the whole selection moves
 * together), the right-click menu and the hover preview.
 */
export default function CardView({
    sc,
    hidden = false,
    draggable = true,
    className = "",
    onClick,
}: Props) {

    const {
        selected,
        toggleSelect,
        openMenu,
        setPreview,
    } = useSandbox();

    const showBack = hidden || !sc.faceUp;

    const press = useLongPress((x, y) => {

        if (!hidden) {
            openMenu(x, y, selected.includes(sc.id) ? selected : [sc.id]);
        }

    });

    const isSelected = selected.includes(sc.id);

    return (
        <div
            draggable={draggable && !hidden}
            {...press.handlers}
            onDragStart={event => {

                press.cancel();

                const ids = selected.includes(sc.id) ? selected : [sc.id];

                event.dataTransfer.setData(DRAG_MIME, JSON.stringify(ids));
                event.dataTransfer.effectAllowed = "move";

            }}
            onClick={event => {

                if (hidden) {
                    return;
                }

                if (onClick) {
                    onClick(event);
                    return;
                }

                toggleSelect(sc.id);

            }}
            onContextMenu={event => {

                if (hidden) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                openMenu(
                    event.clientX,
                    event.clientY,
                    selected.includes(sc.id) ? selected : [sc.id],
                );

            }}
            onMouseEnter={() => {

                if (!showBack) {
                    setPreview(sc.card);
                }

            }}
            onMouseLeave={() => setPreview(null)}
            className={`
                relative h-full w-full select-none rounded-xl [-webkit-touch-callout:none]
                ${draggable && !hidden ? "cursor-grab active:cursor-grabbing" : ""}
                ${isSelected ? "ring-4 ring-primary ring-offset-2 ring-offset-background" : ""}
                ${className}
            `}
        >

            {showBack ? (
                <CardBack />
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={getCardImageUrl(sc.card)}
                    alt={sc.card.name}
                    draggable={false}
                    className="h-full w-full rounded-xl border object-cover shadow-lg"
                />
            )}

            {!hidden && !sc.faceUp && (
                <span className="absolute left-1 top-1 rounded bg-black/70 px-1 text-[10px] font-semibold text-white">
                    face down
                </span>
            )}

        </div>
    );

}
