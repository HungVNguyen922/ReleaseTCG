import {
    ShufflePileEffect,
} from "../models/ShufflePileEffect";

import {
    EffectModifier,
} from "../modifiers/models/EffectModifier";

import {
    EffectType,
} from "../models/EffectType";

export function createShufflePileEffect(
    modifiers: EffectModifier[] = [],
): ShufflePileEffect {

    return {
        type: EffectType.ShufflePile,
        modifiers,
    };

}
