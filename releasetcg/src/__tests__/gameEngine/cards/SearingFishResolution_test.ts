import { TestGame } from "@/utils/test/builders/TestGame";

import {
    BoardPosition,
    CardColor,
    PlayerSide,
    PlayType,
} from "@/lib/game/models";

import {
    createPlayAbility,
} from "@/lib/game/abilities/factories";

import {
    createDrawCardsEffect,
    createDamageEffect,
} from "@/lib/game/effects";

describe(

    "Searing Fish resolution",

    () => {

        it(

            "draws one and damages opponent",

            () => {

                const game =
                    new TestGame();

                //
                // Searing Fish
                //

                const fish =
                    game.addHandCard({

                        colors: [

                            CardColor.Red,

                        ],

                        abilities: [

                            createPlayAbility(

                                createDrawCardsEffect(
                                    1,
                                ),

                                createDamageEffect(
                                    1,
                                ),

                            ),

                        ],

                    });

                //
                // Card to draw
                //

                game.addPublicPileCard({

                    colors: [

                        CardColor.Blue,

                    ],

                });

                //
                // Compatible gate
                //

                game.addGateCard({

                    side:
                        PlayerSide.Bottom,

                    position:
                        BoardPosition.Center,

                    colors: [

                        CardColor.Red,

                    ],

                });

                game.play(

                    game.playIntent(

                        PlayType.Burn,

                        [

                            fish,

                        ],

                        game.gateReference(

                            PlayerSide.Bottom,

                            BoardPosition.Center,

                        ),

                    ),

                );

                //
                // The Play ability resolves as part of the engine run.
                //

                expect(

                    game.pendingResolutionCount,

                ).toBe(0);

                expect(

                    game.player2.health,

                ).toBe(9);

                expect(

                    game.hand(
                        "P1",
                    ),

                ).toHaveLength(1);

                expect(

                    game.deck(
                        "P1",
                    ),

                ).toHaveLength(0);

            },

        );

    },

);