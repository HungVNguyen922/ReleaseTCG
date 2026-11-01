"use client";

import Image from "next/image";

import type { DeckCard, Zone } from "../types";
import type { Deck } from "@/types/decks";

import { getCardImageUrl } from "@/lib/images/getCardImageUrl";
import { PaletteChips } from "@/app/(app)/components/cards/PaletteChips";
import { StatChips } from "@/app/(app)/components/cards/StatChips";

type Props = {
  deck: Deck;

  onDeckNameChange: (name: string) => void;

  coverCardId: string | null;
  onSetCover: (cardId: string) => void;

  mainDeckCards: DeckCard[];
  extraDeckCards: DeckCard[];

  counts: { main: number; extra: number };

  onIncrementCard: (cardId: string, zone: Zone) => void;
  onDecrementCard: (cardId: string, zone: Zone) => void;

  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
  onClear: () => void;

  /**
   * Let the whole panel scroll with the page (used on phones, where there
   * isn't room for a header, footer and a scrolling list all at once). The
   * footer buttons stay pinned to the bottom.
   */
  flow?: boolean;
};

export default function DeckPanel({
  deck,
  onDeckNameChange,
  coverCardId,
  onSetCover,
  mainDeckCards,
  extraDeckCards,
  counts,
  onIncrementCard,
  onDecrementCard,
  onSave,
  onExport,
  onImport,
  onClear,
  flow = false,
}: Props) {
  function renderCardRow(card: DeckCard["card"], count: number, zone: Zone) {
    const isCover = coverCardId === card.id;

    return (
      <div
        key={card.id}
        className="flex items-center gap-3 rounded-lg border p-2"
      >
        <div className="relative h-14 w-10 overflow-hidden rounded">
          <Image
            fill
            src={getCardImageUrl(card)}
            alt={card.name}
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="truncate text-sm font-medium">{card.name}</div>
          <PaletteChips palette={card.colors} size="sm" />
          <StatChips power={card.power} bulk={card.bulk} size="sm" />
        </div>

        <button
          onClick={() => onSetCover(card.id)}
          title={isCover ? "Deck cover" : "Set as deck cover"}
          className={`flex h-7 w-7 items-center justify-center rounded border text-sm transition ${
            isCover
              ? "border-amber-400 bg-amber-100 text-amber-600"
              : "hover:bg-muted text-muted-foreground"
          }`}
        >
          {isCover ? "★" : "☆"}
        </button>

        <div className="flex flex-col items-center gap-1">
          <button
            className="flex h-7 w-7 items-center justify-center rounded border hover:bg-muted"
            onClick={() => onIncrementCard(card.id, zone)}
          >
            +
          </button>
          <span className="text-sm font-semibold">{count}</span>
          <button
            className="flex h-7 w-7 items-center justify-center rounded border hover:bg-muted"
            onClick={() => onDecrementCard(card.id, zone)}
          >
            −
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        flow
          ? "flex flex-col rounded-lg border"
          : "flex h-full min-h-0 flex-col rounded-lg border overflow-hidden"
      }
    >
      {/* HEADER */}
      <div className="shrink-0 space-y-3 border-b p-4">
        <div>
          <input
            type="text"
            value={deck.name ?? ""}
            onChange={(e) => onDeckNameChange(e.target.value)}
            placeholder="Deck"
            maxLength={50}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          />
          <p className="text-sm text-muted-foreground">
            {counts.main + counts.extra} cards
          </p>
        </div>
      </div>

      {/* SCROLLABLE BODY */}
      <div
        className={
          flow
            ? "space-y-8 p-4"
            : "flex-1 min-h-0 overflow-y-auto p-4 space-y-8"
        }
      >
        {/* MAIN DECK */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Main Deck</h3>
            <span className="text-sm text-muted-foreground">
              {counts.main}/15
            </span>
          </div>

          <div className="space-y-2">
            {mainDeckCards.length === 0 ? (
              <p className="text-sm text-muted-foreground">Empty</p>
            ) : (
              mainDeckCards.map(({ card, count }) =>
                renderCardRow(card, count, "main")
              )
            )}
          </div>
        </section>

        {/* EXTRA DECK */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Extra Deck</h3>
            <span className="text-sm text-muted-foreground">
              {counts.extra}/5
            </span>
          </div>

          <div className="space-y-2">
            {extraDeckCards.length === 0 ? (
              <p className="text-sm text-muted-foreground">Empty</p>
            ) : (
              extraDeckCards.map(({ card, count }) =>
                renderCardRow(card, count, "extra")
              )
            )}
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <div
        className={
          flow
            ? "sticky bottom-0 rounded-b-lg border-t bg-background p-3"
            : "shrink-0 border-t p-4"
        }
      >
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={onSave}
            disabled={counts.main !== 15 || counts.extra !== 5}
            className="rounded border p-2 disabled:opacity-50"
          >
            Save
          </button>
          <button onClick={onExport} className="rounded border p-2">
            Export
          </button>
          <button onClick={onImport} className="rounded border p-2">
            Import
          </button>
          <button onClick={onClear} className="rounded border p-2">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}