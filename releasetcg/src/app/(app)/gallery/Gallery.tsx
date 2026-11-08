"use client";

import { useState } from "react";

import { PlayableCard } from "@/types/cards";
import { CardModal } from "@/features/cards/CardModal";
import { useCardBrowserFilters } from "@/hooks/useCardBrowserFilters";
import { CardBrowserFilters } from "@/app/(app)/components/cards/CardBrowserFilters";
import { GalleryGrid } from "./components/GalleryGrid";

type Props = {
  initialCards: PlayableCard[];
};

export function Gallery({ initialCards }: Props) {
  const { filteredCards, filterProps } = useCardBrowserFilters(initialCards);

  const [selectedCard, setSelectedCard] = useState<PlayableCard | null>(null);

  return (
    <div className="flex h-full flex-col">
      <CardBrowserFilters
        {...filterProps}
        className="sticky top-0 z-20 border-b"
      />

      {/* Left click opens the card details. */}
      <GalleryGrid cards={filteredCards} onCardClick={setSelectedCard} />

      <CardModal
        card={selectedCard}
        open={selectedCard !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedCard(null);
        }}
      />
    </div>
  );
}
