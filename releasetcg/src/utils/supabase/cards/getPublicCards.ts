import { createClient } from "@/utils/supabase/server";
import { DatabaseCard, PlayableCard } from "@/types/cards";
import { toPlayableCard } from "@/lib/cards/cardMapper";
import { PLAYABLE_CARD_SELECT } from "@/lib/cards/queries";

export async function getPublicCards(): Promise<PlayableCard[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cards")
    .select(PLAYABLE_CARD_SELECT)
    .eq("pool", "public");

  if (error) {
    console.error(error);
    return [];
  }

  return (data as DatabaseCard[]).map(toPlayableCard);
}