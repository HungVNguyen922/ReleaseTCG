"use client";

import { SLOTS, extraZone, gateZone, setZone, type SeatId } from "@/lib/sandbox";

import HealthCounter from "./HealthCounter";
import PilePanel from "./PilePanel";
import StackZone from "./StackZone";

const SLOT_LABELS = ["Left", "Center", "Right"] as const;

interface Props {
    seat: SeatId;
    /** "top" puts the set row on the outside (above the gates). */
    edge: "top" | "bottom";
}

export default function SeatField({ seat, edge }: Props) {

    const gates = (
        <div className="flex gap-2">
            {SLOTS.map(slot => (
                <StackZone
                    key={slot}
                    zone={gateZone(seat, slot)}
                    label={`Gate ${SLOT_LABELS[slot]}`}
                />
            ))}
        </div>
    );

    const sets = (
        <div className="flex gap-2">
            {SLOTS.map(slot => (
                <StackZone
                    key={slot}
                    zone={setZone(seat, slot)}
                    label={`Set ${SLOT_LABELS[slot]}`}
                />
            ))}
        </div>
    );

    return (
        <div className="flex items-center justify-center gap-6">

            <PilePanel zone={extraZone(seat)} title={`${seat} extra deck`} />

            <div className="flex flex-col gap-1">
                {edge === "top" ? <>{sets}{gates}</> : <>{gates}{sets}</>}
            </div>

            <HealthCounter seat={seat} />

        </div>
    );

}
