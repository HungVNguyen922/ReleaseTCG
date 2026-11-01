"use client";

import type { SeatId } from "@/lib/sandbox";

import { useSandbox } from "../SandboxProvider";

/**
 * Slim tracker for a player's single Pass of the game. Click to spend it,
 * click again to give it back.
 */
export default function PassButton({ seat }: { seat: SeatId }) {

    const { state, game } = useSandbox();

    const used = state.passUsed[seat];

    return (
        <button
            type="button"
            aria-pressed={used}
            aria-label={`${seat} pass ${used ? "used" : "available"}`}
            title={used ? "Pass used (click to restore)" : "Click to use your Pass (once per game)"}
            onClick={() => game.togglePass(seat)}
            className={`
                flex w-7 shrink-0 items-center justify-center self-stretch rounded-xl border text-xs font-semibold
                [writing-mode:vertical-rl] rotate-180 transition-colors
                ${used
                    ? "bg-muted text-muted-foreground line-through opacity-60"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"}
            `}
        >
            {used ? "Pass used" : "Pass"}
        </button>
    );

}
