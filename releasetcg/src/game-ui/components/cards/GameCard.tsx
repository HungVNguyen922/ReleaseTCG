"use client";

import { PlayableCard } from "@/types/cards";

import { getCardImageUrl } from "@/lib/images/getCardImageUrl";

interface Props {

    card: PlayableCard;

    onClick?: () => void;

    className?: string;

}

export default function GameCard({

    card,

    onClick,

    className = "",

}: Props) {

    return (

        <div
            onClick={onClick}

            className={`
                relative
                h-full
                w-full
                overflow-hidden
                rounded-xl
                border
                bg-card
                shadow-lg
                ${onClick ? "cursor-pointer" : ""}
                ${className}
            `}
        >

            <img
                src={getCardImageUrl(card)}

                alt={card.name}

                draggable={false}

                className="h-full w-full object-cover"
            />

        </div>

    );

}
