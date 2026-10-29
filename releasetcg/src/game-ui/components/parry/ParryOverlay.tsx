"use client";

import { useGame } from "../../providers/GameProvider";
import { useGameRevision } from "../../hooks/useGameRevision";

import { PARRY_STYLES, ParryRole } from "./ParryStyles";

interface WindowProps {
    playerId: string;
    role: ParryRole;
    active: boolean;
    children?: React.ReactNode;
}

// One window per player. The player who has to respond is lit up.
function ParryWindow({ playerId, role, active, children }: WindowProps) {

    const style = PARRY_STYLES[role];

    return (
        <section
            aria-current={active ? "step" : undefined}
            className={`pointer-events-auto rounded-lg border bg-card p-3 shadow-md transition ${
                active ? `ring-2 ${style.ring}` : "opacity-60"
            }`}
        >
            <header className="flex items-center justify-between text-sm font-semibold">
                <span>{playerId}</span>

                <span className={`flex items-center gap-1.5 text-xs font-medium ${style.text}`}>
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    {role === "attacker" ? "Attacker" : "Defender"}
                </span>
            </header>

            <p className="mt-1 text-xs text-muted-foreground">
                {active ? "Responding now" : "Waiting"}
            </p>

            {children}
        </section>
    );

}

export default function ParryOverlay() {

    const {
        engine,
        parry,
        parryOptionIds,
        selectedCardIds,
        activePlayerId,
        playError,
        confirmParry,
        declineParry,
    } = useGame();

    useGameRevision();

    if (!parry) {
        return null;
    }

    function cardName(cardId: string): string {
        const card = engine.card(cardId);
        const definition = card ? engine.cardDefinition(card) : null;
        return definition?.name ?? "Unknown card";
    }

    function roleOf(playerId: string): ParryRole {
        return playerId === parry!.attackerId ? "attacker" : "defender";
    }

    const chainLength = parry.chain.length;

    const canParry =
        selectedCardIds.length === 1 &&
        parryOptionIds.includes(selectedCardIds[0]) &&
        activePlayerId === parry.responderId;

    // Odd chain = defender parried last, so the responder is the attacker
    // and stopping now means their Play is stopped.
    const stoppingStopsPlay = chainLength % 2 === 1;

    // Board layout: the second player sits at the top, the first at the bottom.
    const [topPlayer, bottomPlayer] = [...engine.state.players].reverse();

    const playNames = parry.playCardIds.map(cardName).join(", ");

    function renderWindow(playerId: string) {

        const active = parry!.responderId === playerId;

        return (
            <ParryWindow
                playerId={playerId}
                role={roleOf(playerId)}
                active={active}
            >
                {active && (
                    <div className="mt-2 flex flex-col gap-2">

                        <p className="text-xs">
                            Play a card with Bulk {parry!.requiredBulk} from your hand
                            {" "}({parryOptionIds.length} available).
                        </p>

                        {playError && (
                            <p className="text-xs font-medium text-destructive">
                                {playError}
                            </p>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={confirmParry}
                                disabled={!canParry}
                                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
                            >
                                Parry
                            </button>

                            <button
                                onClick={declineParry}
                                className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                            >
                                {chainLength === 0 ? "Let it through" : "Stop parrying"}
                            </button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            {stoppingStopsPlay
                                ? "If you stop now, the play is stopped."
                                : "If you stop now, the play goes through."}
                        </p>

                    </div>
                )}
            </ParryWindow>
        );

    }

    return (
        <>
            {/* Chain badge, centered between the two gate rows */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2">
                <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-semibold shadow-md">

                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 motion-safe:animate-ping" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                    </span>

                    Parry chain
                    <span className="font-normal text-muted-foreground">
                        {chainLength === 0
                            ? "awaiting response"
                            : `${chainLength} ${chainLength === 1 ? "parry" : "parries"}`}
                    </span>

                </div>
            </div>

            {/* Windows + chain, mirroring the board: second player on top */}
            <div className="pointer-events-none absolute right-[2%] top-1/5 z-40 flex w-64 -translate-y-1/2 flex-col gap-2">

                <div className="sr-only" aria-live="polite">
                    {parry.responderId} is responding to the play.
                </div>

                {renderWindow(topPlayer.id)}

                <ol
                    aria-label="Parry chain"
                    className="pointer-events-auto flex flex-col gap-1 rounded-lg border bg-card p-3 text-xs shadow-md"
                >
                    <li className="flex items-center gap-2 rounded border border-amber-500/60 bg-amber-500/10 px-2 py-1">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                        <span className="min-w-0 flex-1 truncate">
                            Pending play: {playNames}
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                            Bulk {parry.requiredBulk}
                        </span>
                    </li>

                    {parry.chain.map(entry => {

                        const role = roleOf(entry.playerId);

                        return (
                            <li
                                key={entry.cardId}
                                className="flex items-center gap-2 rounded border px-2 py-1"
                            >
                                <span className={`h-2 w-2 shrink-0 rounded-full ${PARRY_STYLES[role].dot}`} />
                                <span className="min-w-0 flex-1 truncate">
                                    {entry.playerId} parried with {cardName(entry.cardId)}
                                </span>
                            </li>
                        );

                    })}
                </ol>

                {renderWindow(bottomPlayer.id)}

            </div>
        </>
    );

}