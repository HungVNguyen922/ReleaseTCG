"use client";

import type { ColorMatchMode } from "@/types/cards";

import {
  CARD_COLORS,
  MAX_FILTER_COLORS,
  toggleColor,
} from "@/lib/cards/colorFilter";

import { colorMap } from "./PaletteChips";

type Props = {
  selected: string[];
  mode: ColorMatchMode;
  onChange: (selected: string[]) => void;
  onModeChange: (mode: ColorMatchMode) => void;
};

const MODES: { value: ColorMatchMode; label: string; hint: string }[] = [
  {
    value: "contains",
    label: "Contains",
    hint: "Cards that include all of the selected colors (they may have others too).",
  },
  {
    value: "exact",
    label: "Exact",
    hint: "Cards with exactly the selected colors and no others.",
  },
];

/**
 * Pick up to 4 colors, then choose whether to match every card that
 * contains them or only cards with exactly that palette.
 * Used by both the Gallery and the Deck Builder (via CardFilters).
 */
export function ColorFilter({
  selected,
  mode,
  onChange,
  onModeChange,
}: Props) {
  const atMax = selected.length >= MAX_FILTER_COLORS;
  const hasSelection = selected.length > 0;
  const activeMode = MODES.find((option) => option.value === mode) ?? MODES[0];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">
          Colors{" "}
          <span className="font-normal text-muted-foreground">
            ({selected.length}/{MAX_FILTER_COLORS})
          </span>
        </span>

        {hasSelection && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Colors" className="flex flex-wrap gap-1.5">
          {CARD_COLORS.map((color) => {
            const isSelected = selected.includes(color);
            const disabled = atMax && !isSelected;
            const chip = colorMap[color];

            return (
              <button
                key={color}
                type="button"
                aria-pressed={isSelected}
                aria-label={color}
                title={
                  disabled ? `Up to ${MAX_FILTER_COLORS} colors` : color
                }
                disabled={disabled}
                onClick={() => onChange(toggleColor(selected, color))}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white transition ${chip.bg} ${
                  isSelected
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    : "opacity-60 hover:opacity-100"
                } ${disabled ? "cursor-not-allowed opacity-25 hover:opacity-25" : ""}`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <div
          role="group"
          aria-label="Color match mode"
          className="flex overflow-hidden rounded-md border text-sm"
        >
          {MODES.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={mode === option.value}
              disabled={!hasSelection}
              onClick={() => onModeChange(option.value)}
              className={`px-3 py-1.5 transition disabled:opacity-50 ${
                mode === option.value
                  ? "bg-primary text-primary-foreground"
                  : "enabled:hover:bg-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {hasSelection
          ? activeMode.hint
          : `Pick up to ${MAX_FILTER_COLORS} colors to filter by.`}
      </p>
    </div>
  );
}
