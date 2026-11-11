/**
 * Every card set the game has, in one place.
 *
 * - `code` is the tag stored on each card (cards.SetName) and used in card
 *   image file names, e.g. "1_81 - IRFO.png".
 * - `number` says which set it is (1 = the first set). It decides the order
 *   sets appear in everywhere: the sidebar, the gallery filter and sorting.
 *
 * To add a set, add a line here. The sidebar, filters and CSV importer
 * all pick it up from this list.
 */
export interface SetDefinition {
  /** The tag stored on each card, such as "IRFO". Upper case letters and digits. */
  code: string

  /** 1 for the first set, 2 for the second, and so on. Must be unique. */
  number: number

  name: string

  /** How many cards the full set has: the "81" in a card number like "12/81". */
  cardCount: number
}

export const SETS = [
  { code: "IRFO", number: 1, name: "Iridescent Foray", cardCount: 81 },
  { code: "PRBR", number: 2, name: "PrismBreak", cardCount: 27 },

  // Next set: add a line like the ones above.
] as const satisfies readonly SetDefinition[]

/** Every set tag the app knows about, as a type: "IRFO" | ... */
export type SetCode = (typeof SETS)[number]["code"]

/** Looks a set up by its tag. Ignores capitals and stray spaces. */
export function findSet(
  code: string | null | undefined
): SetDefinition | undefined {
  const wanted = code?.trim().toUpperCase()

  if (!wanted) return undefined

  return SETS.find((set) => set.code === wanted)
}

export function isSetCode(value: string): value is SetCode {
  return SETS.some((set) => set.code === value)
}

/** "Set 1: Iridescent Foray". Unknown tags are shown as they are. */
export function setLabel(code: string | null | undefined): string {
  const set = findSet(code)

  if (set) return `Set ${set.number}: ${set.name}`

  return code?.trim() || "No set"
}

/**
 * Orders set tags by set number (set 1 first). Tags the app doesn't know
 * come after the known ones, alphabetically, and cards with no set come last.
 */
export function compareSetCodes(
  a: string | null | undefined,
  b: string | null | undefined
): number {
  const left = findSet(a)
  const right = findSet(b)

  if (left && right) return left.number - right.number
  if (left) return -1
  if (right) return 1

  const leftText = a?.trim() ?? ""
  const rightText = b?.trim() ?? ""

  if (!leftText && !rightText) return 0
  if (!leftText) return 1
  if (!rightText) return -1

  return leftText.localeCompare(rightText)
}

export function sortSetCodes(codes: readonly string[]): string[] {
  return [...codes].sort(compareSetCodes)
}

/** The gallery filtered to one set. */
export function setGalleryHref(set: SetDefinition): string {
  return `/gallery?set=${encodeURIComponent(set.code)}`
}
