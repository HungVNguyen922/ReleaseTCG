import {
    EffectModifier,
} from "../modifiers/models/EffectModifier";

import {
    EffectType,
} from "./EffectType";

export interface ShufflePileEffect {

    type: EffectType.ShufflePile;

    modifiers: EffectModifier[];

}
