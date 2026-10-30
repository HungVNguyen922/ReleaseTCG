import {
    EffectModifier,
} from "../modifiers/models/EffectModifier";

import {
    EffectType,
} from "./EffectType";

export interface BooleanChoiceEffect {

    type: EffectType.BooleanChoice;

    /**
     * Question shown to the player.
     */
    text: string;

    modifiers: EffectModifier[];

}
