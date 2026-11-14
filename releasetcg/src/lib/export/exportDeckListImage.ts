import type { Deck } from "@/types/decks";
import type { PlayableCard } from "@/types/cards";

import {
  renderDeckListImage,
  resolveDeckEntries,
} from "./renderDeckListImage";

function toFileName(name: string) {
  const clean = name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").trim();

  return `${clean || "deck"}.png`;
}

/**
 * Saves a picture of the deck list: the deck name on top, the extra deck
 * first, then the main deck.
 */
export async function exportDeckListImage(
  deck: Deck,
  cards: PlayableCard[]
) {
  const extraDeck = resolveDeckEntries(deck.extraDeck, cards);
  const mainDeck = resolveDeckEntries(deck.mainDeck, cards);

  if (extraDeck.length === 0 && mainDeck.length === 0) {
    throw new Error("Add some cards to the deck before exporting an image.");
  }

  const blob = await renderDeckListImage({
    name: deck.name,
    extraDeck,
    mainDeck,
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.download = toFileName(deck.name);
  link.href = url;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
