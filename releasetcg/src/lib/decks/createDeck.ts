import type { SupabaseClient } from "@supabase/supabase-js";

import type { Deck } from "@/types/decks";

export async function createDeck(
  supabase: SupabaseClient,
  ownerId: string,
  deck: Deck
): Promise<Deck> {
  const { data: createdDeck, error: deckError } = await supabase
  .from("decks")
  .insert({
    owner_id: ownerId,
    name: deck.name,
    cover_card_id: deck.coverCardId,
  })
  .select()
  .single();

  if (deckError || !createdDeck) {
    throw deckError ?? new Error("Failed to create deck.");
  }

  const deckCards = [
    ...deck.mainDeck.map((card) => ({
      deck_id: createdDeck.id,
      card_id: card.cardId,
      zone: "main",
      count: card.count,
    })),

    ...deck.extraDeck.map((card) => ({
      deck_id: createdDeck.id,
      card_id: card.cardId,
      zone: "extra",
      count: card.count,
    })),
  ];

  if (deckCards.length > 0) {
    const { error } = await supabase
      .from("deck_cards")
      .insert(deckCards);

    if (error) {
      //
      // Supabase has no client-side transactions: remove the
      // deck row so a failed save doesn't leave an empty deck behind.
      //

      await supabase
        .from("decks")
        .delete()
        .eq("id", createdDeck.id);

      throw error;
    }
  }

  return {
    ...deck,
    id: createdDeck.id,
  };
}