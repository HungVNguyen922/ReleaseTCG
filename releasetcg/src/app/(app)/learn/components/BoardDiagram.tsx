import { cn } from "@/lib/utils";

type Tone = "gate" | "set" | "pile" | "hand" | "extra" | "health";

const TONES: Record<Tone, string> = {
  gate: "border-red-500/60 bg-red-500/10",
  set: "border-orange-500/60 bg-orange-500/10",
  pile: "border-yellow-500/70 bg-yellow-400/15",
  hand: "border-blue-500/60 bg-blue-500/10",
  extra: "border-violet-500/60 bg-violet-500/10",
  health: "border-emerald-500/60 bg-emerald-500/10",
};

function Tile({
  label,
  sub,
  tone,
  className,
}: {
  label: string;
  sub?: string;
  tone: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-14 flex-col items-center justify-center rounded-md border-2 border-dashed px-1 py-2 text-center text-xs",
        TONES[tone],
        className
      )}
    >
      <span className="font-semibold">{label}</span>
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-2">{children}</div>;
}

const LEGEND: { tone: Tone; label: string }[] = [
  { tone: "gate", label: "Gate Zones" },
  { tone: "set", label: "Set Zones" },
  { tone: "pile", label: "Public Pile and Gap" },
  { tone: "hand", label: "Hand" },
  { tone: "extra", label: "Extra Deck" },
];

/** A schematic of the board from your point of view (not to scale). */
export function BoardDiagram() {
  return (
    <figure className="space-y-3">
      <div className="mx-auto max-w-xl space-y-2 rounded-xl border bg-card p-4">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Opponent
        </p>

        <Row>
          {[0, 1, 2].map((i) => (
            <Tile key={i} tone="set" label="Set Zone" sub="face down" />
          ))}
        </Row>
        <Row>
          {[0, 1, 2].map((i) => (
            <Tile
              key={i}
              tone="gate"
              label="Gate Zone"
              sub={i === 1 ? "Their Starter" : "Their Home Row"}
            />
          ))}
        </Row>

        <div className="flex items-center justify-between gap-2 py-1">
          <Tile tone="pile" label="Gap" sub="effect discard" className="w-28" />
          <span className="text-xs text-muted-foreground">Shared center</span>
          <Tile
            tone="pile"
            label="Public Pile"
            sub="shared draw pile"
            className="w-28"
          />
        </div>

        <Row>
          {[0, 1, 2].map((i) => (
            <Tile
              key={i}
              tone="gate"
              label="Gate Zone"
              sub={i === 1 ? "Your Starter" : "Your Home Row"}
            />
          ))}
        </Row>
        <Row>
          {[0, 1, 2].map((i) => (
            <Tile key={i} tone="set" label="Set Zone" sub="face down" />
          ))}
        </Row>

        <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          You
        </p>

        <div className="flex gap-2">
          <Tile tone="hand" label="Your Hand" sub="max 8 cards" className="flex-1" />
          <Tile tone="extra" label="Extra Deck" sub="6 cards" className="w-24" />
          <Tile tone="health" label="Health" sub="starts at 10" className="w-24" />
        </div>
      </div>

      <figcaption className="space-y-2 text-center text-xs text-muted-foreground">
        <p>
          Schematic view. Each column pairs one Gate Zone with one Set Zone for
          each player.
        </p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {LEGEND.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-block h-3 w-3 rounded-sm border-2 border-dashed",
                  TONES[item.tone]
                )}
              />
              {item.label}
            </span>
          ))}
        </div>
      </figcaption>
    </figure>
  );
}
