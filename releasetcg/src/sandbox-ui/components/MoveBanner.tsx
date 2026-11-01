"use client";

import { Button } from "@/components/ui/button";

import { describeZone } from "@/lib/sandbox";

import { useSandbox } from "../SandboxProvider";

/** Shown while the player is choosing where to send cards taken from a zone. */
export default function MoveBanner() {

    const { moving, cancelMove } = useSandbox();

    if (!moving) {
        return null;
    }

    const count = moving.ids.length;

    return (
        <div className="absolute left-1/2 top-[9vh] z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border bg-card px-4 py-2 text-sm shadow-xl">

            <span>
                Moving the {moving.side} <b>{count}</b> {count === 1 ? "card" : "cards"} of{" "}
                <b className="capitalize">{describeZone(moving.from)}</b>. Click a highlighted zone.
            </span>

            <Button size="xs" variant="outline" onClick={cancelMove}>
                Cancel (Esc)
            </Button>

        </div>
    );

}
