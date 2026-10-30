import { EngineContext } from "@/lib/game/EngineContext";

import { CardInstance } from "@/lib/game/models";

import { PureUnit } from "@/lib/game/models/PureUnit";

import {
    isPure,
    isPseudoPure,
} from "@/lib/game/queries";

export function findOpeningPure(
    context: EngineContext,
    gateCard: CardInstance | null,
    cards: CardInstance[],
): PureUnit | null {

    //
    // Gate already contains a pure.
    //

    if (
        gateCard &&
        isPure(
            context,
            gateCard,
        )
    ) {

        return {

            cards: [
                gateCard,
            ],

        };

    }

    //
    // Gate + one played card.
    //

    if (gateCard) {

        for (const card of cards) {

            if (

                isPseudoPure(
                    context,
                    gateCard,
                    card,
                )

            ) {

                return {

                    cards: [

                        gateCard,

                        card,

                    ],

                };

            }

        }

    }

    //
    // Single pure from hand.
    //

    for (const card of cards) {

        if (
            isPure(
                context,
                card,
            )
        ) {

            return {

                cards: [
                    card,
                ],

            };

        }

    }

    //
    // Pseudopure from hand.
    //

    for (let i = 0; i < cards.length; i++) {

        for (let j = i + 1; j < cards.length; j++) {

            if (

                isPseudoPure(
                    context,
                    cards[i],
                    cards[j],
                )

            ) {

                return {

                    cards: [

                        cards[i],

                        cards[j],

                    ],

                };

            }

        }

    }

    return null;

}