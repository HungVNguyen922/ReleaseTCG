"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { CardFilterValues } from "@/types/cards";

import { CardManagerHeader } from "./components/CardManagerHeader";
import { CardFilters } from "@/app/(app)/components/cards/CardFilters";
import { CardSheet } from "./components/CardSheet";
import { BatchEditDialog } from "./components/BatchEditDialog";

import type { AdminCardRow } from "@/lib/cards/adminCard";
import { filterCards } from "@/lib/cards/filterCards";
import {
  DEFAULT_SORT,
  sortRows,
  type SheetColumnKey,
  type SortState,
} from "@/lib/cards/sheetColumns";
import { Button } from "@/components/ui/button";

type Props = {
  cards: AdminCardRow[];
};

export function CardManager({ cards }: Props) {
  const router = useRouter();

  // The sheet edits cards in place, so keep our own copy of the rows. When
  // the server sends a fresh list (after a batch edit, say), start from that.
  const [rows, setRows] = useState(cards);
  const [seenCards, setSeenCards] = useState(cards);

  if (cards !== seenCards) {
    setSeenCards(cards);
    setRows(cards);
  }

  const [filters, setFilters] = useState<CardFilterValues>({
    search: "",
    pool: "all",
    setName: "all",
    power: "all",
    bulk: "all",
    colors: [],
    colorMode: "contains",
  });

  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);

  // Clicking a header sorts by it; clicking it again flips the direction.
  function handleSort(key: SheetColumnKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  }

  function handleSaved(card: AdminCardRow) {
    setRows((current) =>
      current.map((row) => (row.id === card.id ? card : row))
    );
  }

  // What is on screen, in screen order (shift-click ranges follow this).
  const displayCards = useMemo(
    () => sortRows(filterCards(rows, filters), sort),
    [rows, filters, sort]
  );

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const lastClicked = useRef<string | null>(null);

  // Only cards that are currently shown count, so a batch edit never
  // touches a card the admin can no longer see.
  const selectedIds = useMemo(
    () =>
      displayCards
        .filter((card) => checked.has(card.id))
        .map((card) => card.id),
    [displayCards, checked]
  );

  const selectedSet = useMemo(
    () => new Set(selectedIds),
    [selectedIds]
  );

  function toggle(id: string, shift: boolean) {
    // Read the anchor now: the updater below runs later, after
    // lastClicked has already moved on to this card.
    const anchor = lastClicked.current;

    setChecked((current) => {
      const next = new Set(current);
      const turnOn = !next.has(id);

      if (shift && anchor && anchor !== id) {
        const from = displayCards.findIndex((c) => c.id === anchor);
        const to = displayCards.findIndex((c) => c.id === id);

        if (from !== -1 && to !== -1) {
          const [start, end] =
            from < to ? [from, to] : [to, from];

          for (let i = start; i <= end; i++) {
            const rangeId = displayCards[i].id;

            if (turnOn) next.add(rangeId);
            else next.delete(rangeId);
          }

          return next;
        }
      }

      if (turnOn) next.add(id);
      else next.delete(id);

      return next;
    });

    lastClicked.current = id;
  }

  function toggleAll(on: boolean) {
    setChecked((current) => {
      const next = new Set(current);

      for (const card of displayCards) {
        if (on) next.add(card.id);
        else next.delete(card.id);
      }

      return next;
    });
  }

  return (
    <div className="space-y-6 pb-24">
      <CardManagerHeader />

      <CardFilters
        filters={filters}
        setFilters={setFilters}
        options={{
          showPool: true,
          showSet: true,
          showPower: true,
          showBulk: true,
          showColor: true,
        }}
      />

      <p className="text-sm text-muted-foreground">
        Showing {displayCards.length} of {rows.length} cards.
        Tick the boxes (shift-click for a range) to edit several at once.
      </p>

      <CardSheet
        cards={displayCards}
        selected={selectedSet}
        sort={sort}
        onSort={handleSort}
        onToggle={toggle}
        onToggleAll={toggleAll}
        onSaved={handleSaved}
      />

      {selectedIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full border bg-popover px-4 py-2 shadow-xl">
            <span className="text-sm font-medium">
              {selectedIds.length} selected
            </span>

            <Button size="sm" onClick={() => setEditing(true)}>
              Edit selected
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setChecked(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {editing && (
        <BatchEditDialog
          ids={selectedIds}
          open={editing}
          onOpenChange={setEditing}
          onDone={() => {
            setEditing(false);
            setChecked(new Set());

            // The card list is loaded by the server page: reload it.
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
