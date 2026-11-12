import { NextResponse } from "next/server";
import {
  requireAdminApi,
  errorMessage,
} from "@/utils/supabase/requireAdminApi";
import {
  buildBatchPatch,
  validateBatchIds,
} from "@/lib/cards/batchUpdate";

/**
 * Admin only. Applies the same changes to many cards in one go.
 * Body: { ids: string[], changes: BatchChanges }
 */
export async function POST(req: Request) {
  try {
    const guard = await requireAdminApi();

    if ("error" in guard) {
      return guard.error;
    }

    const { supabase } = guard;

    const body = await req.json();

    const ids = validateBatchIds(body?.ids);

    if (!ids.ok) {
      return NextResponse.json({ error: ids.error }, { status: 400 });
    }

    const result = buildBatchPatch(body?.changes);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("cards")
      .update({ ...result.patch, updated_at: new Date().toISOString() })
      .in("id", ids.ids)
      .select("id");

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      updated: data?.length ?? 0,
      requested: ids.ids.length,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}
