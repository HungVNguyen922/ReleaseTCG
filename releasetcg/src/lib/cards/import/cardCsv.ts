import { CARD_COLORS } from "@/lib/cards/colorFilter"
import { findSet } from "@/lib/sets/sets"

import { parseCsv } from "./parseCsv"
import type { CardInsertRow, ImportIssue } from "./types"

export interface ParseCardCsvOptions {
  /** Used for rows whose SetName cell is empty. */
  defaultSet?: string
}

export interface ParsedCardCsv {
  rows: { row: number; card: CardInsertRow }[]
  issues: ImportIssue[]
}

const REQUIRED_HEADERS = ["name", "power", "bulk", "color1", "cardnumber"]

const KNOWN_HEADERS = [
  "name",
  "power",
  "bulk",
  "color1",
  "color2",
  "color3",
  "color4",
  "trait",
  "effect1",
  "effect2",
  "clarify1",
  "clarify2",
  "clarify3",
  "cardnumber",
  "setname",
  "artist",
  "art",
  "flavor",
  "inspiration",
]

const COLOR_BY_NAME = new Map<string, string>(
  CARD_COLORS.map((color) => [color.toLowerCase(), color])
)

const MAX_STAT = 8

export function hasErrors(issues: ImportIssue[]) {
  return issues.some((issue) => issue.severity === "error")
}

/** "05 / 81" becomes "5/81". Returns null if it isn't in the n/total form. */
export function parseCardNumber(
  value: string
): { number: number; total: number; text: string } | null {
  const match = /^(\d+)\s*\/\s*(\d+)$/.exec(value.trim())

  if (!match) return null

  const number = Number(match[1])
  const total = Number(match[2])

  return { number, total, text: `${number}/${total}` }
}

function whole(value: string): number | null {
  return /^\d+$/.test(value) ? Number(value) : null
}

/**
 * Reads a card CSV (the same columns as the sheet and the cards table),
 * checks every row, and returns cards ready to save plus a list of
 * problems. Rows with errors are left out of `rows`.
 */
