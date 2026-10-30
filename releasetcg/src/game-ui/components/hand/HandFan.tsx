"use client";

import {
    useState,
} from "react";

import {
    PlayableCard,
} from "@/types/cards";

import GameCard from "../cards/GameCard";
import CardBack from "../cards/CardBack";

interface Props {

    cards: PlayableCard[];

    hidden?: boolean;

    position?: "top" | "bottom";

    selectedCardIds?: string[];

    onCardClick?: (
        card: PlayableCard,
    ) => void;

    onCardDragStart?: (
        card: PlayableCard,
    ) => void;

    onCardDragEnd?: (
        card: PlayableCard,
    ) => void;

}

export default function HandFan({

    cards,

    hidden = false,

    position = "bottom",

    selectedCardIds = [],

    onCardClick,

    onCardDragStart,

    onCardDragEnd,

}: Props) {

    const [
        isHovered,
        setIsHovered,
    ] = useState(false);

    const [
        draggingCardId,
        setDraggingCardId,
    ] = useState<string | null>(null);

    const isTop =
        position === "top";

    const isExpanded =
        isHovered &&
        draggingCardId === null;

    function handleDragStart(
        card: PlayableCard,
        event: React.DragEvent<HTMLDivElement>,
    ) {

        setDraggingCardId(
            card.id,
        );

        event.dataTransfer.setData(
            "application/x-release-tcg-card",
            card.id,
        );

        event.dataTransfer.effectAllowed =
            "move";

        onCardDragStart?.(
            card,
        );

    }

    function handleDragEnd(
        card: PlayableCard,
    ) {

        setDraggingCardId(
            null,
        );

        onCardDragEnd?.(
            card,
        );

    }

    return (

        <div
            className={`
                absolute left-1/2 z-50 flex -translate-x-1/2 justify-center

                ${
                    isTop
                        ? "top-[-8vh] items-start"
                        : "bottom-[-8vh] items-end"
                }
            `}

            onMouseEnter={() =>
                setIsHovered(true)
            }

            onMouseLeave={() =>
                setIsHovered(false)
            }
        >

            {

                cards.map((
                    card,
                    index,
                ) => {

                    const isDragging =
                        draggingCardId === card.id;

                    return (

                        <div
                            key={card.id}

                            draggable

                            onClick={() =>
                                onCardClick?.(
                                    card,
                                )
                            }

                            onDragStart={(event) =>
                                handleDragStart(
                                    card,
                                    event,
                                )
                            }

                            onDragEnd={() =>
                                handleDragEnd(
                                    card,
                                )
                            }

                            className={`
                                relative aspect-[5/7] h-[18vh] shrink-0 transition-all duration-200 ease-out

                                ${
                                    isExpanded
                                        ? "-ml-[2vh]"
                                        : "-ml-[8vh]"
                                }

                                ${
                                    isExpanded
                                        ? isTop
                                            ? "translate-y-[5vh] scale-120"
                                            : "-translate-y-[5vh] scale-120"
                                        : ""
                                }
                                
                                ${
                                    selectedCardIds.includes(card.id)
                                        ? "ring-4 ring-primary -translate-y-[3vh]"
                                        : ""
                                }

                                ${
                                    isDragging
                                        ? "cursor-grabbing opacity-80"
                                        : "cursor-grab"
                                }

                                ${
                                    !isDragging
                                        ? isTop
                                            ? "hover:z-[100] hover:translate-y-[10vh] hover:scale-110"
                                            : "hover:z-[100] hover:-translate-y-[10vh] hover:scale-110"
                                        : ""
                                }
                            `}

                            style={{
                                zIndex:
                                    isDragging
                                        ? 200
                                        : index + 1,
                            }}
                        >

                            {

                                hidden

                                    ? (
                                        <CardBack />
                                    )

                                    : (
                                        <GameCard
                                            card={card}
                                        />
                                    )

                            }

                        </div>

                    );

                })

            }

        </div>

    );

}