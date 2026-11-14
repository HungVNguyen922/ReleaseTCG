"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import type { AdminCardRow } from "@/lib/cards/adminCard";
import {
  SHEET_COLUMNS,
  cellValue,
  editRequest,
  type SheetColumn,
  type SheetColumnKey,
  type SortState,
} from "@/lib/cards/sheetColumns";
import { cn } from "@/lib/utils";

type Props = {
  /** Cards to show, already filtered and sorted. */
  cards: AdminCardRow[];

  /** Ids of the checked cards. */
  selected: Set<string>;

  sort: SortState;

  /** A column header was clicked. */
  onSort: (key: SheetColumnKey) => void;

  /** Check or uncheck one card. `shift` extends from the last one clicked. */
  onToggle: (id: string, shift: boolean) => void;

  /** Check or uncheck every card shown. */
  onToggleAll: (checked: boolean) => void;

  /** The server saved a cell: here is the card as it is now stored. */
  onSaved: (card: AdminCardRow) => void;
};

type Notice = { kind: "saved" } | { kind: "error"; text: string };

function cellDomId(cardId: string, key: SheetColumnKey) {
  return `cell-${cardId}-${key}`;
}

function omit<T>(record: Record<string, T>, key: string) {
  const next = { ...record };
  delete next[key];
  return next;
}

// ---------------------------------------------------------------------------
// Cells
// ---------------------------------------------------------------------------

type CellProps = {
  id: string;
  column: SheetColumn;
  value: string;
  error?: string;
  onSave: (value: string) => void;
};

