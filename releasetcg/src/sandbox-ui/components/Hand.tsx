"use client";

import PileBack from "@/game-ui/components/piles/PileBack";

import { handZone, type SeatId } from "@/lib/sandbox";

import CardView from "./CardView";
import DropZone from "./DropZone";

import { useSandbox } from "../SandboxProvider";

interface Props {
    seat: SeatId;
}

/**
 * The viewer's hand is face up and draggable (drop onto a card to insert
 * before it). The other seat's hand shows only backs.
 */
export default function Hand({ seat }: Props) {

    const { state, viewer, coverFor } = useSandbox();

    const cards = state.zones[handZone(seat)];

    const visible = seat === viewer && coverFor === null;

    if (!visible) {

        return (
            <DropZone
                zone={handZone(seat)}
                className="flex h-full items-center justify-center gap-1 px-2"
            >

                <span className="mr-2 text-xs text-muted-foreground">
                    {seat} hand
                </span>

                {cards.map(sc => (
                    <div key={sc.id} className="aspect-[5/7] h-[5vh]">
                        <PileBack count={1} className="[&_span]:hidden" />
                    </div>
                ))}

                {cards.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                        empty
                    </span>
                )}

            </DropZone>
        );

    }

    return (
        <DropZone
            zone={handZone(seat)}
            className="flex h-full items-end justify-center gap-1 overflow-x-auto px-2 pb-1"
        >

            {cards.map((sc, index) => (
                <DropZone
                    key={sc.id}
                    zone={handZone(seat)}
                    options={{ position: index }}
                    target={false}
                    className="aspect-[5/7] h-[var(--hand-card-h)] shrink-0 transition-transform hover:-translate-y-2"
                >
                    <CardView sc={sc} />
                </DropZone>
            ))}

            {cards.length === 0 && (
                <span className="self-center text-sm text-muted-foreground">
                    Your hand is empty. Draw from the public pile.
                </span>
            )}

        </DropZone>
    );

}
