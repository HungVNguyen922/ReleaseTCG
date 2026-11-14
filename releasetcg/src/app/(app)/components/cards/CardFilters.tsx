"use client";

import type { CardFilterValues } from "@/types/cards";

import { SETS, setLabel } from "@/lib/sets/sets";

import { ColorFilter } from "./ColorFilter";

type Props = {
  filters: CardFilterValues;
  setFilters: React.Dispatch<
      React.SetStateAction<CardFilterValues>
  >;

  options?: {
    showPool?: boolean;
    /** A Set dropdown. Off unless asked for, so other screens look the same. */
    showSet?: boolean;
    showPower?: boolean;
    showBulk?: boolean;
    showColor?: boolean;
  };
};

const pools = [
  "all",
  "draft",
  "private",
  "beta",
  "public",
];

const powers = [
  "all",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
];

const bulks = powers;

export function CardFilters({
  filters,
  setFilters,
  options = {},
}: Props) {
  const {
    showPool = true,
    showSet = false,
    showPower = true,
    showBulk = true,
    showColor = true,
  } = options;

  function update<K extends keyof CardFilterValues>(
    key: K,
    value: CardFilterValues[K]
  ) {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  const visibleSelects = [
    showPool,
    showSet,
    showPower,
    showBulk,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 rounded-xl border p-4">
      {/* Search */}
      <div className="space-y-1">
        <input
          className="w-full rounded-md border p-2"
          placeholder="Search every field: name, trait, effect, flavor, artist, set..."
          value={filters.search}
          onChange={(e) =>
            update("search", e.target.value)
          }
        />

        <p className="text-xs text-muted-foreground">
          Every word must match somewhere on the card. Narrow it down with{" "}
          <code>set:PRBR</code> <code>effect:parry</code>{" "}
          <code>trait:BLK</code> <code>color:red</code>{" "}
          <code>pool:draft</code> <code>{"power:>=3"}</code>, leave
          things out with <code>-dmg</code>, or match a phrase with{" "}
          <code>&quot;draw 1&quot;</code>.
        </p>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        {/* Secondary Filters */}
        {visibleSelects > 0 && (
          <div
            className={`
              grid gap-4 xl:shrink-0
              ${
                visibleSelects === 1
                  ? "grid-cols-1 xl:w-72"
                  : visibleSelects === 2
                  ? "grid-cols-2 xl:w-72"
                  : visibleSelects === 3
                  ? "grid-cols-3 xl:w-72"
                  : "grid-cols-2 sm:grid-cols-4 xl:w-[26rem]"
              }
            `}
          >
            {showPool && (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Pool
                </label>

                <select
                  className="w-full rounded border p-2"
                  value={filters.pool}
                  onChange={(e) =>
                    update("pool", e.target.value)
                  }
                >
                  {pools.map((pool) => (
                    <option
                      key={pool}
                      value={pool}
                    >
                      {pool}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {showSet && (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Set
                </label>

                <select
                  className="w-full rounded border p-2"
                  value={filters.setName ?? "all"}
                  onChange={(e) =>
                    update("setName", e.target.value)
                  }
                >
                  <option value="all">all</option>

                  {SETS.map((set) => (
                    <option
                      key={set.code}
                      value={set.code}
                    >
                      {setLabel(set.code)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {showPower && (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Power
                </label>

                <select
                  className="w-full rounded border p-2"
                  value={filters.power}
                  onChange={(e) =>
                    update("power", e.target.value)
                  }
                >
                  {powers.map((power) => (
                    <option
                      key={power}
                      value={power}
                    >
                      {power}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {showBulk && (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Bulk
                </label>

                <select
                  className="w-full rounded border p-2"
                  value={filters.bulk}
                  onChange={(e) =>
                    update("bulk", e.target.value)
                  }
                >
                  {bulks.map((bulk) => (
                    <option
                      key={bulk}
                      value={bulk}
                    >
                      {bulk}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {showColor && (
          <div className="min-w-0 flex-1">
            <ColorFilter
              selected={filters.colors}
              mode={filters.colorMode}
              onChange={(colors) => update("colors", colors)}
              onModeChange={(colorMode) => update("colorMode", colorMode)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
