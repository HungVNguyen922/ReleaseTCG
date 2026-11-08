import {
  AXIS_LABEL,
  COLORS,
  COLOR_CHIP,
  type Axis,
} from "./colorData";

const AXES: Axis[] = ["K", "L", "D"];

/** The 3x3 map of the nine colors across the three win conditions. */
export function ColorGrid() {
  return (
    <figure className="space-y-3">
      <div className="mx-auto grid max-w-xl grid-cols-[auto_repeat(3,1fr)] gap-2">
        <span />
        {AXES.map((axis) => (
          <span
            key={`col-${axis}`}
            className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            {AXIS_LABEL[axis]}
          </span>
        ))}

        {AXES.map((rowAxis) => (
          <div key={rowAxis} className="contents">
            <span className="flex items-center pr-1 text-xs font-medium uppercase tracking-wide text-muted-foreground [writing-mode:vertical-rl] rotate-180">
              {AXIS_LABEL[rowAxis]}
            </span>
            {AXES.map((colAxis) => {
              const code = `${rowAxis}${colAxis}`;
              const color = COLORS.find((c) => c.code === code);

              if (!color) return <span key={code} />;

              return (
                <div
                  key={code}
                  className={`flex min-h-20 flex-col items-center justify-center rounded-lg p-2 text-center ${COLOR_CHIP[color.name]}`}
                >
                  <span className="text-sm font-bold">{color.name}</span>
                  <span className="text-[11px] opacity-90">
                    {color.element}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <figcaption className="text-center text-xs text-muted-foreground">
        Each color sits where two of the three win conditions meet. Violet
        leans hardest into Knockout, Yellow into Lockout, and Green into
        Deckout.
      </figcaption>
    </figure>
  );
}
