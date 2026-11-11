"use client"

import Link from "next/link"
import { useState } from "react"

import type {
  ImportIssue,
  ImportResponse,
} from "@/lib/cards/import/types"
import { SETS, setLabel } from "@/lib/sets/sets"

const POOLS = [
  { value: "draft", label: "draft" },
  { value: "private", label: "private" },
  { value: "beta", label: "beta" },
  { value: "public", label: "public (shows in the Gallery)" },
]

type Status = "idle" | "checking" | "importing"

type Checked = {
  response: ImportResponse
  /** The options the file was checked with, so changing one asks for a re-check. */
  snapshot: string
}

function snapshotOf(csv: string, pool: string, defaultSet: string, updateExisting: boolean) {
  return JSON.stringify([csv.length, csv.slice(0, 200), pool, defaultSet, updateExisting])
}

function IssueList({ issues }: { issues: ImportIssue[] }) {
  if (issues.length === 0) return null

  const ordered = [...issues].sort(
    (a, b) =>
      Number(b.severity === "error") - Number(a.severity === "error") || a.row - b.row
  )

  return (
    <ul className="max-h-72 space-y-1 overflow-y-auto rounded-lg border p-3 text-sm">
      {ordered.map((issue, index) => (
        <li
          key={index}
          className={issue.severity === "error" ? "text-red-600" : "text-amber-600"}
        >
          <span className="font-medium">
            {issue.severity === "error" ? "Error" : "Heads up"}
            {issue.row > 0 ? `, row ${issue.row}` : ""}
            {issue.field ? ` (${issue.field})` : ""}:
          </span>{" "}
          {issue.message}
        </li>
      ))}
    </ul>
  )
}

export function ImportCardsForm() {
  const [fileName, setFileName] = useState("")
  const [csv, setCsv] = useState("")
  const [pool, setPool] = useState("draft")
  const [defaultSet, setDefaultSet] = useState("")
  const [updateExisting, setUpdateExisting] = useState(false)

  const [status, setStatus] = useState<Status>("idle")
  const [checked, setChecked] = useState<Checked | null>(null)
  const [done, setDone] = useState<ImportResponse | null>(null)
  const [message, setMessage] = useState("")

  const snapshot = snapshotOf(csv, pool, defaultSet, updateExisting)

  const fresh = checked !== null && checked.snapshot === snapshot

  const result = checked?.response

  const canImport =
    status === "idle" && fresh && result?.ok === true && result.dryRun && !done

  async function send(dryRun: boolean) {
    setStatus(dryRun ? "checking" : "importing")
    setMessage("")

    try {
      const res = await fetch("/api/cards/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csv,
          pool,
          dryRun,
          updateExisting,
          defaultSet: defaultSet || undefined,
        }),
      })

      const response = (await res.json()) as ImportResponse

      if (dryRun) {
        setChecked({ response, snapshot })
        setDone(null)
      } else {
        setDone(response)
      }

      if (!response.ok && response.error) setMessage(response.error)
    } catch {
      setMessage("Couldn't reach the server. Try again.")
    } finally {
      setStatus("idle")
    }
  }

  async function onFile(file: File | undefined) {
    setChecked(null)
    setDone(null)
    setMessage("")

    if (!file) {
      setFileName("")
      setCsv("")
      return
    }

    setFileName(file.name)
    setCsv(await file.text())
  }

  const summary = result && "summary" in result ? result.summary : undefined

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-xl border p-4">
        <label className="block text-sm font-medium" htmlFor="csv-file">
          1. Choose the CSV file
        </label>

        <input
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => onFile(event.target.files?.[0])}
          className="block w-full text-sm"
        />

        {fileName && (
          <p className="text-xs text-muted-foreground">
            {fileName} ({csv.length.toLocaleString()} characters)
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Columns: Name, Power, Bulk, Color1 to Color4, Trait, Effect1, Effect2,
          Clarify1 to Clarify3, CardNumber, SetName, Artist, Art, Flavor,
          Inspiration.
        </p>
      </section>

      <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="pool">
            2. Save new cards to pool
          </label>

          <select
            id="pool"
            value={pool}
            onChange={(event) => setPool(event.target.value)}
            className="w-full rounded border p-2"
          >
            {POOLS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="default-set">
            Set for rows with an empty SetName
          </label>

          <select
            id="default-set"
            value={defaultSet}
            onChange={(event) => setDefaultSet(event.target.value)}
            className="w-full rounded border p-2"
          >
            <option value="">Use the SetName column</option>

            {SETS.map((set) => (
              <option key={set.code} value={set.code}>
                {setLabel(set.code)}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-start gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={updateExisting}
            onChange={(event) => setUpdateExisting(event.target.checked)}
            className="mt-1"
          />

          <span>
            Also update cards that already exist (same set and card number) when
            the sheet differs. This overwrites changes made in the Card Manager.
          </span>
        </label>
      </section>

      <section className="space-y-3 rounded-xl border p-4">
        <p className="text-sm font-medium">3. Check, then import</p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!csv || status !== "idle"}
            onClick={() => send(true)}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            {status === "checking" ? "Checking…" : "Check file"}
          </button>

          <button
            type="button"
            disabled={!canImport}
            onClick={() => send(false)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {status === "importing"
              ? "Importing…"
              : summary
                ? `Import ${summary.create + summary.update} card${summary.create + summary.update === 1 ? "" : "s"}`
                : "Import"}
          </button>
        </div>

        {message && <p className="text-sm text-red-600">{message}</p>}

        {checked && !fresh && !done && (
          <p className="text-sm text-amber-600">
            The file or options changed. Check the file again before importing.
          </p>
        )}

        {result && fresh && (
          <div className="space-y-3">
            {result.ok ? (
              <p className="text-sm">
                <strong>{summary?.total} cards</strong> in the file for{" "}
                {summary?.sets.map((code) => setLabel(code)).join(", ")}:{" "}
                <strong>{summary?.create} new</strong>,{" "}
                {summary?.changed} already saved with different values
                {updateExisting ? " (will be updated)" : " (left alone)"},{" "}
                {summary?.unchanged} unchanged. New cards go to the{" "}
                <strong>{summary?.pool}</strong> pool.
              </p>
            ) : (
              <p className="text-sm text-red-600">
                This file can’t be imported yet. Fix the errors below and check
                it again.
              </p>
            )}

            <IssueList issues={result.issues} />
          </div>
        )}

        {done && done.ok && (
          <p className="rounded-lg border border-green-600/40 bg-green-600/10 p-3 text-sm">
            Imported {done.summary.create} new
            {done.summary.update > 0 ? ` and updated ${done.summary.update}` : ""}{" "}
            card{done.summary.create + done.summary.update === 1 ? "" : "s"}.{" "}
            <Link href="/cardmanager" className="font-medium underline">
              Open the Card Manager
            </Link>
          </p>
        )}
      </section>
    </div>
  )
}
