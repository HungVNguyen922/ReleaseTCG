"use client";

import { Button } from "@/components/ui/button";

import type { SeatId } from "@/lib/sandbox";

import { useSandbox } from "../SandboxProvider";
import { useCompact } from "../useCompact";

export default function HealthCounter({ seat }: { seat: SeatId }) {

    const { state, game } = useSandbox();

    const compact = useCompact();

    if (compact) {

        // Short screens: one number with a -1 / +1 pair underneath.
        return (
            <div className="flex flex-col items-center gap-0.5 rounded-xl border bg-card px-1.5 py-1">

                <span className="text-[10px] font-medium text-muted-foreground">
                    {seat} health
                </span>

                <span className="text-xl font-bold tabular-nums leading-none">
                    {state.health[seat]}
                </span>

                <div className="flex gap-1">

                    <Button size="xs" variant="outline" onClick={() => game.changeHealth(seat, -1)}>
                        -1
                    </Button>

                    <Button size="xs" variant="outline" onClick={() => game.changeHealth(seat, 1)}>
                        +1
                    </Button>

                </div>

            </div>
        );

    }

    return (
        <div className="flex flex-col items-center gap-1 rounded-xl border bg-card px-3 py-2">

            <span className="text-xs font-medium text-muted-foreground">
                {seat} health
            </span>

            <span className="text-3xl font-bold tabular-nums">
                {state.health[seat]}
            </span>

            <div className="flex gap-1">

                <Button size="xs" variant="outline" onClick={() => game.changeHealth(seat, -1)}>
                    -1
                </Button>

                <Button size="xs" variant="outline" onClick={() => game.changeHealth(seat, 1)}>
                    +1
                </Button>

            </div>

            <div className="flex gap-1">

                <Button size="xs" variant="ghost" onClick={() => game.changeHealth(seat, -5)}>
                    -5
                </Button>

                <Button size="xs" variant="ghost" onClick={() => game.changeHealth(seat, 5)}>
                    +5
                </Button>

            </div>

        </div>
    );

}
