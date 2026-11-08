import { PaletteChips } from "@/app/(app)/components/cards/PaletteChips";

/** Shows whether a card can be played on top of another, by color. */
export function MatchExample({
  top,
  played,
  works,
  note,
}: {
  top: string[];
  played: string[];
  works: boolean;
  note: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Top of Gate</span>
        <PaletteChips palette={top} size="md" />
      </div>
      <span aria-hidden className="text-muted-foreground">
        ←
      </span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Your card</span>
        <PaletteChips palette={played} size="md" />
      </div>
      <span
        className={
          works
            ? "font-semibold text-emerald-600"
            : "font-semibold text-red-600"
        }
      >
        {works ? "✓ Legal" : "✗ Not legal"}
      </span>
      <span className="text-muted-foreground">{note}</span>
    </div>
  );
}

/** Shows a sequence of cards, each linked to the one before it by color. */
export function ColorPath({ steps }: { steps: string[][] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
      {steps.map((palette, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="rounded-md border px-2 py-1">
            <PaletteChips palette={palette} size="md" />
          </div>
          {i < steps.length - 1 && (
            <span aria-hidden className="text-muted-foreground">
              →
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Shows the Power values in a Gate from bottom to top.
 * `counted` is how many of the top cards the attack looks at.
 */
export function PowerRow({
  powers,
  counted,
  result,
}: {
  powers: number[];
  counted: number;
  result: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-3">
      <div className="flex items-end gap-1.5">
        <span className="pb-2 text-[10px] uppercase text-muted-foreground">
          bottom
        </span>
        {powers.map((power, i) => {
          const isCounted = i >= powers.length - counted;

          return (
            <div
              key={i}
              className={
                isCounted
                  ? "flex h-12 w-10 items-center justify-center rounded-md border-2 border-primary bg-primary/10 text-lg font-bold"
                  : "flex h-12 w-10 items-center justify-center rounded-md border border-dashed text-lg text-muted-foreground"
              }
            >
              {power}
            </div>
          );
        })}
        <span className="pb-2 text-[10px] uppercase text-muted-foreground">
          top
        </span>
      </div>
      <p className="text-sm font-medium">{result}</p>
    </div>
  );
}
