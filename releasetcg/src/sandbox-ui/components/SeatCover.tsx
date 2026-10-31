"use client";

import { Button } from "@/components/ui/button";

import { useSandbox } from "../SandboxProvider";

/** Hides every hand while the device is handed to the other player. */
export default function SeatCover() {

    const { coverFor, revealToViewer } = useSandbox();

    if (!coverFor) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-background">

            <h2 className="text-3xl font-bold">
                Pass the device to {coverFor}
            </h2>

            <p className="text-muted-foreground">
                Hands are hidden until {coverFor} is ready.
            </p>

            <Button size="lg" onClick={revealToViewer}>
                I&apos;m {coverFor}. Show my hand
            </Button>

        </div>
    );

}
