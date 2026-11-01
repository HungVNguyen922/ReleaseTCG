"use client";

import { useEffect } from "react";

import { useCards } from "./hooks/useCards";
import { useDeckBuilder } from "./hooks/useDeckBuilder";
import { useCardFilters } from "./hooks/useCardFilters";
import { useDeckOperations } from "./hooks/useDeckOperations";

import CardBrowser from "./components/CardBrowser";
import DeckControls from "./components/DeckControls";
import DeckPanel from "./components/DeckPanel";
import DeckToolbar from "./components/DeckToolbar";

import CardPreviewPopup from "@/app/(app)/components/cards/CardPreviewPopup";

import { getDeck } from "@/utils/decks";

type Props = {
  deckId?: string;
};

export default function DeckBuilder({ deckId }: Props) {
  const { cards, loading } = useCards();

  const {
    deck,
    activeZone,
    setActiveZone,

    filteredCards,

    hoveredCard,
    hoverAnchor,

    effectiveCoverCardId,

    cardCounts,
    counts,
    mainDeckCards,
    extraDeckCards,

    handleDeckNameChange,
    handleCardClick,
    handleIncrementCard,
    handleDecrementCard,
    handleSetCoverCard,

    setHoveredCardId,
    setHoverAnchor,

    loadDeck,
  } = useDeckBuilder(cards);

  const {
    filters,
    setFilters,
    filteredCards: browserCards,
  } = useCardFilters(filteredCards);

  const { handleSave, handleExport, handleImport, handleClear } =
    useDeckOperations({ deck, cards, loadDeck, deckId });

  useEffect(() => {
    if (!deckId) return;

    const id = deckId;
    let cancelled = false;

    async function loadExistingDeck() {
      try {
        const loadedDeck = await getDeck(id);
        if (!cancelled) {
          loadDeck(loadedDeck);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadExistingDeck();

    return () => {
      cancelled = true;
    };
  }, [deckId, loadDeck]);

  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading cards...
      </div>
    );
  }

  return (
    <>
      <div className="flex h-app flex-col gap-3 overflow-y-auto p-4 md:overflow-hidden">
        <DeckControls activeZone={activeZone} setActiveZone={setActiveZone} />

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex h-[75dvh] min-h-0 flex-col gap-3 md:h-auto">
            <DeckToolbar filters={filters} setFilters={setFilters} />

            <div className="min-h-0 flex-1">
              <CardBrowser
                cards={browserCards}
                cardCounts={cardCounts}
                setHoveredCardId={setHoveredCardId}
                setHoverAnchor={setHoverAnchor}
                onClickCard={handleCardClick}
              />
            </div>
          </div>

          <DeckPanel
            deck={deck}
            onDeckNameChange={handleDeckNameChange}
            coverCardId={effectiveCoverCardId}
            onSetCover={handleSetCoverCard}
            mainDeckCards={mainDeckCards}
            extraDeckCards={extraDeckCards}
            counts={counts}
            onIncrementCard={handleIncrementCard}
            onDecrementCard={handleDecrementCard}
            onSave={handleSave}
            onExport={handleExport}
            onImport={handleImport}
            onClear={handleClear}
          />
        </div>
      </div>

      <CardPreviewPopup card={hoveredCard} anchor={hoverAnchor} />
    </>
  );
}