import { EngineContext } from "@/lib/game/EngineContext";

import { PureUnit } from "@/lib/game/models/PureUnit";
import { CardInstance } from "@/lib/game/models";

import { isPure, isPseudoPure } from "@/lib/game/queries";

export function findPureUnits(
    context: EngineContext,
    cards: CardInstance[],
): PureUnit[] | null {

    switch (cards.length) {

        //
        // Two cards
        //

        case 2: {

            if (
                isPure(context, cards[0]) &&
                isPure(context, cards[1])
            ) {

                return [

                    {
                        cards: [cards[0]],
                    },

                    {
                        cards: [cards[1]],
                    },

                ];

            }

            return null;

        }

        //
        // Three cards
        //

        case 3: {

            for (let i = 0; i < 3; i++) {

                const single = cards[i];

                const pair =
                    cards.filter(
                        (_, index) =>
                            index !== i,
                    );

                if (
                    isPure(
                        context,
                        single,
                    ) &&
                    isPseudoPure(
                        context,
                        pair[0],
                        pair[1],
                    )
                ) {

                    return [

                        {
                            cards: [single],
                        },

                        {
                            cards: pair,
                        },

                    ];

                }

            }

            return null;

        }

        //
        // Four cards
        //

        case 4: {

            const pairings = [

                [
                    [0,1],
                    [2,3],
                ],

                [
                    [0,2],
                    [1,3],
                ],

                [
                    [0,3],
                    [1,2],
                ],

            ];

            for (const pairing of pairings) {

                const left = pairing[0].map(
                    i => cards[i],
                );

                const right = pairing[1].map(
                    i => cards[i],
                );

                if (

                    isPseudoPure(
                        context,
                        left[0],
                        left[1],
                    )

                    &&

                    isPseudoPure(
                        context,
                        right[0],
                        right[1],
                    )

                ) {

                    return [

                        {
                            cards: left,
                        },

                        {
                            cards: right,
                        },

                    ];

                }

            }

            return null;

        }

        default:

            return null;

    }

}