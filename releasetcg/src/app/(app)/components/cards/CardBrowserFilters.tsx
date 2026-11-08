"use client";

import type {
  CardBrowserFilterState,
  CardSort,
  ColorMatchMode,
  SortDirection,
} from "@/types/cards";

import { CARD_SORT_OPTIONS } from "@/lib/cards/sortCards";
import { cn } from "@/lib/utils";

import { TextInput } from "@/app/(app)/components/fields/TextInput";
import { SelectInput } from "@/app/(app)/components/fields/SelectInput";

import { ColorFilter } from "./ColorFilter";

export type CardBrowserFiltersProps = {
  filters: CardBrowserFilterState;
  setOptions: string[];
  onSearch(value: string): void;
  onSetName(value: string): void;
  onColors(value: string[]): void;
  onColorMode(value: ColorMatchMode): void;
  onSort(value: CardSort): void;
  onDirection(value: SortDirection): void;
  className?: string;
};

/**
 * The filter bar used by both the Gallery and the Deck Builder.
 * It lays itself out based on its own width, so it works in a full-width
 * header or in a narrower column.
 */
export function CardBrowserFilters({
  filters,
  setOptions,
  onSearch,
  onSetName,
  onColors,
  onColorMode,
  onSort,
  onDirection,
  className,
}: CardBrowserFiltersProps) {
  return (
    <div className={cn("@container space-y-4 bg-background p-4", className)}>
      <div className="grid grid-cols-2 gap-4 @xl:grid-cols-4">
        <TextInput
          label="Search"
          placeholder="Name, trait, or effect"
          value={filters.search}
          onChange={onSearch}
        />

        <SelectInput
          label="Set"
          value={filters.setName}
          options={[
            { label: "All sets", value: "" },
            ...setOptions.map((name) => ({ label: name, value: name })),
          ]}
          onChange={onSetName}
        />

        <SelectInput
          label="Sort"
          value={filters.sort}
          options={CARD_SORT_OPTIONS}
          onChange={(value) => onSort(value as CardSort)}
        />

        <div>
          <label className="mb-1 block font-medium">Direction</label>
          <button
            type="button"
            onClick={() =>
              onDirection(filters.direction === "asc" ? "desc" : "asc")
            }
            className="w-full rounded border p-2 hover:bg-muted"
          >
            {filters.direction === "asc" ? "↑ Ascending" : "↓ Descending"}
          </button>
        </div>
      </div>

      <ColorFilter
        selected={filters.colors}
        mode={filters.colorMode}
        onChange={onColors}
        onModeChange={onColorMode}
      />
    </div>
  );
}
