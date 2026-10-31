"use client";

import { getCardImageUrl } from "@/lib/images/getCardImageUrl";

import { useSandbox } from "../SandboxProvider";

/** Large preview of whichever face-up card the mouse is over. */
export default function CardPreview() {

    const { preview } = useSandbox();

    if (!preview) {
        return null;
    }

    return (
        <div className="pointer-events-none absolute left-3 top-1/2 z-40 w-[18vw] max-w-72 -translate-y-1/2">

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={getCardImageUrl(preview)}
                alt={preview.name}
                className="w-full rounded-2xl border shadow-2xl"
            />

            <div className="mt-1 rounded-lg bg-card/95 p-2 text-xs shadow">

                <b>{preview.name}</b>

                <div className="text-muted-foreground">
                    Power {preview.power} / Bulk {preview.bulk}
                    {preview.colors.length > 0 && `. ${preview.colors.join(", ")}`}
                </div>

                {[preview.effect1, preview.effect2].filter(Boolean).map(text => (
                    <p key={text} className="mt-1">{text}</p>
                ))}

            </div>

        </div>
    );

}
