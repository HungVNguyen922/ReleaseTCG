import { createClient } from "@/utils/supabase/server";
import type { DatabaseCard } from "@/types/cards";
import {
  ADMIN_CARD_SELECT,
  toAdminCard,
  type AdminCardRow,
} from "@/lib/cards/adminCard";

export async function getCards(): Promise<AdminCardRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cards")
    .select(ADMIN_CARD_SELECT);

  if (error || !data) {
    console.error(error);
    return [];
  }

  return (data as unknown as DatabaseCard[]).map(toAdminCard);
}
