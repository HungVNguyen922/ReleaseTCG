import { PaletteChips } from "@/app/(app)/components/cards/PaletteChips";
import { StatChips } from "@/app/(app)/components/cards/StatChips";

type Props = {
  name: string;
  power: number;
  bulk: number;
  palette: string[];
  trait?: string;
  effects?: string[];
};

/**
 * A small, illustrative card. Mirrors the real card layout:
 * stats top left, name top middle, colors top right, text below.
 */
export function ExampleCard({
  name,
  power,
  bulk,
  palette,
  trait,
  effects = [],
}: Props) {
  return (
    <div className="w-64 shrink-0 rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <StatChips power={power} bulk={bulk} size="md" />
        <span className="truncate text-sm font-semibold">{name}</span>
        <PaletteChips palette={palette} size="md" />
      </div>

      <div className="mt-3 space-y-2 rounded-md bg-muted p-2 text-xs leading-5">
        {trait && (
          <p>
            <span className="font-semibold">Trait:</span>{" "}
            <span className="italic">{trait}</span>
          </p>
        )}
        {effects.map((effect, i) => (
          <p key={i}>
            <span className="font-semibold">Effect {i + 1}:</span> {effect}
          </p>
        ))}
      </div>
    </div>
  );
}
