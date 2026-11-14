"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import type { Deck } from "@/types/decks";
import type { PlayableCard } from "@/types/cards";

import {
  saveDeck,
  updateDeck,
  getImportedDeck,
  validateDeck,
  toDeckExport,
} from "@/utils/decks";

import { exportDeckCode } from "@/lib/export/exportDeckCode";
import { exportDeckListImage } from "@/lib/export/exportDeckListImage";

type Props = {
  deck: Deck;
  cards: PlayableCard[];
  loadDeck: (deck: Deck) => void;
  deckId?: string;
};

export function useDeckOperations({
  deck,
  cards,
  loadDeck,
  deckId,
}: Props) {
  const router = useRouter();
  /**
   * Save
   */
  const handleSave = useCallback(async () => {
    const validation = validateDeck(toDeckExport(deck), cards);

    if (!validation.valid) {
      alert(validation.errors.join("\n"));
      return;
    }

    try {
      const savedDeck = deckId
        ? await updateDeck(deckId, deck)
        : await saveDeck(deck);

      loadDeck(savedDeck);

      if (!deckId && savedDeck.id) {
          router.replace(`/deckbuilder/${savedDeck.id}`);
      }

      alert("Deck saved!");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to save deck."
      );
    }
  }, [deck, cards, deckId, loadDeck, router]);

  /**
   * Export
   */
  const handleExport = useCallback(async () => {
    try {
      await exportDeckCode(deck, cards);
      alert("Deck code copied!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Export failed.");
    }
  }, [deck, cards]);

  /**
   * Export as a picture (deck name, extra deck first, then main deck)
   */
  const handleExportImage = useCallback(async () => {
    try {
      await exportDeckListImage(deck, cards);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Image export failed.");
    }
  }, [deck, cards]);

  /**
   * Import
   */
  const handleImport = useCallback(() => {
    const code = prompt("Paste a deck code");

    if (!code) {
      return;
    }

    const {
      deck: importedDeck,
      validation,
    } = getImportedDeck(code, cards);

    if (!validation.valid || !importedDeck) {
      alert(validation.errors.join("\n"));
      return;
    }

    loadDeck(importedDeck);
  }, [cards, loadDeck]);

  /**
   * Clear
   */
  const handleClear = useCallback(() => {
    if (!confirm("Clear current deck?")) {
      return;
    }

    loadDeck({
      name: "",
      coverCardId: null,
      mainDeck: [],
      extraDeck: [],
    });
  }, [loadDeck]);

  return {
    handleSave,
    handleExport,
    handleExportImage,
    handleImport,
    handleClear,
  };
}
