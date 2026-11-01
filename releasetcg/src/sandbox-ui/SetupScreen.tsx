"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import type { PlayableCard } from "@/types/cards";
import type { DeckSummary } from "@/types/decks";

import { listDecks } from "@/utils/decks/listDecks";
import { getDeck } from "@/utils/decks/getDeck";

import {
    buildTestDeck,
    expandDeck,
    type SandboxDeckInput,
    type SandboxSetupOptions,
    type SeatId,
} from "@/lib/sandbox";

const TEST_DECK = "__test__";

interface Props {
    cards: PlayableCard[];
    onStart: (
        decks: Record<SeatId, SandboxDeckInput>,
        options: SandboxSetupOptions,
    ) => void;
}

export default function SetupScreen({ cards, onStart }: Props) {

    const [decks, setDecks] = useState<DeckSummary[]>([]);

    const [deckNote, setDeckNote] = useState<string | null>(null);

    const [choice, setChoice] = useState<Record<SeatId, string>>({
        P1: TEST_DECK,
        P2: TEST_DECK,
    });

    const [handSize, setHandSize] = useState(4);

    const [starterGate, setStarterGate] = useState(true);

    const [starting, setStarting] = useState(false);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        let cancelled = false;

        listDecks()
            .then(result => {
                if (!cancelled) {
                    setDecks(result);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setDeckNote("Log in to use your saved decks. Test decks work either way.");
                }
            });

        return () => {
            cancelled = true;
        };

    }, []);

    async function loadSeat(seat: SeatId): Promise<{ deck: SandboxDeckInput; warning: string | null }> {

        if (choice[seat] === TEST_DECK) {
            return { deck: buildTestDeck(cards), warning: null };
        }

        const saved = await getDeck(choice[seat]);

        const main = expandDeck(saved.mainDeck, cards);

        const extra = expandDeck(saved.extraDeck, cards);

        const missing = main.missing.length + extra.missing.length;

        return {
            deck: { mainDeck: main.cards, extraDeck: extra.cards },
            warning: missing > 0
                ? `${seat}: ${missing} card(s) in "${saved.name}" couldn't be found and were skipped.`
                : null,
        };

    }

    async function start() {

        setStarting(true);
        setError(null);

        try {

            if (cards.length === 0) {
                throw new Error("No cards are available to play with.");
            }

            const [first, second] = await Promise.all([
                loadSeat("P1"),
                loadSeat("P2"),
            ]);

            const warnings = [first.warning, second.warning].filter(Boolean);

            if (warnings.length > 0) {
                console.warn(warnings.join(" "));
            }

            onStart(
                { P1: first.deck, P2: second.deck },
                { startingHandSize: handSize, starterGate },
            );

        } catch (err) {

            setError(err instanceof Error ? err.message : "Could not start the sandbox.");

            setStarting(false);

        }

    }

    return (
        <div className="h-full overflow-y-auto">

        <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-6 p-6 pl-14 sm:pl-6">

            <div>
                <h1 className="text-3xl font-bold">Sandbox</h1>
                <p className="text-muted-foreground">
                    Play-test on one device. Nothing is enforced: move cards anywhere,
                    draw whenever you like, and undo mistakes.
                </p>
            </div>

            {(["P1", "P2"] as SeatId[]).map(seat => (
                <label key={seat} className="flex flex-col gap-1 text-sm font-medium">

                    {seat} deck

                    <select
                        value={choice[seat]}
                        onChange={event =>
                            setChoice(current => ({ ...current, [seat]: event.target.value }))
                        }
                        className="h-10 rounded-lg border bg-background px-3"
                    >
                        <option value={TEST_DECK}>Test deck (random cards)</option>

                        {decks.map(deck => (
                            <option key={deck.id} value={deck.id}>
                                {deck.name}
                            </option>
                        ))}
                    </select>

                </label>
            ))}

            {deckNote && (
                <p className="text-sm text-muted-foreground">{deckNote}</p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-sm">

                <label className="flex items-center gap-2">
                    Starting hand
                    <input
                        type="number"
                        min={0}
                        max={12}
                        value={handSize}
                        onChange={event =>
                            setHandSize(Math.max(0, Math.min(12, Number(event.target.value) || 0)))
                        }
                        className="h-9 w-16 rounded-lg border bg-background px-2 text-center"
                    />
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={starterGate}
                        onChange={event => setStarterGate(event.target.checked)}
                    />
                    Random starter gate
                </label>

            </div>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            <Button size="lg" onClick={start} disabled={starting}>
                {starting ? "Loading..." : "Start sandbox"}
            </Button>

        </div>

        </div>
    );

}
