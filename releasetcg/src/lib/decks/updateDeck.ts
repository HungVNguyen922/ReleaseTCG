import type { SupabaseClient } from "@supabase/supabase-js";

import type { Deck } from "@/types/decks";

import { getDeck } from "./getDeck";

export async function updateDeck(
  supabase: SupabaseClient,
  ownerId: string,
  deckId: string,
  deck: Deck
): Promise<Deck> {
  // Verify the deck belongs to this user
  const { data: existing, error: existingError } = await supabase
    .from("decks")
    .select("id")
    .eq("id", deckId)
    .eq("owner_id", ownerId)
    .single();

  if (existingError || !existing) {
    throw new Error("Deck not found.");
  }

  // Update deck metadata
  const { error: deckError } = await supabase
  .from("decks")
  .update({
    name: deck.name,
    cover_card_id: deck.coverCardId,
  })
  .eq("id", deckId);

  if (deckError) {
    throw deckError;
  }

  // Snapshot current contents so a failed rewrite can be undone
  const { data: previousRows, error: previousError } = await supabase
    .from("deck_cards")
    .select("deck_id, card_id, count, zone")
    .eq("deck_id", deckId);

  if (previousError) {
    throw previousError;
  }

  // Remove existing deck contents
  const { error: deleteError } = await supabase
    .from("deck_cards")
    .delete()
    .eq("deck_id", deckId);

  if (deleteError) {
    throw deleteError;
  }

  // Build new deck_cards rows
  const rows = [
    ...deck.mainDeck.map((entry) => ({
      deck_id: deckId,
      card_id: entry.cardId,
      count: entry.count,
      zone: "main",
    })),
    ...deck.extraDeck.map((entry) => ({
      deck_id: deckId,
      card_id: entry.cardId,
      count: entry.count,
      zone: "extra",
    })),
  ];

  // Reinsert cards
  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("deck_cards")
      .insert(rows);

    if (insertError) {
      // Best-effort rollback: put the previous contents back.
      if (previousRows && previousRows.length > 0) {
        await supabase.from("deck_cards").insert(previousRows);
      }

      throw insertError;
    }
  }

  // Return the freshly updated deck
  return getDeck(
    supabase,
    ownerId,
    deckId
  );
}