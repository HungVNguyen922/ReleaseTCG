import { EngineContext } from "@/lib/game/EngineContext";

import {
    BoardPosition,
    CardInstance,
    TurnPhase,
    GameState,
    LocationType,
    PileState,
    PileType,
    PlayerSide,
    PlayerState,
    PlayType,
    PriorityState,
    TurnState,
    CardDefinition,
} from "@/lib/game/models";

import {
    createTestCardDefinition,
    TestCardDefinitionOptions,
} from "./factories/createTestCardDefinition";

import {
    createTestCardInstance,
} from "./factories/createTestCardInstance";

import { GateReference, LocationReference } from "@/lib/game/refs";
import { PlayIntent } from "@/lib/game/intents/PlayIntent";
import { RuleResult } from "@/lib/game/rules";
import { compilePlayIntent, compileParry, compileDeclineParry, compilePass } from "@/lib/game/rules/play";

import { createEngineContext } from "@/lib/game";

import {
    processPendingResolution,
} from "@/lib/game/resolution";

import {
    processAction,
} from "@/lib/game/processors/processAction";

import { createEndTurnCommand } from "@/lib/game/commands";
import { createPublicPile } from "@/lib/game/utils";

import {
    clearEventListeners,
} from "@/lib/game/events/listeners/EventListenerRegistry";

import {
    registerDefaultEventListeners,
} from "@/lib/game/events/listeners/registerDefaultEventListeners";

import { processEngine } from "@/lib/game/processors/processEngine";

import type {
    DeckExport,
    DeckEntry,
} from "@/types/decks";

import {
    TEST_CARD_DEFINITIONS,
} from "../cards/testCardDefinitions";

type GameListener = () => void;

//
// structuredClone is not available in every test environment
// (e.g. jest-environment-jsdom), and game state is plain data.
//

function cloneState(state: GameState): GameState {
    return JSON.parse(JSON.stringify(state)) as GameState;
}

export class TestGame {

    private readonly listeners = new Set<GameListener>();

    public readonly context: EngineContext;

    public readonly state: GameState;

    public readonly player1: PlayerState;

    public readonly player2: PlayerState;

    public readonly debugId: string;

    constructor(
        options: {
            cardDefinitions?: Record<string, CardDefinition>;
            player1Deck?: DeckExport;
            player2Deck?: DeckExport;
        } = {},
    ) {
        
        this.debugId = Math.random().toString(36).slice(2, 8);

        clearEventListeners();
        registerDefaultEventListeners();

        this.player1 = {
            id: "P1",
            health: 10,
            passesRemaining: 1,
        };

        this.player2 = {
            id: "P2",
            health: 10,
            passesRemaining: 1,
        };

        this.state = {

            id: "TEST_GAME",

            players: [
                this.player1,
                this.player2,
            ],

            board: {

                gateZones: [

                    {
                        side: PlayerSide.Top,
                        position: 0,
                        stack: null,
                    },

                    {
                        side: PlayerSide.Top,
                        position: 1,
                        stack: null,
                    },

                    {
                        side: PlayerSide.Top,
                        position: 2,
                        stack: null,
                    },

                    {
                        side: PlayerSide.Bottom,
                        position: 0,
                        stack: null,
                    },

                    {
                        side: PlayerSide.Bottom,
                        position: 1,
                        stack: null,
                    },

                    {
                        side: PlayerSide.Bottom,
                        position: 2,
                        stack: null,
                    },

                ],

                setZones: [
                    {
                        side: PlayerSide.Top,
                        position: 0,
                        stack: null,
                    },
                    {
                        side: PlayerSide.Top,
                        position: 1,
                        stack: null,
                    },
                    {
                        side: PlayerSide.Top,
                        position: 2,
                        stack: null,
                    },
                    {
                        side: PlayerSide.Bottom,
                        position: 0,
                        stack: null,
                    },
                    {
                        side: PlayerSide.Bottom,
                        position: 1,
                        stack: null,
                    },
                    {
                        side: PlayerSide.Bottom,
                        position: 2,
                        stack: null,
                    },
                ],

            },

            piles: [

                this.createPile(
                    PileType.Hand,
                    "P1",
                ),

                this.createPile(
                    PileType.Hand,
                    "P2",
                ),

                this.createPile(
                    PileType.MainDeck,
                    "P1",
                ),

                this.createPile(
                    PileType.MainDeck,
                    "P2",
                ),

                this.createPile(
                    PileType.ExtraDeck,
                    "P1",
                ),

                this.createPile(
                    PileType.ExtraDeck,
                    "P2",
                ),

                this.createPile(
                    PileType.PublicPile,
                ),

                this.createPile(
                    PileType.Gap,
                ),

            ],

            turn: {

                turnNumber: 1,

                currentPlayerId: "P1",

                phase: TurnPhase.Action,

                setsPlayedThisTurn: 0,

                actionTaken: false,

                cardsPlayedThisTurn: 0,

            } satisfies TurnState,

            priority: {

                currentPlayerId: "P1",

            } satisfies PriorityState,

            parry: null, 

            winnerId: null,

        };

        this.context =
            createEngineContext(
                this.state,
                {},
            );

        if (options.cardDefinitions) {

            this.registerCardDefinitions(
                options.cardDefinitions,
            );

        } else {

            this.registerTestCardDefinitions();

        }

        if (options.player1Deck) {

            this.loadDeck(
                "P1",
                options.player1Deck,
            );

            this.setupStarterGate(
                "P1",
                PlayerSide.Bottom,
            );

            this.drawStartingHand("P1");

        }

        if (options.player2Deck) {

            this.loadDeck(
                "P2",
                options.player2Deck,
            );

            this.setupStarterGate(
                "P2",
                PlayerSide.Top,
            );

            this.drawStartingHand("P2");

        }

        this.populatePublicPile();
    }


