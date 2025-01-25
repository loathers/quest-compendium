import { Args } from "grimoire-kolmafia";

import { AllQuests } from "./quests";

export const args = Args.create("queso", "A script for running various quests", {
  debug: Args.flag({
    help: "Turn on debug printing",
    default: false,
  }),
  quest: Args.string({
    help: "The quest to run",
    options: AllQuests.map((quest) => [quest.name, quest.description]),
  }),
});
