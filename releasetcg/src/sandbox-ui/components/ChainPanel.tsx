"use client";

import { Button } from "@/components/ui/button";

import { findCard, type SandboxCard } from "@/lib/sandbox";

import CardView from "./CardView";
import DropZone from "./DropZone";

import { useSandbox } from "../SandboxProvider";

function Row({
    cards,
    empty,
    onResolve,
}: {
    cards: SandboxCard[];
    empty: string;
    onResolve: (id: string) => void;
}) {

    if (cards.length === 0) {
        return <span className="px-1 text-xs text-muted-foreground">{empty}</span>;
    }

    return (
        <div className="flex gap-1">
            {cards.map(sc => (
                <div key={sc.id} className="group relative aspect-[5/7] h-[var(--chain-card-h)]">

                    <CardView sc={{ ...sc, faceUp: true }} draggable={false} onClick={() => {}} />

                    <button
                        type="button"
                        title="Mark as resolved"
                        onClick={() => onResolve(sc.id)}
                        className="absolute -right-1 -top-1 z-10 hidden h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow group-hover:flex"
                    >
                        ×
                    </button>

                </div>
            ))}
        </div>
    );

}

/**
 * Top-left chain: the cards played this turn (first row) and the parries
 * played against them (second row). Purely a visual queue: marking a card
 * resolved just removes it from the chain, the card stays on its gate.
 */
export default function ChainPanel() {

    const { state, game } = useSandbox();

    const lookup = (ids: string[]) =>
        ids
            .map(id => findCard(state, id)?.card)
            .filter((sc): sc is SandboxCard => Boolean(sc));

    const plays = lookup(state.chain.plays);

    const parries = lookup(state.chain.parries);

    const hasChain = plays.length > 0 || parries.length > 0;

    return (
        <div className="flex flex-col gap-1 rounded-xl border bg-card/80 p-2 shadow-sm">

            <div className="flex items-center justify-between gap-2">

                <span className="text-xs font-semibold">Chain</span>

                <Button
                    size="xs"
                    variant="outline"
                    disabled={!hasChain}
                    onClick={() => game.resolveChain()}
                >
                    Resolve all
                </Button>

            </div>

            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Plays (oldest first)
            </span>

            <div className="min-h-[var(--chain-card-h)]">
                <Row
                    cards={plays}
                    empty="Nothing played yet this turn"
                    onResolve={id => game.resolveCard(id)}
                />
            </div>

            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Parries (drop cards here)
            </span>

            <DropZone
                onCards={ids => game.parry(ids)}
                className="min-h-[var(--chain-card-h)] rounded-lg"
            >
                <Row
                    cards={parries}
                    empty={plays.length > 0 ? "No parries" : "Play a card first"}
                    onResolve={id => game.resolveCard(id)}
                />
            </DropZone>

        </div>
    );

}