    public subscribe(
        listener: GameListener,
    ): () => void {

        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };

    }

    private revision = 0;

    public getRevision(): number {
        return this.revision;
    }

    private notify(): void {

        this.revision++;

        for (const listener of this.listeners) {
            listener();
        }

    }

    private addCardToPile(
        pileType: PileType,
        options: TestCardDefinitionOptions & {

            playerId?: string;

        } = {},
    ): CardInstance {

        const playerId =
            options.playerId ?? "P1";

        const card =

            this.createCard(

                playerId,

                options,

            );

        this.getPile(

            pileType,

            playerId,

        ).cards.push(card);

        this.notify();

        return card;

    }
    
    public addHandCard(
        options: TestCardDefinitionOptions & {

            playerId?: string;

        } = {},
    ): CardInstance {
        return this.addCardToPile(PileType.Hand, options);
    }

    public addDeckCard(
        options: TestCardDefinitionOptions & {

            playerId?: string;

        } = {},
    ): CardInstance {
        return this.addCardToPile(PileType.MainDeck, options);
    }

    public addPublicPileCard(
        options: TestCardDefinitionOptions & {

            playerId?: string;

        } = {},
    ): CardInstance {

        const card = this.createCard(
            options.playerId ?? "P1",
            options,
        );

        this.getPile(PileType.PublicPile).cards.push(card);

        this.notify();

        return card;

    }

    public addGateCard(
        options: TestCardDefinitionOptions & {

            side: PlayerSide;

            position: BoardPosition;

            ownerId?: string;

        },
    ): CardInstance {

        const ownerId =
            options.ownerId ?? "P1";

        const card =

            this.createCard(

                ownerId,

                options,

            );

        let gate =

            this.state.board.gateZones.find(

                gate =>

                    gate.side === options.side &&

                    gate.position === options.position,

            );

        if (!gate) {

            gate = {

                side: options.side,

                position: options.position,

                stack: {

                    cards: [],

                },

            };

            this.state.board.gateZones.push(

                gate,

            );

        }

        gate.stack ??= {

            cards: [],

        };

        gate.stack = {
            ...gate.stack,
            cards: [card, ...gate.stack.cards],
        };

        this.notify();

        return card;

    }

    public addEmptyGate(
        side: PlayerSide,
        position: BoardPosition,
    ): void {

        const existing =
            this.state.board.gateZones.find(
                gate =>
                    gate.side === side &&
                    gate.position === position,
            );

        if (existing) {
            this.notify();

            return;
        }

        this.state.board.gateZones.push({

            side,

            position,

            stack: null,

        });

        this.notify();

    }

    private populatePublicPile(): void {

        const p1Remaining = this.getPile(PileType.MainDeck, "P1").cards.splice(0);
        const p2Remaining = this.getPile(PileType.MainDeck, "P2").cards.splice(0);

        const publicPile = this.getPile(PileType.PublicPile);

        publicPile.cards = createPublicPile(
            p1Remaining,
            p2Remaining,
        );

    }

    private runCompiled(
        result: RuleResult,
        fallbackMessage: string,
    ): void {

        if (!result.success) {
            throw new Error(result.errors.join("\n") || fallbackMessage);
        }

        const stateSnapshot = cloneState(this.state);
        const queueSnapshot = [...this.context.commandQueue];

        try {
            for (const action of result.actions) {
                processAction(this.context, action);
            }
            processEngine(this.context);
        } catch (err) {

            //
            // Restore in place so player1/player2 keep pointing at the
            // live player objects.
            //

            const restored = cloneState(stateSnapshot);

            const { players: restoredPlayers, ...rest } = restored;

            restoredPlayers.forEach((restoredPlayer, index) => {
                Object.assign(this.state.players[index], restoredPlayer);
            });

            Object.assign(this.state, rest);

            this.context.commandQueue = queueSnapshot;
            throw err;
        } finally {
            this.notify();
        }

    }

    public reference(
        card: CardInstance,
    ) {

        return {
            id: card.id,
        };

    }

    public gateReference(
        side: PlayerSide,
        position: BoardPosition,
    ): GateReference {

        return {
            locationType: LocationType.Gate,
            side,
            position,
        };

    }

    public setReference(
        side: PlayerSide,
        position: BoardPosition,
    ): LocationReference {

        return {
            locationType: LocationType.Set,
            side,
            position,
        };

    }

    public playIntent(
        playType: PlayType,
        cards: CardInstance[],
        destination: LocationReference | LocationReference[],
    ): PlayIntent {

        return {

            type: "play",

            player: {

                id: this.state.turn.currentPlayerId,

            },

            playType,

            cards: cards.map(
                card => this.reference(card),
            ),

            destinations: Array.isArray(destination)
                ? destination
                : [
                    destination,
                ],

        };

    }

    public compilePlay(
        intent: PlayIntent,
    ) {

        return compilePlayIntent(
            this.context,
            intent,
        );

    }

    public play(intent: PlayIntent): void {
        this.runCompiled(
            this.compilePlay(intent),
            "Play failed.",
        );
    }

    public parry(
        playerId: string,
        cardId: string,
    ): void {

        this.runCompiled(
            compileParry(
                this.context,
                {
                    player: { id: playerId },
                    card: { id: cardId },
                },
            ),
            "Parry failed.",
        );

    }

    public declineParry(
        playerId: string,
    ): void {

        this.runCompiled(
            compileDeclineParry(
                this.context,
                { id: playerId },
            ),
            "Could not stop parrying.",
        );

    }

    public cardDefinition(
        card: CardInstance,
    ) {

        return this.context.cardDatabase[
            card.cardId
        ];

    }

    public hand(
        playerId = "P1",
    ): CardInstance[] {

        return this.getPile(

            PileType.Hand,

            playerId,

        ).cards;

    }

    public deck(
        playerId = "P1",
    ): CardInstance[] {

        return this.getPile(

            PileType.MainDeck,

            playerId,

        ).cards;

    }

    public health(
        playerId = "P1",
    ): number {

        const player =

            this.state.players.find(

                player =>

                    player.id === playerId,

            );

        if (!player) {

            throw new Error(

                `Unknown player ${playerId}`,

            );

        }

        return player.health;

    }

    public player(
        id: string,
    ): PlayerState {

        const player =

            this.state.players.find(

                player =>

                    player.id === id,

            );

        if (!player) {

            throw new Error(
                "Player not found.",
            );

        }

        return player;

    }

    public resolveNextAbility(): void {

        const resolution =

            this.context.pendingResolutions.shift();

        if (!resolution) {

            throw new Error(
                "No pending resolutions.",
            );

        }

        processPendingResolution(

            this.context,

            resolution,

        );

        processEngine(

            this.context,

        );

        this.notify();

    }

    public get pendingResolutionCount(): number {

        return this.context.pendingResolutions.length;

    }

    public burn(
        card: CardInstance,
        side: PlayerSide,
        position: BoardPosition,
    ): void {

        this.play(

            this.playIntent(

                PlayType.Burn,

                [card],

                this.gateReference(

                    side,

                    position,

                ),

            ),

        );

    }

    public set(
        card: CardInstance,
        side: PlayerSide,
        position: BoardPosition,
    ): void {

        this.play(
            this.playIntent(
                PlayType.Set,
                [card],
                [
                    this.setReference(
                        side,
                        position,
                    ),
                ],
            ),
        );

    }

    public pass(
        playerId = this.state.turn.currentPlayerId,
    ): void {

        this.runCompiled(
            compilePass(
                this.context,
                { id: playerId },
            ),
            "Pass failed.",
        );

    }

    public endTurn(
        playerId = this.state.turn.currentPlayerId,
    ): void {

        this.context.commandQueue.push(
            createEndTurnCommand({ id: playerId }),
        );

        processEngine(
            this.context,
        );

        this.notify();

    }

    public card(
        cardId: string,
    ): CardInstance | null {

        for (const pile of this.state.piles) {

            const card =
                pile.cards.find(
                    card =>
                        card.id === cardId,
                );

            if (card) {
                return card;
            }

        }

        for (const gate of this.state.board.gateZones) {

            const card =
                gate.stack?.cards.find(
                    card =>
                        card.id === cardId,
                );

            if (card) {
                return card;
            }

        }

        for (const zone of this.state.board.setZones) {

            const card =
                zone.stack?.cards.find(
                    card =>
                        card.id === cardId,
                );

            if (card) {
                return card;
            }

        }

        return null;

    }

    public findHand(
        playerId: string,
    ): PileState {

        return this.getPile(

            PileType.Hand,

            playerId,

        );

    }

    public findDeck(
        playerId: string,
    ): PileState {

        return this.getPile(

            PileType.MainDeck,

            playerId,

        );

    }

    private createCard(
        ownerId: string,

        options: TestCardDefinitionOptions = {},

    ): CardInstance {

        const definition =

            createTestCardDefinition(

                options,

            );

        this.context.cardDatabase[
            definition.id
        ] = definition;

        return createTestCardInstance({

            cardId: definition.id,

            ownerId,

        });

    }

    private createPile(
        pileType: PileType,
        ownerId?: string,
    ): PileState {

        return {

            id:
                ownerId
                    ? `${pileType}_${ownerId}`
                    : pileType,

            pileType,

            cards: [],

            ownerId,

        };

    }

    private getPile(
        pileType: PileType,
        ownerId?: string,
    ): PileState {

        const pile =
            this.state.piles.find(
                p =>
                    p.pileType === pileType &&
                    p.ownerId === ownerId,
            );

        if (!pile) {

            throw new Error(
                `Missing pile ${pileType}`,
            );

        }

        return pile;

    }

    private registerCardDefinitions(
        definitions: Record<string, CardDefinition>,
    ): void {

        for (const id in definitions) {

            this.context.cardDatabase[id] =
                definitions[id];

        }

    }

    private registerTestCardDefinitions(): void {

        for (
            const definition
            of TEST_CARD_DEFINITIONS
        ) {

            this.context.cardDatabase[
                definition.id
            ] = definition;

        }

    }

    private loadDeck(
        playerId: string,
        deck: DeckExport,
    ): void {

        const mainDeck =
            this.getPile(
                PileType.MainDeck,
                playerId,
            );

        const extraDeck =
            this.getPile(
                PileType.ExtraDeck,
                playerId,
            );

        mainDeck.cards = this.createDeckInstances(
            deck.mainDeck,
            playerId,
        );

        extraDeck.cards = this.createDeckInstances(
            deck.extraDeck,
            playerId,
        );

    }

    private createDeckInstances(
        entries: DeckEntry[],
        playerId: string,
    ): CardInstance[] {

        const cards: CardInstance[] = [];

        for (
            const entry
            of entries
        ) {

            const definition =
                this.context.cardDatabase[
                    entry.cardId
                ];

            if (!definition) {

                throw new Error(
                    `Unknown test card: ${entry.cardId}`,
                );

            }

            for (
                let copy = 0;
                copy < entry.count;
                copy++
            ) {

                cards.push(

                    createTestCardInstance({

                        cardId:
                            definition.id,

                        ownerId:
                            playerId,

                    }),

                );

            }

        }

        return cards;

    }

    private setupStarterGate(
        playerId: string,
        side: PlayerSide,
    ): void {

        const deck =
            this.getPile(
                PileType.MainDeck,
                playerId,
            );

        if (deck.cards.length === 0) {
            return;
        }

        const randomIndex =
            Math.floor(
                Math.random() * deck.cards.length,
            );

        const [starter] =
            deck.cards.splice(
                randomIndex,
                1,
            );

        let gate =
            this.state.board.gateZones.find(
                gate =>
                    gate.side === side &&
                    gate.position === 1,
            );

        if (!gate) {

            gate = {
                side,
                position: 1,
                stack: { cards: [] },
            };

            this.state.board.gateZones.push(
                gate,
            );

        }

        gate.stack ??= { cards: [] };

        gate.stack.cards.unshift(starter);

    }

    private drawStartingHand(
        playerId: string,
    ): void {

        const deck =
            this.getPile(
                PileType.MainDeck,
                playerId,
            );

        const hand =
            this.getPile(
                PileType.Hand,
                playerId,
            );

        for (
            let i = 0;
            i < 4;
            i++
        ) {

            const card =
                deck.cards.shift();

            if (!card) {
                break;
            }

            hand.cards.push(card);

        }

    }
}