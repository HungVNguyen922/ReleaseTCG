"use client";

import type { ColorMatchMode } from "@/types/cards";

import { GalleryFilterState, GallerySort, SortDirection } from "../types";

import { TextInput } from "@/app/(app)/components/fields/TextInput";
import { SelectInput } from "@/app/(app)/components/fields/SelectInput";
import { ColorFilter } from "@/app/(app)/components/cards/ColorFilter";

const SORT_OPTIONS: { label: string; value: GallerySort }[] = [
  { label: "Name", value: "name" },
  { label: "Power", value: "power" },
  { label: "Bulk", value: "bulk" },
  { label: "Set", value: "setName" },
];

type Props = {
  filters: GalleryFilterState;
  onSearch(value: string): void;
  onSetName(value: string): void;
  onColors(value: string[]): void;
  onColorMode(value: ColorMatchMode): void;
  onSort(value: GallerySort): void;
  onDirection(value: SortDirection): void;
};

export function GalleryFilters({
  filters,
  onSearch,
  onSetName,
  onColors,
  onColorMode,
  onSort,
  onDirection,
}: Props) {
  return (
    <div className="sticky top-0 z-20 space-y-4 border-b bg-background p-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <TextInput label="Search" value={filters.search} onChange={onSearch} />

        <TextInput label="Set" value={filters.setName} onChange={onSetName} />

        <SelectInput
          label="Sort"
          value={filters.sort}
          options={SORT_OPTIONS.map((option) => option.value)}
          onChange={(value) => onSort(value as GallerySort)}
        />

        <div>
          <label className="mb-1 block font-medium">Direction</label>
          <button
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
