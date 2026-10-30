import {
    DrawCardsEffect,
} from "./DrawCardsEffect";

import {
    DamageEffect,
} from "./DamageEffect";

import {
    RevealCardsEffect,
} from "./RevealCardsEffect";

import {
    StackEffect,
} from "./StackEffect";

import {
    BooleanChoiceEffect,
} from "./BooleanChoiceEffect";

import {
    ShufflePileEffect,
} from "./ShufflePileEffect";

export type Effect =

    | DrawCardsEffect

    | DamageEffect

    | RevealCardsEffect

    | StackEffect
    | BooleanChoiceEffect
    | ShufflePileEffect;