import {
    BooleanChoiceEffect,
} from "../models/BooleanChoiceEffect";

import {
    EffectModifier,
} from "../modifiers/models/EffectModifier";

import {
    EffectType,
} from "../models/EffectType";

export function createBooleanChoiceEffect(
    text: string,
    modifiers: EffectModifier[] = [],
): BooleanChoiceEffect {

    return {
        type: EffectType.BooleanChoice,
        text,
        modifiers,
    };

}
