import { parseCardNumber } from "./cardCsv"
import type { CardInsertRow } from "./types"

/** A card already in the database. */
export type ExistingCard = CardInsertRow & { id: string; pool?: string | null }

export interface ImportPlan {
  /** Cards that aren't in the database yet. */
  create: CardInsertRow[]

  /** Cards already there whose values differ, with only the columns that differ. */
  update: { id: string; name: string; changes: Partial<CardInsertRow> }[]

  unchanged: number

  /** Numbers the database already has more than once, so we can't tell which to touch. */
  ambiguous: { SetName: string; CardNumber: string; count: number }[]
}

const COMPARED: (keyof CardInsertRow)[] = [
  "Name",
  "Power",
  "Bulk",
  "Color1",
  "Color2",
  "Color3",
  "Color4",
  "Trait",
  "Effect1",
  "Effect2",
  "Clarify1",
  "Clarify2",
  "Clarify3",
  "Flavor",
  "Inspiration",
  "Artist",
  "Art",
]

/** Empty text, blank text and null all mean "nothing". */
function normalize(value: unknown): string | number | null {
  if (value === null || value === undefined) return null

  if (typeof value === "number") return value

  const text = String(value).trim()

  return text === "" ? null : text
}

function keyFor(setName: string | null, cardNumber: string | null) {
  const parsed = cardNumber ? parseCardNumber(cardNumber) : null

  return `${(setName ?? "").toUpperCase()}|${parsed ? parsed.text : (cardNumber ?? "")}`
}

/**
 * Compares the cards in a CSV with the cards already saved. A card is the
 * same card when its set and card number match.
 */
export function planImport(
  incoming: CardInsertRow[],
  existing: ExistingCard[]
): ImportPlan {
  const bySlot = new Map<string, ExistingCard[]>()

  for (const card of existing) {
    const key = keyFor(card.SetName, card.CardNumber)

    bySlot.set(key, [...(bySlot.get(key) ?? []), card])
  }

  const plan: ImportPlan = { create: [], update: [], unchanged: 0, ambiguous: [] }

  for (const card of incoming) {
    const matches = bySlot.get(keyFor(card.SetName, card.CardNumber)) ?? []

    if (matches.length === 0) {
      plan.create.push(card)
      continue
    }

    if (matches.length > 1) {
      plan.ambiguous.push({
        SetName: card.SetName,
        CardNumber: card.CardNumber,
        count: matches.length,
      })
      continue
    }

    const current = matches[0]

    const changes: Partial<CardInsertRow> = {}

    for (const field of COMPARED) {
      if (normalize(card[field]) !== normalize(current[field])) {
        ;(changes as Record<string, unknown>)[field] = card[field]
      }
    }

    if (Object.keys(changes).length === 0) {
      plan.unchanged += 1
    } else {
      plan.update.push({ id: current.id, name: current.Name, changes })
    }
  }

  return plan
}
