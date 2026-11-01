"use client";

import type { PlayableCard } from "@/types/cards";

import type { CardCounts } from "../types";

import BrowserCard from "./cards/BrowserCard";

type Props = {
  cards: PlayableCard[];
  cardCounts: CardCounts;

  setHoveredCardId: (
    id: string | null
  ) => void;

  setHoverAnchor: (
    anchor: DOMRect | null
  ) => void;

  onClickCard: (
    card: PlayableCard
  ) => void;
};

/**
 * Same browsing experience as the Gallery page: one scrolling area of
 * full-size cards in an auto-filling grid.
 */
export default function CardBrowser({
  cards,
  cardCounts,
  setHoveredCardId,
  setHoverAnchor,
  onClickCard,
}: Props) {
  return (
    <div className="h-full overflow-y-auto p-1 md:p-2">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
        {cards.map((card) => (
          <BrowserCard
            key={card.id}
            card={card}
            counts={cardCounts[card.id]}
            setHoveredCardId={setHoveredCardId}
            setHoverAnchor={setHoverAnchor}
            onClick={onClickCard}
          />
        ))}
      </div>
    </div>
  );
}
