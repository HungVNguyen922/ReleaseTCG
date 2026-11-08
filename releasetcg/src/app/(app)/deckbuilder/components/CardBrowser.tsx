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

  onInspectCard: (
    card: PlayableCard
  ) => void;
};

/**
 * A scrolling grid of compact cards, so many fit on screen at once.
 * Left click adds a card; right click opens its details (including the
 * clarification text). Lower the 110px to fit more, raise it for bigger cards.
 */
export default function CardBrowser({
  cards,
  cardCounts,
  setHoveredCardId,
  setHoverAnchor,
  onClickCard,
  onInspectCard,
}: Props) {
  return (
    <div className="h-full overflow-y-auto p-1 md:p-2">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-1.5">
        {cards.map((card) => (
          <BrowserCard
            key={card.id}
            card={card}
            counts={cardCounts[card.id]}
            setHoveredCardId={setHoveredCardId}
            setHoverAnchor={setHoverAnchor}
            onClick={onClickCard}
            onInspect={onInspectCard}
          />
        ))}
      </div>
    </div>
  );
}
