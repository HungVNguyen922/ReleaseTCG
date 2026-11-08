"use client";

import { Button } from "@/components/ui/button";

import { describeZone, findCard, type SandboxCard } from "@/lib/sandbox";

import CardView from "./CardView";
import DropZone from "./DropZone";

import { useSandbox } from "../SandboxProvider";

const cornerButton = "absolute z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow [@media(hover:hover)]:hidden [@media(hover:hover)]:group-hover:flex";

function Row({
    cards,
    empty,
    onResolve,
}: {
    cards: SandboxCard[];
    empty: string;
    onResolve: (id: string) => void;
}) {

    const { ping, state, selected, toggleSelect, openMenu } = useSandbox();

    if (cards.length === 0) {
        return <span className="px-1 text-xs text-muted-foreground">{empty}</span>;
    }

    return (
        <div className="flex gap-1">
            {cards.map(sc => {

                const where = findCard(state, sc.id);

                return (
                    <div
                        key={sc.id}
                        title={where ? `On ${describeZone(where.zone)}` : undefined}
                        className="group relative aspect-[5/7] h-[var(--chain-card-h)]"
                    >

                        {/* Draggable like any other card, so it can go straight to a zone. */}
                        <CardView
                            sc={{ ...sc, faceUp: true }}
                            onClick={event => {

                                if (event.shiftKey || event.ctrlKey || event.metaKey) {
                                    toggleSelect(sc.id);
                                } else {
                                    ping(sc.id);
                                }

                            }}
                        />

                        <button
                            type="button"
                            title="Move, flip or look: same menu as right-click"
                            aria-label="Card actions"
                            onClick={event => {

                                event.stopPropagation();

                                const rect = event.currentTarget.getBoundingClientRect();

                                openMenu(
                                    rect.left,
                                    rect.bottom + 4,
                                    selected.includes(sc.id) ? selected : [sc.id],
                                );

                            }}
                            className={`${cornerButton} -left-1 -top-1`}
                        >
                            &#x22EF;
                        </button>

                        <button
                            type="button"
                            title="Mark as resolved"
                            aria-label="Mark as resolved"
                            onClick={() => onResolve(sc.id)}
                            className={`${cornerButton} -right-1 -top-1`}
                        >
                            ×
                        </button>

                    </div>
                );

            })}
        </div>
    );

}

function RowHeader({
    label,
    cards,
}: {
    label: string;
    cards: SandboxCard[];
}) {

    const { selected, toggleSelect } = useSandbox();

    const allSelected =
        cards.length > 0 && cards.every(sc => selected.includes(sc.id));

    return (
        <div className="flex items-center justify-between gap-2">

            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {label}
            </span>

            {cards.length > 1 && (
                <button
                    type="button"
                    onClick={() => {

                        for (const sc of cards) {

                            if (allSelected || !selected.includes(sc.id)) {
                                toggleSelect(sc.id);
                            }

                        }

                    }}
                    className="text-[10px] text-muted-foreground underline-offset-2 hover:underline"
                >
                    {allSelected ? "Deselect all" : "Select all"}
                </button>
            )}

        </div>
    );

}

/**
 * Top-left chain: the cards played this turn (first row) and the parries
 * played against them (second row). Cards here can be dragged straight to
 * any zone, or moved from their menu button, without digging through the
 * gates. Marking a card resolved just removes it from the chain; it stays on
 * its gate.
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

            <RowHeader label="Plays (oldest first)" cards={plays} />

            <div className="min-h-[var(--chain-card-h)]">
                <Row
                    cards={plays}
                    empty="Nothing played yet this turn"
                    onResolve={id => game.resolveCard(id)}
                />
            </div>

            <RowHeader label="Parries (drop cards here)" cards={parries} />

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

            <p className="text-[10px] leading-tight text-muted-foreground">
                Drag a card out of the chain, or use its menu button, to move
                it. Shift-click selects several. Moving a card off its gate
                also takes it out of the chain.
            </p>

        </div>
    );

}
