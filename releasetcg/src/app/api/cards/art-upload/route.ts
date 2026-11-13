import { NextResponse } from "next/server"
import { requireAdminApi, errorMessage } from "@/utils/supabase/requireAdminApi"

const BUCKET = "CardImages"

// Only card images, e.g. "1_81 - IRFO.png". Blocks any other path
// (including ReleaseTCGCardBack.png).
const FILENAME = /^\d{1,3}_\d{1,3} - [A-Z0-9]{2,8}\.png$/

export async function POST(req: Request) {
  try {
    const guard = await requireAdminApi()
    if ("error" in guard) return guard.error
    const { supabase } = guard

    const body = await req.json().catch(() => ({}))
    const filename = typeof body.filename === "string" ? body.filename : ""

    if (!FILENAME.test(filename)) {
      return NextResponse.json(
        { error: `Unexpected file name: ${filename}` },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(filename, { upsert: true })

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Couldn't create an upload URL." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      bucket: BUCKET,
      path: data.path,
      token: data.token,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 })
  }
}