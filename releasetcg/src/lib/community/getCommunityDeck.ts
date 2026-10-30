import type { SupabaseClient } from "@supabase/supabase-js";

import type { CommunityDeck } from "@/types/community";
import type { Deck } from "@/types/decks";

type NameRow<T> = T | T[] | null;

type CommunityDeckRow = {
  id: string;
  title: string;
  description: string;
  deck: Deck;
  owner_id: string;
  cover_card_id: string | null;
  created_at: string;
  updated_at: string;
  owner: NameRow<{ username: string | null }>;
  cover: NameRow<{
    CardNumber: string | null;
    SetName: string | null;
  }>;
};

function first<T>(value: NameRow<T>): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function getCommunityDeck(
  supabase: SupabaseClient,
  id: string
): Promise<CommunityDeck> {
  const { data, error } = await supabase
    .from("community_decks")
    .select(`
      id,
      title,
      description,
      deck,
      owner_id,
      cover_card_id,
      created_at,
      updated_at,

      owner:owner_id (
        username
      ),

      cover:cover_card_id (
        CardNumber,
        SetName
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error("Community deck not found.");
  }

  const post = data as unknown as CommunityDeckRow;

  const storedDeck = post.deck as Deck;

  const cover = first(post.cover);

  return {
    id: post.id,

    title: post.title,
    description: post.description,

    deck: {
      name: storedDeck.name,
      coverCardId: storedDeck.coverCardId,
      mainDeck: storedDeck.mainDeck,
      extraDeck: storedDeck.extraDeck,
    },

    author: first(post.owner)?.username ?? "Unknown",
    ownerId: post.owner_id,

    coverCardId: post.cover_card_id ?? storedDeck.coverCardId ?? null,
    coverCardNumber: cover?.CardNumber ?? null,
    coverSetName: cover?.SetName ?? null,

    likes: 0,
    comments: 0,

    createdAt: post.created_at,
    updatedAt: post.updated_at,
  };
}