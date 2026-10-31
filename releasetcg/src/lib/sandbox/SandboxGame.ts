import {
    adjustHealth,
    describeMove,
    drawCards,
    endTurn,
    flipCards,
    moveCards,
    shuffleZone,
    withLog,
    type MoveOptions,
    type Rng,
} from "./actions";

import { describeZone } from "./zones";

import type { SandboxState, SeatId, ZoneKey } from "./types";

const MAX_HISTORY = 200;

type Listener = () => void;

/**
 * Holds the current sandbox state plus undo/redo history.
 *
 * State objects are immutable, so `getState()` is a stable snapshot
 * (safe for React's useSyncExternalStore).
 */
export class SandboxGame {

    private state: SandboxState;

    private past: SandboxState[] = [];

    private future: SandboxState[] = [];

    private readonly listeners = new Set<Listener>();

    private readonly rng: Rng;

    constructor(initial: SandboxState, rng: Rng = Math.random) {
        this.state = initial;
        this.rng = rng;
    }

    public getState = (): SandboxState => this.state;

    public subscribe = (listener: Listener): (() => void) => {

        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };

    };

    public get canUndo(): boolean {
        return this.past.length > 0;
    }

    public get canRedo(): boolean {
        return this.future.length > 0;
    }

    private commit(next: SandboxState): void {

        if (next === this.state) {
            return;
        }

        this.past.push(this.state);

        if (this.past.length > MAX_HISTORY) {
            this.past.shift();
        }

        this.future = [];

        this.state = next;

        this.notify();

    }

    private notify(): void {

        for (const listener of this.listeners) {
            listener();
        }

    }

    public undo(): void {

        const previous = this.past.pop();

        if (!previous) {
            return;
        }

        this.future.push(this.state);

        this.state = previous;

        this.notify();

    }

    public redo(): void {

        const next = this.future.pop();

        if (!next) {
            return;
        }

        this.past.push(this.state);

        this.state = next;

        this.notify();

    }

    public move(
        cardIds: string[],
        to: ZoneKey,
        options: MoveOptions = {},
    ): void {

        const moved = moveCards(this.state, cardIds, to, options);

        if (moved === this.state) {
            return;
        }

        this.commit(
            withLog(moved, describeMove(this.state, cardIds, to)),
        );

    }

    public draw(
        seat: SeatId,
        count: number,
        from: ZoneKey = "public",
    ): void {

        const available = Math.min(count, this.state.zones[from].length);

        if (available === 0) {
            return;
        }

        this.commit(
            withLog(
                drawCards(this.state, seat, available, from),
                `${seat} drew ${available} from ${describeZone(from)}`,
            ),
        );

    }

    public shuffle(zone: ZoneKey): void {

        const shuffled = shuffleZone(this.state, zone, this.rng);

        if (shuffled === this.state) {
            return;
        }

        this.commit(
            withLog(shuffled, `Shuffled ${describeZone(zone)}`),
        );

    }

    public flip(cardIds: string[]): void {

        const flipped = flipCards(this.state, cardIds);

        if (flipped === this.state) {
            return;
        }

        this.commit(
            withLog(
                flipped,
                cardIds.length > 1
                    ? `Flipped ${cardIds.length} cards`
                    : "Flipped a card",
            ),
        );

    }

    public changeHealth(seat: SeatId, delta: number): void {

        const next = adjustHealth(this.state, seat, delta);

        if (next === this.state) {
            return;
        }

        this.commit(
            withLog(
                next,
                `${seat} ${delta < 0 ? "took" : "healed"} ${Math.abs(delta)} (now ${next.health[seat]})`,
            ),
        );

    }

    public nextTurn(): void {

        const next = endTurn(this.state);

        this.commit(
            withLog(next, `Turn ${next.turn}: ${next.activeSeat}`),
        );

    }

}
