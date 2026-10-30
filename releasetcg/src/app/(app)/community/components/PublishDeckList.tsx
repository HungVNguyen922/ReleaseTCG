"use client";

import type { DeckSummary } from "@/types/decks";

import PublishDeckTile from "./PublishDeckTile";

type Props = {
  decks: DeckSummary[];
  onSelect: (deck: DeckSummary) => void;
};

export default function PublishDeckList({
  decks,
  onSelect,
}: Props) {
  if (decks.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        You don&apos;t have any saved decks yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {decks.map((deck) => (
        <PublishDeckTile
          key={deck.id}
          deck={deck}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}