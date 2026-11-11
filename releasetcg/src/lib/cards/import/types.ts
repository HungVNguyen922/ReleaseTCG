/** One card, shaped like a row of the Supabase `cards` table. */
export interface CardInsertRow {
  Name: string
  Power: number
  Bulk: number

  Color1: string
  Color2: string | null
  Color3: string | null
  Color4: string | null

  Trait: string | null
  Effect1: string | null
  Effect2: string | null

  Clarify1: string | null
  Clarify2: string | null
  Clarify3: string | null

  Flavor: string | null
  Inspiration: string | null

  Artist: string | null
  Art: string | null

  CardNumber: string
  SetName: string
}

export type ImportIssue = {
  /** Spreadsheet row, counting the header as row 1. 0 means the whole file. */
  row: number
  field?: string
  message: string
  severity: "error" | "warning"
}

export interface ImportSummary {
  /** Cards found in the file. */
  total: number

  /** Cards that are not in the database yet. */
  create: number

  /** Cards already in the database whose sheet values differ. */
  changed: number

  /** Of those, how many will actually be updated (only when updating is on). */
  update: number

  /** Cards already in the database that match the sheet. */
  unchanged: number

  pool: string
  sets: string[]
}

export type ImportResponse =
  | {
      ok: true
      dryRun: boolean
      issues: ImportIssue[]
      summary: ImportSummary
    }
  | {
      ok: false
      error?: string
      issues: ImportIssue[]
      summary?: ImportSummary
    }
