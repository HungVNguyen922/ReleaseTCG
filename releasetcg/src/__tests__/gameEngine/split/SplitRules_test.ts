import {
    BoardPosition,
    CardColor,
    PlayType,
    PlayerSide,
} from "@/lib/game/models";
import { compilePlayIntent } from "@/lib/game/rules/play/compilePlayIntent";

import {
    TestGame,
} from "@/utils/test/builders/TestGame";


describe("Split Rules", () => {


    it("accepts multiple identical pures", () => {


        const game = new TestGame();

        game.addEmptyGate(
            PlayerSide.Bottom,
            BoardPosition.Center,
        );

        game.addEmptyGate(
            PlayerSide.Top,
            BoardPosition.Center,
        );


        const red1 =
            game.addHandCard({

                colors: [
                    CardColor.Red,
                ],

            });


        const red2 =
            game.addHandCard({

                colors: [
                    CardColor.Red,
                ],

            });


        const result = compilePlayIntent(
            game.context,
            {
                type: "play",

                player: {
                    id: "P1",
                },

                playType: PlayType.Split,

                cards: [
                    game.reference(red1),
                    game.reference(red2),
                ],

                destinations: [
                    game.gateReference(
                        PlayerSide.Bottom,
                        BoardPosition.Center,
                    ),
                    game.gateReference(
                        PlayerSide.Top,
                        BoardPosition.Center,
                    ),
                ],
            },
        );

        expect(result.success).toBe(true);

    });


    it("accepts identical pseudopures", () => {


        const game = new TestGame();

        game.addEmptyGate(
            PlayerSide.Bottom,
            BoardPosition.Center,
        );

        game.addEmptyGate(
            PlayerSide.Top,
            BoardPosition.Center,
        );


        const gb1 =
            game.addHandCard({

                colors: [

                    CardColor.Green,

                    CardColor.Blue,

                ],

            });


        const gb2 =
            game.addHandCard({

                colors: [

                    CardColor.Green,

                    CardColor.Blue,

                ],

            });


        const result = compilePlayIntent(
            game.context,
            {
                type: "play",

                player: {
                    id: "P1",
                },

                playType: PlayType.Split,

                cards: [
                    game.reference(gb1),
                    game.reference(gb2),
                ],

                destinations: [
                    game.gateReference(
                        PlayerSide.Bottom,
                        BoardPosition.Center,
                    ),
                    game.gateReference(
                        PlayerSide.Top,
                        BoardPosition.Center,
                    ),
                ],
            },
        );

        expect(result.success).toBe(true);
    });


    it("rejects different pure units", () => {


        const game = new TestGame();

        game.addEmptyGate(
            PlayerSide.Bottom,
            BoardPosition.Center,
        );

        game.addEmptyGate(
            PlayerSide.Top,
            BoardPosition.Center,
        );


        const red =
            game.addHandCard({

                colors: [
                    CardColor.Red,
                ],

            });


        const blue =
            game.addHandCard({

                colors: [
                    CardColor.Blue,
                ],

            });


        const result = compilePlayIntent(
            game.context,
            {
                type: "play",

                player: {
                    id: "P1",
                },

                playType: PlayType.Split,

                cards: [
                    game.reference(red),
                    game.reference(blue),
                ],

                destinations: [
                    game.gateReference(
                        PlayerSide.Bottom,
                        BoardPosition.Center,
                    ),
                    game.gateReference(
                        PlayerSide.Top,
                        BoardPosition.Center,
                    ),
                ],
            },
        );

        expect(result.success).toBe(false);

    });


});