"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { CARD_COLORS, CARD_POOLS } from "@/lib/cards/options";
import type { BatchChanges } from "@/lib/cards/batchUpdate";

type FieldKey =
  | "pool"
  | "power"
  | "bulk"
  | "colors"
  | "trait"
  | "artist"
  | "setName";

type Props = {
  /** Ids of the cards that will be changed. */
  ids: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Called after the cards were updated. */
  onDone: () => void;
};

const inputClass =
  "w-full rounded border bg-background p-2 disabled:opacity-40";

const EMPTY_COLORS = ["", "", "", ""];

/**
 * Change the same values on many cards at once. Nothing is touched unless
 * its "Change" box is ticked, so you can edit one value or several.
 */
export function BatchEditDialog({ ids, open, onOpenChange, onDone }: Props) {
  const [enabled, setEnabled] = useState<Record<FieldKey, boolean>>({
    pool: false,
    power: false,
    bulk: false,
    colors: false,
    trait: false,
    artist: false,
    setName: false,
  });

  const [pool, setPool] = useState<string>(CARD_POOLS[0]);
  const [power, setPower] = useState("");
  const [bulk, setBulk] = useState("");
  const [colors, setColors] = useState<string[]>(EMPTY_COLORS);
  const [trait, setTrait] = useState("");
  const [artist, setArtist] = useState("");
  const [setName, setSetName] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const anyEnabled = Object.values(enabled).some(Boolean);

  function toggle(key: FieldKey, on: boolean) {
    setEnabled((current) => ({ ...current, [key]: on }));
  }

  function buildChanges(): BatchChanges | string {
    const changes: BatchChanges = {};

    const wholeNumber = (value: string) =>
      /^\d+$/.test(value.trim()) ? Number(value) : null;

    if (enabled.pool) changes.pool = pool;

    if (enabled.power) {
      const value = wholeNumber(power);
      if (value === null) return "Power must be a whole number";
      changes.power = value;
    }

    if (enabled.bulk) {
      const value = wholeNumber(bulk);
      if (value === null) return "Bulk must be a whole number";
      changes.bulk = value;
    }

    if (enabled.colors) changes.colors = colors;
    if (enabled.trait) changes.trait = trait;
    if (enabled.artist) changes.artist = artist;
    if (enabled.setName) changes.setName = setName;

    return changes;
  }

  async function save() {
    const changes = buildChanges();

    if (typeof changes === "string") {
      setError(changes);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/cards/batch-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, changes }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.error ?? "Could not update the cards");
        return;
      }

      onDone();
    } catch {
      setError("Could not reach the server");
    } finally {
      setSaving(false);
    }
  }

  function Row({
    field,
    label,
    children,
  }: {
    field: FieldKey;
    label: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1">
        <input
          type="checkbox"
          id={`batch-${field}`}
          aria-label={`Change ${label}`}
          className="mt-3 size-4 cursor-pointer"
          checked={enabled[field]}
          onChange={(e) => toggle(field, e.target.checked)}
        />

        <div>
          <label
            htmlFor={`batch-${field}`}
            className="mb-1 block cursor-pointer font-medium"
          >
            {label}
          </label>

          {children}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Edit {ids.length} {ids.length === 1 ? "card" : "cards"}
          </DialogTitle>

          <DialogDescription>
            Tick the values you want to change. Everything else stays as it
            is on each card.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Row field="pool" label="Pool">
            <select
              className={inputClass}
              disabled={!enabled.pool}
              value={pool}
              onChange={(e) => setPool(e.target.value)}
            >
              {CARD_POOLS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Row>

          <div className="grid grid-cols-2 gap-4">
            <Row field="power" label="Power">
              <input
                className={inputClass}
                inputMode="numeric"
                disabled={!enabled.power}
                value={power}
                onChange={(e) => setPower(e.target.value)}
              />
            </Row>

            <Row field="bulk" label="Bulk">
              <input
                className={inputClass}
                inputMode="numeric"
                disabled={!enabled.bulk}
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
              />
            </Row>
          </div>

          <Row field="colors" label="Colors (replaces all four)">
            <div className="grid grid-cols-2 gap-2">
              {colors.map((color, slot) => (
                <select
                  key={slot}
                  aria-label={`Color ${slot + 1}`}
                  className={inputClass}
                  disabled={!enabled.colors}
                  value={color}
                  onChange={(e) =>
                    setColors((current) =>
                      current.map((c, i) =>
                        i === slot ? e.target.value : c
                      )
                    )
                  }
                >
                  <option value="">None</option>

                  {CARD_COLORS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </Row>

          <Row field="trait" label="Trait (leave blank to clear)">
            <input
              className={inputClass}
              disabled={!enabled.trait}
              value={trait}
              onChange={(e) => setTrait(e.target.value)}
            />
          </Row>

          <Row field="artist" label="Artist (leave blank to clear)">
            <input
              className={inputClass}
              disabled={!enabled.artist}
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
          </Row>

          <Row field="setName" label="Set name (leave blank to clear)">
            <input
              className={inputClass}
              disabled={!enabled.setName}
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
            />
          </Row>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button onClick={save} disabled={!anyEnabled || saving}>
            {saving
              ? "Saving..."
              : `Update ${ids.length} ${ids.length === 1 ? "card" : "cards"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
