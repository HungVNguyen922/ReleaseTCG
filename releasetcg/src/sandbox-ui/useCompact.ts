"use client";

import { useSyncExternalStore } from "react";

/** Phones in landscape (and any other very short window). */
const QUERY = "(max-height: 520px)";

function subscribe(onChange: () => void): () => void {

    const mql = window.matchMedia(QUERY);

    mql.addEventListener("change", onChange);

    return () => mql.removeEventListener("change", onChange);

}

/** True when the window is too short for the roomy desktop layout. */
export function useCompact(): boolean {

    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(QUERY).matches,
        () => false,
    );

}
