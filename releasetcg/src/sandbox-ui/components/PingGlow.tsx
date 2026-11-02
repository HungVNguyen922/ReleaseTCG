"use client";

import { useSandbox } from "../SandboxProvider";

/**
 * The ping highlight. Put it inside a `relative` box; `target` is a card
 * id, or "zone:<zoneKey>" when a whole pile is being pinged.
 */
export default function PingGlow({ target }: { target: string }) {

    const { pings } = useSandbox();

    const nonce = pings[target];

    if (nonce === undefined) {
        return null;
    }

    // One fade in / fade out. The key restarts it on a re-ping.
    return (
        <span
            key={nonce}
            className="pointer-events-none absolute -inset-1 z-20 rounded-2xl opacity-0 ring-[5px] ring-amber-400 shadow-[0_0_18px_6px_rgba(251,191,36,0.8)] animate-[sandbox-ping_1s_ease-out_forwards]"
        />
    );

}
