import {
    GameState,
} from "../models";

import {
    CreateGameOptions,
} from "../models/GameOptions";


import {
    createSharedPiles, createPriorityState, createPlayerPiles, createPlayer, createBoard,
} from "./index";

import {
    createTurnState,
} from "../turn";

export function createGame(
    options: CreateGameOptions,
): GameState {

    //
    // Runtime players.
    //

    const firstPlayer = createPlayer(
        options.players[0],
    );

    const secondPlayer = createPlayer(
        options.players[1],
    );

    //
    // Player piles.
    //

    const firstPlayerPiles =
        createPlayerPiles(
            options.players[0],
        );

    const secondPlayerPiles =
        createPlayerPiles(
            options.players[1],
        );

    //
    // Shared piles.
    //

    const sharedPiles =
        createSharedPiles(

            firstPlayerPiles.remainingMainDeck,

            secondPlayerPiles.remainingMainDeck,

        );

    return {

        id: options.gameId,

        players: [

            firstPlayer,

            secondPlayer,

        ],

        board: createBoard(),

        piles: [

            ...firstPlayerPiles.piles,

            ...secondPlayerPiles.piles,

            ...sharedPiles,

        ],

        turn: createTurnState(
            options.firstPlayerId,
        ),

        priority: createPriorityState(
            options.firstPlayerId,
        ),

        parry: null,

        winnerId: null,

    };

}