import { NextResponse } from "next/server";
import {
  requireAdminApi,
  errorMessage,
} from "@/utils/supabase/requireAdminApi";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing card id" },
        { status: 400 }
      );
    }

    const guard = await requireAdminApi();

    if ("error" in guard) {
      return guard.error;
    }

    const { supabase } = guard;

    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: errorMessage(err) },
      { status: 500 }
    );
  }
}