"use client";

import { useState } from "react";

import { PlayableCard } from "@/types/cards";
import { CardModal } from "@/features/cards/CardModal";
import { useCardBrowserFilters } from "@/hooks/useCardBrowserFilters";
import { CardBrowserFilters } from "@/app/(app)/components/cards/CardBrowserFilters";
import { GalleryGrid } from "./components/GalleryGrid";

type Props = {
  initialCards: PlayableCard[];

  /** A set tag from the URL (?set=IRFO) to start filtered to. */
  initialSetName?: string;
};

export function Gallery({ initialCards, initialSetName }: Props) {
  const { filteredCards, filterProps } = useCardBrowserFilters(initialCards, {
    initialSetName,
  });

  const [selectedCard, setSelectedCard] = useState<PlayableCard | null>(null);

  return (
    <div className="flex h-full flex-col">
      <CardBrowserFilters
        {...filterProps}
        className="sticky top-0 z-20 border-b"
      />

      {/* Left click opens the card details. */}
      {filteredCards.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">
          No cards match these filters yet.
        </p>
      ) : (
        <GalleryGrid cards={filteredCards} onCardClick={setSelectedCard} />
      )}

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
