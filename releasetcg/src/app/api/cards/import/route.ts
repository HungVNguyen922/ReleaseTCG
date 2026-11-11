import { NextResponse } from "next/server"

import {
  requireAdminApi,
  errorMessage,
} from "@/utils/supabase/requireAdminApi"

import { hasErrors, parseCardCsv } from "@/lib/cards/import/cardCsv"
import { planImport, type ExistingCard } from "@/lib/cards/import/planImport"
import type {
  ImportIssue,
  ImportResponse,
  ImportSummary,
} from "@/lib/cards/import/types"
import { findSet } from "@/lib/sets/sets"

const POOLS = ["draft", "private", "beta", "public"]

const MAX_CSV_CHARS = 2_000_000

/** Rows sent to Supabase in one request. One request is saved all-or-nothing. */
const INSERT_CHUNK = 500

const EXISTING_COLUMNS =
  "id, Name, Power, Bulk, Color1, Color2, Color3, Color4, Trait, Effect1, Effect2, Clarify1, Clarify2, Clarify3, Flavor, Inspiration, Artist, Art, CardNumber, SetName, pool"

function reply(body: ImportResponse, status = 200) {
  return NextResponse.json(body, { status })
}

/**
 * Imports cards from CSV text. Admin only.
 *
 * Send `{ csv, pool, dryRun, updateExisting, defaultSet }`. `dryRun` defaults
 * to true: nothing is written until the request says `dryRun: false`.
 * New cards are created in the chosen pool. Cards that already exist (same set
 * and card number) are only changed when `updateExisting` is true.
 */
export async function POST(req: Request) {
  try {
    const guard = await requireAdminApi()

    if ("error" in guard) {
      return guard.error
    }

    const { supabase } = guard

    let body: Record<string, unknown>

    try {
      body = await req.json()
    } catch {
      return reply({ ok: false, error: "The request wasn't valid JSON.", issues: [] }, 400)
    }

    const csv = typeof body.csv === "string" ? body.csv : ""
    const pool = typeof body.pool === "string" ? body.pool : "draft"
    const dryRun = body.dryRun !== false
    const updateExisting = body.updateExisting === true
    const defaultSet = typeof body.defaultSet === "string" ? body.defaultSet : undefined

    if (!csv.trim()) {
      return reply({ ok: false, error: "No CSV was sent.", issues: [] }, 400)
    }

    if (csv.length > MAX_CSV_CHARS) {
      return reply({ ok: false, error: "That file is too large.", issues: [] }, 413)
    }

    if (!POOLS.includes(pool)) {
      return reply({ ok: false, error: `Pool must be one of: ${POOLS.join(", ")}.`, issues: [] }, 400)
    }

    const parsed = parseCardCsv(csv, { defaultSet })

    if (hasErrors(parsed.issues)) {
      return reply({ ok: false, issues: parsed.issues }, 422)
    }

    const cards = parsed.rows.map((entry) => entry.card)
    const setCodes = [...new Set(cards.map((card) => card.SetName))]

    const { data: existing, error: existingError } = await supabase
      .from("cards")
      .select(EXISTING_COLUMNS)
      .in("SetName", setCodes)

    if (existingError) {
      console.error(existingError)

      return reply({ ok: false, error: existingError.message, issues: parsed.issues }, 500)
    }

    const plan = planImport(cards, (existing ?? []) as unknown as ExistingCard[])

    const issues: ImportIssue[] = [...parsed.issues]

    for (const clash of plan.ambiguous) {
      issues.push({
        row: 0,
        field: "CardNumber",
        severity: "error",
        message: `The database already has ${clash.count} cards numbered ${clash.CardNumber} in ${clash.SetName}. Remove the duplicates first.`,
      })
    }

    if (hasErrors(issues)) {
      return reply({ ok: false, issues }, 422)
    }

    const summary: ImportSummary = {
      total: cards.length,
      create: plan.create.length,
      changed: plan.update.length,
      update: updateExisting ? plan.update.length : 0,
      unchanged: plan.unchanged,
      pool,
      sets: setCodes,
    }

    if (dryRun) {
      return reply({ ok: true, dryRun: true, issues, summary })
    }

    // Make sure each set has a row in the sets table (skipped if the table
    // hasn't been created yet).
    for (const code of setCodes) {
      const set = findSet(code)

      if (!set) continue

      const { error } = await supabase.from("sets").upsert(
        {
          code: set.code,
          number: set.number,
          name: set.name,
          card_count: set.cardCount,
        },
        { onConflict: "code" }
      )

      if (error && !["42P01", "PGRST205"].includes(error.code ?? "")) {
        console.error(error)

        return reply({ ok: false, error: `Couldn't save the set: ${error.message}`, issues, summary }, 500)
      }
    }

    for (let i = 0; i < plan.create.length; i += INSERT_CHUNK) {
      const chunk = plan.create
        .slice(i, i + INSERT_CHUNK)
        .map((card) => ({ ...card, pool }))

      const { error } = await supabase.from("cards").insert(chunk)

      if (error) {
        console.error(error)

        return reply(
          {
            ok: false,
            error: `Couldn't save new cards: ${error.message}`,
            issues,
            summary,
          },
          500
        )
      }
    }

    if (updateExisting) {
      for (const entry of plan.update) {
        const { error } = await supabase
          .from("cards")
          .update(entry.changes)
          .eq("id", entry.id)

        if (error) {
          console.error(error)

          return reply(
            {
              ok: false,
              error: `New cards were saved, but updating "${entry.name}" failed: ${error.message}`,
              issues,
              summary,
            },
            500
          )
        }
      }
    }

    return reply({ ok: true, dryRun: false, issues, summary })
  } catch (err: unknown) {
    return reply({ ok: false, error: errorMessage(err), issues: [] }, 500)
  }
}
