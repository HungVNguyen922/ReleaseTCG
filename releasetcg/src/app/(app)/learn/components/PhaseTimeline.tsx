import Link from "next/link";

import { learnHref } from "../lessons";

const PHASES: {
  name: string;
  blurb: string;
  steps?: string[];
  more?: { label: string; slug: string };
}[] = [
  {
    name: "Instant Phase",
    blurb: "Play any cards with quick actions (such as IP React cards).",
  },
  {
    name: "Action Phase",
    blurb:
      "The heart of your turn: make one Play (or Pass), let your opponent respond, resolve effects, then attack.",
    steps: ["Play", "Response", "Effect", "Attack"],
    more: { label: "Playing Cards", slug: "plays" },
  },
  {
    name: "Fill Phase",
    blurb:
      "Refill your hand to 4 cards, draw a bonus card if you played 3 or more, and discard down to 8.",
    steps: ["Fill", "Mill", "Max"],
  },
  {
    name: "End Phase",
    blurb: "Your turn ends and the next player’s turn begins.",
  },
];

export function PhaseTimeline() {
  return (
    <ol className="space-y-4">
      {PHASES.map((phase, i) => (
        <li key={phase.name} className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1 space-y-2 rounded-lg border bg-card p-4">
            <p className="font-semibold">{phase.name}</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {phase.blurb}
            </p>
            {phase.steps && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {phase.steps.map((step, s) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className="rounded-full border px-3 py-1 text-xs font-medium">
                      {step}
                    </span>
                    {s < phase.steps!.length - 1 && (
                      <span aria-hidden className="text-muted-foreground">
                        →
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
            {phase.more && (
              <Link
                href={learnHref(phase.more.slug)}
                className="inline-block text-sm font-medium underline underline-offset-4 hover:text-primary"
              >
                Go deeper: {phase.more.label}
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
