"use client";

import { useEffect, useState } from "react";

import { useIsMobile } from "@/hooks/use-mobile";

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

  // On phones the browser and the deck list each get the whole screen.
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<"cards" | "deck">("cards");
  const [showFilters, setShowFilters] = useState(false);

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

  const browser = (
    <CardBrowser
      cards={browserCards}
      cardCounts={cardCounts}
      setHoveredCardId={setHoveredCardId}
      setHoverAnchor={setHoverAnchor}
      onClickCard={handleCardClick}
    />
  );

  const panel = (
    <DeckPanel
      flow={isMobile}
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
  );

  const tabClass = (active: boolean) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
    }`;

  return (
    <>
      <div className="flex h-app flex-col gap-2 overflow-hidden p-2 md:gap-3 md:p-4">
        <DeckControls activeZone={activeZone} setActiveZone={setActiveZone} />

        {isMobile ? (
          <>
            <div className="grid shrink-0 grid-cols-2 gap-1 rounded-lg border p-1">
              <button
                className={tabClass(mobileTab === "cards")}
                onClick={() => setMobileTab("cards")}
              >
                Cards
              </button>

              <button
                className={tabClass(mobileTab === "deck")}
                onClick={() => setMobileTab("deck")}
              >
                Deck ({counts.main + counts.extra}/20)
              </button>
            </div>

            {mobileTab === "cards" ? (
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <button
                  className="shrink-0 rounded border px-3 py-2 text-sm"
                  onClick={() => setShowFilters((open) => !open)}
                >
                  {showFilters ? "Hide filters" : "Filters"}
                </button>

                {showFilters && (
                  <div className="max-h-[45dvh] shrink-0 overflow-y-auto">
                    <DeckToolbar filters={filters} setFilters={setFilters} />
                  </div>
                )}

                <div className="min-h-0 flex-1">{browser}</div>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto">{panel}</div>
            )}
          </>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] grid-rows-[minmax(0,1fr)] gap-4">
            <div className="flex min-h-0 flex-col gap-3">
              <DeckToolbar filters={filters} setFilters={setFilters} />

              <div className="min-h-0 flex-1">{browser}</div>
            </div>

            {panel}
          </div>
        )}
      </div>

      <CardPreviewPopup card={hoveredCard} anchor={hoverAnchor} />
    </>
  );
}
