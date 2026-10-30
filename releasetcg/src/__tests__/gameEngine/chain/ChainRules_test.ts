import { compilePlayIntent } from "@/lib/game/rules/play";

import {
    BoardPosition,
    CardColor,
    PlayType,
    PlayerSide,
} from "@/lib/game/models";

import { TestGame } from "@/utils/test/builders/TestGame";

describe("Chain Rules", () => {

    it("accepts a chain beginning with a pure", () => {

        const game = new TestGame();

        game.addGateCard({
            side: PlayerSide.Bottom,
            position: BoardPosition.Center,
            colors: [CardColor.Red],
        });

        const blue = game.addHandCard({
            colors: [CardColor.Blue],
        });

        const blueGreen = game.addHandCard({
            colors: [CardColor.Blue, CardColor.Green],
        });

        const intent = game.playIntent(
            PlayType.Chain,
            [
                blue,
                blueGreen,
            ],
            game.gateReference(
                PlayerSide.Bottom,
                BoardPosition.Center,
            ),
        );

        const result = game.compilePlay(intent);

        expect(
            result.actions,
        ).toHaveLength(1);

    });

    it("rejects chains without an opening pure", () => {

        const game = new TestGame();

        game.addGateCard({
            side: PlayerSide.Bottom,
            position: BoardPosition.Center,
            colors: [
                CardColor.Red,
            ],
        });

        const redBlue =
            game.addHandCard({

                colors: [

                    CardColor.Red,

                    CardColor.Blue,

                ],

            });

        const greenYellow =
            game.addHandCard({

                colors: [

                    CardColor.Green,

                    CardColor.Yellow,

                ],

            });

        const intent = game.playIntent(
            PlayType.Chain,
            [
                redBlue,
                greenYellow,
            ],

            game.gateReference(
                PlayerSide.Bottom,
                BoardPosition.Center,
            ),
        );

        const result = game.compilePlay(intent);

        expect(result.success).toBe(false);

    });

    it("rejects broken color chains", () => {

        const game = new TestGame();

        game.addEmptyGate(
            PlayerSide.Bottom,
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

        const yellowOrange =
            game.addHandCard({

                colors: [

                    CardColor.Yellow,
                    CardColor.Orange,

                ],

            });

        const intent = game.playIntent(
            PlayType.Chain,
            [
                red,
                blue,
                yellowOrange,
            ],

            game.gateReference(
                PlayerSide.Bottom,
                BoardPosition.Center,
            ),
        );

        const result = game.compilePlay(intent);

        expect(result.success).toBe(false);

    });

});