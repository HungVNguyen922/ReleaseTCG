import { NextResponse } from "next/server";

import {
  requireAdminApi,
  errorMessage,
} from "@/utils/supabase/requireAdminApi";

import { buildCellPatch } from "@/lib/cards/cellEdit";
import { ADMIN_CARD_SELECT, toAdminCard } from "@/lib/cards/adminCard";
import type { DatabaseCard } from "@/types/cards";

/**
 * Admin only. Saves ONE edited cell of the Card Manager sheet.
 * Body: { id: string, field: string, value: string | string[] }
 * Returns the whole saved row so the sheet shows exactly what is stored
 * (for example "05 / 81" comes back as "5/81").
 */
export async function POST(req: Request) {
  try {
    const guard = await requireAdminApi();

    if ("error" in guard) {
      return guard.error;
    }

    const { supabase } = guard;

    const body = await req.json().catch(() => null);

    const id = typeof body?.id === "string" ? body.id : "";

    if (!id) {
      return NextResponse.json({ error: "Missing card id" }, { status: 400 });
    }

    const result = buildCellPatch(body?.field, body?.value);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { patch } = result;

    // A card number can only be used once per set. Check the final
    // combination before saving.
    if ("SetName" in patch || "CardNumber" in patch) {
      const { data: current, error: currentError } = await supabase
        .from("cards")
        .select("SetName, CardNumber")
        .eq("id", id)
        .maybeSingle();

      if (currentError) {
        console.error(currentError);
        return NextResponse.json({ error: currentError.message }, { status: 500 });
      }

      if (!current) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }

      const setName = "SetName" in patch ? patch.SetName : current.SetName;
      const cardNumber =
        "CardNumber" in patch ? patch.CardNumber : current.CardNumber;

      if (setName && cardNumber) {
        const { data: clash, error: clashError } = await supabase
          .from("cards")
          .select("id")
          .eq("SetName", setName)
          .eq("CardNumber", cardNumber)
          .neq("id", id)
          .limit(1);

        if (clashError) {
          console.error(clashError);
          return NextResponse.json({ error: clashError.message }, { status: 500 });
        }

        if (clash && clash.length > 0) {
          return NextResponse.json(
            { error: `${cardNumber} of ${setName} is already used by another card.` },
            { status: 409 }
          );
        }
      }
    }

    const { data, error } = await supabase
      .from("cards")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(ADMIN_CARD_SELECT)
      .maybeSingle();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      card: toAdminCard(data as unknown as DatabaseCard),
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}
