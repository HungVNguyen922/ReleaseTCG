"use client";

import type { Zone } from "../types";

type Props = {
  activeZone: Zone;
  setActiveZone: (zone: Zone) => void;
};

export default function DeckControls({ activeZone, setActiveZone }: Props) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border p-2 md:p-3">
      <div className="flex flex-col">
        <div className="text-sm">
          <span className="text-muted-foreground">Mode: </span>
          <span className="font-medium capitalize">{activeZone}</span>
        </div>

        <div className="hidden text-xs text-muted-foreground md:block [@media(max-height:520px)]:hidden!">
          {activeZone === "main" && "Click cards to add to main deck"}
          {activeZone === "extra" && "Click cards to add to extra deck"}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveZone("main")}
          className={`rounded border px-3 py-1 transition ${
            activeZone === "main" ? "bg-green-100 border-green-400" : "hover:bg-muted"
          }`}
        >
          Main
        </button>

        <button
          onClick={() => setActiveZone("extra")}
          className={`rounded border px-3 py-1 transition ${
            activeZone === "extra" ? "bg-purple-100 border-purple-400" : "hover:bg-muted"
          }`}
        >
          Extra
        </button>
      </div>
    </div>
  );
}