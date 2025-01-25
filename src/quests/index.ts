import { QuesoQuest } from "../engine.js";

import * as EmberCenser from "./2024/EmberCenser.js";
import * as Setup from "./Setup.js";

export * as Setup from "./Setup.js";
export * as EmberCenser from "./2024/EmberCenser.js";

export const AllQuests: QuesoQuest[] = [...Setup.Quests, ...EmberCenser.Quests];
