import { TestGame } from "@/utils/test/builders/TestGame";
import { checkDeckout } from "@/lib/game/rules/wincons/checkDeckout";
import {
    BoardPosition,
    CardColor,
    PlayerSide,
    TurnPhase,
} from "@/lib/game/models";

function fillPublicPile(game: TestGame, count: number): void {
    for (let i = 0; i < count; i++) {
        game.addPublicPileCard({
            colors: [CardColor.Blue],
        });
    }
}

describe("Turn flow", () => {

    it("pass spends a pass, fills the hand, then hands the turn over", () => {

        const game = new TestGame();

        fillPublicPile(game, 6);

        game.pass();

        expect(game.player1.passesRemaining).toBe(0);

        // Drawn cards must land in hand before the turn ends.
        expect(game.hand("P1")).toHaveLength(4);

        expect(game.state.turn.currentPlayerId).toBe("P2");
        expect(game.state.turn.phase).toBe(TurnPhase.Action);

    });

    it("cannot pass on the opponent's turn", () => {

        const game = new TestGame();

        expect(() => game.pass("P2")).toThrow("not your turn");

        expect(game.player2.passesRemaining).toBe(1);
        expect(game.state.turn.currentPlayerId).toBe("P1");

    });

    it("loses the game when passing with no passes left", () => {

        const game = new TestGame();

        game.player1.passesRemaining = 0;

        game.pass();

        expect(game.state.winnerId).toBe("P2");

    });

});

describe("Deckout", () => {

    it("names the opponent of the player who ran out of cards as winner", () => {

        const game = new TestGame();

        game.addHandCard({
            playerId: "P2",
            colors: [CardColor.Red],
        });

        expect(checkDeckout(game.context)).toBe("P2");

    });

});

describe("Parry window", () => {

    it("opens after a Play and closes when the defender declines", () => {

        const game = new TestGame();

        const played = game.addHandCard({
            bulk: 1,
            colors: [CardColor.Red],
        });

        game.addHandCard({
            playerId: "P2",
            bulk: 1,
            colors: [CardColor.Blue],
        });

        game.addGateCard({
            side: PlayerSide.Bottom,
            position: BoardPosition.Center,
            colors: [CardColor.Red],
        });

        game.burn(played, PlayerSide.Bottom, BoardPosition.Center);

        expect(game.state.parry).not.toBeNull();
        expect(game.state.parry!.responderId).toBe("P2");

        game.declineParry("P2");

        expect(game.state.parry).toBeNull();

    });

});
