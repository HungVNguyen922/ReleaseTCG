import {

    Effect,
    EffectType,

    createDamageEffect,
    createDrawCardsEffect,
    createStackEffect,
    createBooleanChoiceEffect,
    createShufflePileEffect,

} from "@/lib/game/effects";

import {

    parseModifier,

} from "./parseModifier";

import {

    assertArray,
    assertNumber,
    assertObject,
    assertString,

} from "./";

export function parseEffect(
    value: unknown,
): Effect {

    assertObject(

        value,

        "Effect must be an object.",

    );

    assertString(

        value.type,

        "Effect type missing.",

    );

    const modifiers =

        Array.isArray(

            value.modifiers,

        )

            ? value.modifiers.map(

                parseModifier,

            )

            : [];

    switch (

        value.type

    ) {

        case EffectType.DrawCards:

        {

            assertNumber(

                value.amount,

                "DrawCards amount missing.",

            );

            return createDrawCardsEffect(

                value.amount,

                modifiers,

            );

        }

        case EffectType.Damage:

        {

            assertNumber(

                value.amount,

                "Damage amount missing.",

            );

            return createDamageEffect(

                value.amount,

                modifiers,

            );

        }

        case EffectType.Stack:
        {

            assertNumber(

                value.amount,

                "Stack amount missing.",

            );

            return createStackEffect(

                value.amount,

                modifiers,

            );

        }

        case EffectType.BooleanChoice:
        {

            assertString(
                value.text,
                "BooleanChoice text missing.",
            );

            return createBooleanChoiceEffect(
                value.text,
                modifiers,
            );

        }

        case EffectType.ShufflePile:

            return createShufflePileEffect(
                modifiers,
            );

        default:

            throw new Error(

                `Unknown effect "${value.type}".`,

            );

    }

}