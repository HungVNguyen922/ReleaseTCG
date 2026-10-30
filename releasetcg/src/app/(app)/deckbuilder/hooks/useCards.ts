"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/utils/supabase/client";

import {
  DatabaseCard,
  PlayableCard,
} from "@/types/cards";

import { PLAYABLE_CARD_SELECT } from "@/lib/cards/queries";
import { toPlayableCard } from "@/lib/cards/cardMapper";

export function useCards() {
  const [cards, setCards] = useState<PlayableCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCards() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("cards")
        .select(PLAYABLE_CARD_SELECT)
        .eq("pool", "public");

      if (error) {
        console.error(error);
        setCards([]);
      } else {
        setCards(
          ((data ?? []) as DatabaseCard[]).map(toPlayableCard)
        );
      }

      setLoading(false);
    }

    fetchCards();
  }, []);

  return {
    cards,
    loading,
  };
}