/** Dropdown cells (colors, set, pool) are always a dropdown and save on change. */
function SelectCell({ id, column, value, error, onSave }: CellProps) {
  const options = column.options ?? [];

  const required =
    column.key === "color1" || column.key === "setName" || column.key === "pool";

  return (
    <select
      id={id}
      aria-label={column.label}
      title={error}
      value={value}
      onChange={(e) => onSave(e.target.value)}
      className={cn(
        "w-full cursor-pointer bg-transparent px-2 py-1.5 text-sm outline-none focus:bg-background focus:ring-1 focus:ring-ring",
        error && "ring-1 ring-inset ring-red-500"
      )}
    >
      {(!required || value === "") && <option value=""></option>}

      {/* A value that isn't in the list (an old set tag, say) still shows. */}
      {value !== "" && !options.includes(value) && (
        <option value={value}>{value}</option>
      )}

      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

/**
 * Text and number cells. Focusing a cell (click or Tab) starts editing it:
 *   Enter  saves and moves to the cell below
 *   Tab    saves and moves right
 *   Esc    puts the old value back
 * Long cells (effects, flavor text) open a bigger box while you edit.
 */
function TextCell({
  id,
  column,
  value,
  error,
  onSave,
  onEnter,
}: CellProps & { onEnter: () => boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  // finish() can be reached twice (Enter, then the input losing focus).
  const finished = useRef(true);

  // After Esc, focus goes back to the cell without starting an edit again.
  const skipNextFocus = useRef(false);

  function start() {
    if (skipNextFocus.current) {
      skipNextFocus.current = false;
      return;
    }

    finished.current = false;
    setDraft(value);
    setEditing(true);
  }

  function finish(save: boolean) {
    if (finished.current) return;

    finished.current = true;
    setEditing(false);

    const next = draft.trim();

    if (save && next !== value) onSave(next);
  }

  function refocusCell() {
    skipNextFocus.current = true;

    requestAnimationFrame(() => {
      const el = document.getElementById(id);

      if (el) el.focus();
      else skipNextFocus.current = false;
    });
  }

  function onKeyDown(
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (e.key === "Escape") {
      e.preventDefault();
      finish(false);
      refocusCell();
      return;
    }

    if (e.key === "Enter" && !(column.kind === "long" && e.shiftKey)) {
      e.preventDefault();
      finish(true);

      // Move down if there is a row below; otherwise stay on this cell.
      if (!onEnter()) refocusCell();
    }
  }

  if (!editing) {
    return (
      <div
        id={id}
        tabIndex={0}
        title={error ?? value}
        onFocus={start}
        className={cn(
          "min-h-8 cursor-text truncate px-2 py-1.5 text-sm outline-none",
          error && "ring-1 ring-inset ring-red-500"
        )}
      >
        {value || "\u00a0"}
      </div>
    );
  }

  if (column.kind === "long") {
    return (
      <div className="relative">
        <div className="invisible min-h-8 truncate px-2 py-1.5 text-sm">
          {value || "\u00a0"}
        </div>

        <textarea
          autoFocus
          aria-label={column.label}
          rows={5}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => finish(true)}
          onKeyDown={onKeyDown}
          className="absolute left-0 top-0 z-30 w-[26rem] resize-y rounded border bg-background p-2 text-sm shadow-lg outline-none ring-1 ring-ring"
        />
      </div>
    );
  }

  return (
    <input
      autoFocus
      aria-label={column.label}
      inputMode={column.kind === "number" ? "numeric" : undefined}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => finish(true)}
      onKeyDown={onKeyDown}
      className="min-h-8 w-full bg-background px-2 py-1.5 text-sm outline-none ring-1 ring-ring"
    />
  );
}

// ---------------------------------------------------------------------------
// The sheet
// ---------------------------------------------------------------------------

export function CardSheet({
  cards,
  selected,
  sort,
  onSort,
  onToggle,
  onToggleAll,
  onSaved,
}: Props) {
  // What the person typed, shown until the server answers.
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  // Cells the server refused, with the reason.
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [pending, setPending] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);

  const checkedCount = cards.filter((card) => selected.has(card.id)).length;
  const allChecked = cards.length > 0 && checkedCount === cards.length;

  async function save(card: AdminCardRow, column: SheetColumn, raw: string) {
    const cellId = `${card.id}:${column.key}`;
    const request = editRequest(card, column.key, raw);

    setDrafts((current) => ({ ...current, [cellId]: raw }));
    setErrors((current) => omit(current, cellId));
    setNotice(null);
    setPending((count) => count + 1);

    try {
      const res = await fetch("/api/cards/cell-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: card.id, ...request }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.card) {
        throw new Error(data.error ?? `Save failed (${res.status})`);
      }

      onSaved(data.card as AdminCardRow);
      setNotice({ kind: "saved" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";

      setErrors((current) => ({ ...current, [cellId]: message }));
      setNotice({
        kind: "error",
        text: `${card.name} · ${column.label}: ${message}`,
      });
    } finally {
      // On success the row now holds the saved value; on failure this puts
      // the old value back.
      setDrafts((current) => omit(current, cellId));
      setPending((count) => count - 1);
    }
  }

  /** Focus the same column on the next row. Returns false if there is none. */
  function focusBelow(index: number, key: SheetColumnKey) {
    const next = cards[index + 1];

    if (!next) return false;

    const el = document.getElementById(cellDomId(next.id, key));

    if (!el) return false;

    el.focus();

    return true;
  }

  return (
    <div className="space-y-2">
      <p
        aria-live="polite"
        className={cn(
          "min-h-5 text-sm",
          notice?.kind === "error" ? "text-red-600" : "text-muted-foreground"
        )}
      >
        {notice?.kind === "error"
          ? notice.text
          : pending > 0
            ? "Saving…"
            : notice?.kind === "saved"
              ? "All changes saved"
              : "Click any cell to edit it. Enter saves and moves down, Tab moves right, Esc cancels."}
      </p>

      <div className="max-h-[75vh] overflow-auto rounded-xl border">
        <table className="w-max min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="sticky left-0 top-0 z-30 w-10 min-w-10 bg-muted p-0 text-center">
                <input
                  type="checkbox"
                  aria-label="Select all shown cards"
                  className="size-4 cursor-pointer"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = checkedCount > 0 && !allChecked;
                  }}
                  onChange={(e) => onToggleAll(e.target.checked)}
                />
              </th>

              <th
                className="sticky left-10 top-0 z-30 w-8 min-w-8 bg-muted p-0"
                aria-label="Open"
              />

              {SHEET_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "sticky top-0 z-20 border-l bg-muted p-0 text-left",
                    column.width,
                    column.key === "name" && "left-[4.5rem] z-30"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSort(column.key)}
                    className="flex w-full items-center gap-1 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide hover:underline"
                  >
                    {column.label}

                    {sort.key === column.key && (
                      <span aria-hidden>
                        {sort.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {cards.length === 0 && (
              <tr>
                <td
                  colSpan={SHEET_COLUMNS.length + 2}
                  className="p-6 text-center text-muted-foreground"
                >
                  No cards match these filters.
                </td>
              </tr>
            )}

            {cards.map((card, index) => {
              const isSelected = selected.has(card.id);

              const background = isSelected
                ? "bg-muted"
                : "bg-background group-hover:bg-muted";

              return (
                <tr key={card.id} className="group border-b">
                  <td
                    className={cn(
                      "sticky left-0 z-10 w-10 min-w-10 p-0 text-center",
                      background
                    )}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select ${card.name}`}
                      className="size-4 cursor-pointer"
                      checked={isSelected}
                      onChange={() => {}}
                      onClick={(e) => onToggle(card.id, e.shiftKey)}
                    />
                  </td>

                  <td
                    className={cn(
                      "sticky left-10 z-10 w-8 min-w-8 p-0 text-center",
                      background
                    )}
                  >
                    <Link
                      href={`/cardmanager/${card.id}`}
                      title="Open the full card editor"
                      aria-label={`Open ${card.name}`}
                      className="block px-1 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                      ↗
                    </Link>
                  </td>

                  {SHEET_COLUMNS.map((column) => {
                    const cellId = `${card.id}:${column.key}`;
                    const value = drafts[cellId] ?? cellValue(card, column.key);

                    const props: CellProps = {
                      id: cellDomId(card.id, column.key),
                      column,
                      value,
                      error: errors[cellId],
                      onSave: (next) => void save(card, column, next),
                    };

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          "border-l p-0 align-top",
                          column.width,
                          column.key === "name" && "sticky left-[4.5rem] z-10",
                          background
                        )}
                      >
                        {column.kind === "select" ? (
                          <SelectCell {...props} />
                        ) : (
                          <TextCell
                            {...props}
                            onEnter={() => focusBelow(index, column.key)}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
