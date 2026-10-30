import { BeginAttackCommand } from "./BeginAttackCommand";
import { BeginPhaseCommand } from "./BeginPhaseCommand";
import { CreateGateCommand } from "./CreateGateCommand";
import { DamagePlayerCommand } from "./DamagePlayerCommand";
import { DrawCardsCommand } from "./DrawCardsCommand";
import { EndPriorityCommand } from "./EndPriorityCommand";
import { EndTurnCommand } from "./EndTurnCommand";
import { HealPlayerCommand } from "./HealPlayerCommand";
import { MoveCardCommand } from "./MoveCardCommand";
import { MoveGateCommand } from "./MoveGateCommand";
import { ResolveAttackCommand } from "./ResolveAttackCommand";
import { RevealCardsCommand } from "./RevealCardsCommand";
import { StartPriorityCommand } from "./StartPriorityCommand";
import { PassCommand } from "./PassCommand";
import { EnforceMaxHandCommand } from "./EnforceMaxHandCommand";
import { OpenParryWindowCommand } from "./OpenParryWindowCommand";
import { PlayParryCommand } from "./PlayParryCommand";
import { ResolveParryChainCommand } from "./ResolveParryChainCommand";

export type GameCommand =
    | MoveCardCommand
    | MoveGateCommand
    | PassCommand
    | CreateGateCommand
    | DamagePlayerCommand
    | HealPlayerCommand
    | DrawCardsCommand
    | RevealCardsCommand
    | BeginAttackCommand
    | ResolveAttackCommand
    | StartPriorityCommand
    | EndPriorityCommand
    | BeginPhaseCommand
    | EndTurnCommand
    | EnforceMaxHandCommand
    | OpenParryWindowCommand
    | PlayParryCommand
    | ResolveParryChainCommand;