export function parseCardCsv(
  text: string,
  options: ParseCardCsvOptions = {}
): ParsedCardCsv {
  const issues: ImportIssue[] = []
  const rows: ParsedCardCsv["rows"] = []

  let table: string[][]

  try {
    table = parseCsv(text)
  } catch (error) {
    issues.push({
      row: 0,
      severity: "error",
      message: error instanceof Error ? error.message : "Could not read the file.",
    })

    return { rows, issues }
  }

  if (table.length === 0) {
    issues.push({ row: 0, severity: "error", message: "The file is empty." })

    return { rows, issues }
  }

  const headers = table[0].map((header) => header.trim().toLowerCase())

  const required = options.defaultSet
    ? REQUIRED_HEADERS
    : [...REQUIRED_HEADERS, "setname"]

  const missing = required.filter((header) => !headers.includes(header))

  if (missing.length > 0) {
    issues.push({
      row: 1,
      severity: "error",
      message: `Missing column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`,
    })

    return { rows, issues }
  }

  for (const header of headers) {
    if (header && !KNOWN_HEADERS.includes(header)) {
      issues.push({
        row: 1,
        field: header,
        severity: "warning",
        message: `Column "${header}" isn't used and will be ignored.`,
      })
    }
  }

  const seen = new Map<string, number>()
  const numbersBySet = new Map<string, Set<number>>()

  for (let r = 1; r < table.length; r++) {
    const cells = table[r]

    if (cells.every((cell) => cell.trim() === "")) continue

    const rowNumber = r + 1

    const get = (header: string) => {
      const index = headers.indexOf(header)

      return index === -1 ? "" : (cells[index] ?? "").trim()
    }

    const orNull = (header: string) => get(header) || null

    const problems: ImportIssue[] = []

    const error = (field: string, message: string) =>
      problems.push({ row: rowNumber, field, severity: "error", message })

    const warn = (field: string, message: string) =>
      problems.push({ row: rowNumber, field, severity: "warning", message })

    const name = get("name")

    if (!name) error("Name", "Missing a name.")

    const power = whole(get("power"))
    const bulk = whole(get("bulk"))

    if (power === null || power > MAX_STAT) {
      error("Power", `Power must be a whole number from 0 to ${MAX_STAT}.`)
    }

    if (bulk === null || bulk > MAX_STAT) {
      error("Bulk", `Bulk must be a whole number from 0 to ${MAX_STAT}.`)
    }

    // Colors: known names only, no repeats, at least one. Gaps are closed up.
    const colors: string[] = []
    let sawGap = false

    for (const header of ["color1", "color2", "color3", "color4"]) {
      const raw = get(header)

      if (!raw) {
        if (colors.length > 0) sawGap = true

        continue
      }

      const color = COLOR_BY_NAME.get(raw.toLowerCase())

      if (!color) {
        error(
          `Color${header.slice(-1)}`,
          `"${raw}" isn't a color. Use ${CARD_COLORS.join(", ")}.`
        )

        continue
      }

      if (colors.includes(color)) {
        error(`Color${header.slice(-1)}`, `${color} is listed twice.`)

        continue
      }

      if (sawGap) warn("Colors", "There was an empty color cell between colors. It was closed up.")

      colors.push(color)
    }

    if (colors.length === 0 && !problems.some((p) => p.field?.startsWith("Color"))) {
      error("Color1", "A card needs at least one color.")
    }

    // Set and card number.
    const rawSet = get("setname") || options.defaultSet || ""

    const set = findSet(rawSet)

    if (!rawSet) {
      error("SetName", "Missing a set. Fill in SetName or choose a default set.")
    } else if (!set) {
      error(
        "SetName",
        `Unknown set "${rawSet}". Add it to src/lib/sets/sets.ts first.`
      )
    }

    const rawNumber = get("cardnumber")
    const parsedNumber = parseCardNumber(rawNumber)

    if (!rawNumber) {
      error("CardNumber", "Missing a card number.")
    } else if (!parsedNumber) {
      error("CardNumber", `"${rawNumber}" should look like "5/81".`)
    } else if (parsedNumber.number < 1 || parsedNumber.number > parsedNumber.total) {
      error(
        "CardNumber",
        `Card number ${parsedNumber.number} isn't between 1 and ${parsedNumber.total}.`
      )
    } else {
      if (set && parsedNumber.total !== set.cardCount) {
        warn(
          "CardNumber",
          `This says the set has ${parsedNumber.total} cards, but ${set.code} is registered with ${set.cardCount}.`
        )
      }

      if (parsedNumber.text !== rawNumber) {
        warn("CardNumber", `Written as "${parsedNumber.text}" (was "${rawNumber}").`)
      }
    }

    // Each number can be used once per set.
    if (set && parsedNumber && !problems.some((p) => p.field === "CardNumber" && p.severity === "error")) {
      const key = `${set.code}|${parsedNumber.number}`
      const first = seen.get(key)

      if (first !== undefined) {
        error(
          "CardNumber",
          `${parsedNumber.text} of ${set.code} is already used by row ${first}.`
        )
      } else {
        seen.set(key, rowNumber)
      }
    }

    issues.push(...problems)

    if (problems.some((problem) => problem.severity === "error")) continue

    const code = (set as NonNullable<typeof set>).code

    if (!numbersBySet.has(code)) numbersBySet.set(code, new Set())

    numbersBySet.get(code)?.add((parsedNumber as NonNullable<typeof parsedNumber>).number)

    rows.push({
      row: rowNumber,
      card: {
        Name: name,
        Power: power as number,
        Bulk: bulk as number,

        Color1: colors[0],
        Color2: colors[1] ?? null,
        Color3: colors[2] ?? null,
        Color4: colors[3] ?? null,

        Trait: orNull("trait"),
        Effect1: orNull("effect1"),
        Effect2: orNull("effect2"),

        Clarify1: orNull("clarify1"),
        Clarify2: orNull("clarify2"),
        Clarify3: orNull("clarify3"),

        Flavor: orNull("flavor"),
        Inspiration: orNull("inspiration"),

        Artist: orNull("artist"),
        Art: orNull("art"),

        CardNumber: (parsedNumber as NonNullable<typeof parsedNumber>).text,
        SetName: code,
      },
    })
  }

  // Is the whole set here? Partial files are allowed, but worth a heads-up.
  for (const [code, numbers] of numbersBySet) {
    const set = findSet(code)

    if (!set) continue

    const absent: number[] = []

    for (let n = 1; n <= set.cardCount; n++) {
      if (!numbers.has(n)) absent.push(n)
    }

    if (absent.length > 0) {
      const shown = absent.slice(0, 12).join(", ")

      issues.push({
        row: 0,
        field: "CardNumber",
        severity: "warning",
        message: `${set.code} has ${numbers.size} of ${set.cardCount} cards in this file. Missing: ${shown}${absent.length > 12 ? `, and ${absent.length - 12} more` : ""}.`,
      })
    }
  }

  return { rows, issues }
}
