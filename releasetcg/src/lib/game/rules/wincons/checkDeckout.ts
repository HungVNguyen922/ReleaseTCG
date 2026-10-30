import { EngineContext } from "@/lib/game/EngineContext";
import { PileType, PlayerSide } from "@/lib/game/models";

function sideForPlayer(context: EngineContext, playerId: string): PlayerSide {
    const index = context.state.players.findIndex(p => p.id === playerId);
    return index === 0 ? PlayerSide.Bottom : PlayerSide.Top;
}

export function checkDeckout(context: EngineContext): string | null {

    const publicPile = context.state.piles.find(
        p => p.pileType === PileType.PublicPile,
    );

    if (!publicPile || publicPile.cards.length > 0) {
        return null;
    }

    for (const player of context.state.players) {

        const hand = context.state.piles.find(
            p => p.pileType === PileType.Hand && p.ownerId === player.id,
        );

        if ((hand?.cards.length ?? 0) > 0) {
            continue;
        }

        const side = sideForPlayer(context, player.id);

        const hasSetCards = context.state.board.setZones
            .filter(zone => zone.side === side)
            .some(zone => zone.stack && zone.stack.cards.length > 0);

        if (!hasSetCards) {
            //
            // This player is out of cards: the opponent wins.
            //
            const opponent = context.state.players.find(
                p => p.id !== player.id,
            );

            return opponent?.id ?? null;
        }

    }

    return null;

}