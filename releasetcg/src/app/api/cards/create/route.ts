import { NextResponse } from "next/server";
import {
  requireAdminApi,
  errorMessage,
} from "@/utils/supabase/requireAdminApi";

export async function POST(req: Request) {
  try {
    const { data } = await req.json();
    const guard = await requireAdminApi();

    if ("error" in guard) {
      return guard.error;
    }

    const { supabase } = guard;

    const { data: inserted, error } = await supabase
      .from("cards")
      .insert({
        Name: data.name,
        Power: data.power,
        Bulk: data.bulk,

        Color1: data.color1 || null,
        Color2: data.color2 || null,
        Color3: data.color3 || null,
        Color4: data.color4 || null,

        Trait: data.trait || null,
        Effect1: data.effect1 || null,
        Effect2: data.effect2 || null,

        Clarify1: data.clarify1 || null,
        Clarify2: data.clarify2 || null,
        Clarify3: data.clarify3 || null,

        Flavor: data.flavor || null,
        Inspiration: data.inspiration || null,

        Artist: data.artist || null,
        CardNumber: data.cardNumber || null,
        SetName: data.setName || null,

        pool: data.pool || "draft",
      })
      .select("id")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: inserted.id });
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}