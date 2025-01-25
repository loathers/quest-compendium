import { Args, getTasks } from "grimoire-kolmafia";
import { abort, canInteract, print } from "kolmafia";
import { get, sinceKolmafiaRevision } from "libram";

import { args } from "./args";
import { QuesoEngine } from "./engine";
import { checkGithubVersion, propertyManager } from "./lib";
import { AllQuests, Setup } from "./quests";

export default function main(argsString = ""): void {
  sinceKolmafiaRevision(28307);
  checkGithubVersion();
  if (!canInteract()) abort("queso requires being able to interact");

  Args.fill(args, argsString);
  if (args.help || args.quest === undefined) {
    Args.showHelp(args);
    return;
  }

  const quest = AllQuests.find((quest) => quest.name === args.quest);
  if (quest === undefined) abort(`Failed to find quest '${args.quest}'`);

  print(`Running quest ${quest.name} - ${quest.description}`);

  const engine = new QuesoEngine(getTasks([...Setup.Quests, quest]));
  engine.print();

  try {
    propertyManager.set({
      logPreferenceChange: false,
      logPreferenceChangeFilter: [
        ...new Set([
          ...get("logPreferenceChangeFilter").split(","),
          "libram_savedMacro",
          "maximizerMRUList",
          "testudinalTeachings",
          "spadingData",
        ]),
      ]
        .sort()
        .filter((a) => a)
        .join(","),
      battleAction: "custom combat script",
      autoSatisfyWithMall: true,
      autoSatisfyWithNPCs: true,
      autoSatisfyWithCoinmasters: true,
      autoSatisfyWithStash: false,
      dontStopForCounters: true,
      maximizerFoldables: true,
      afterAdventureScript: "",
      betweenBattleScript: "",
      choiceAdventureScript: "",
      counterScript: "",
      familiarScript: "",
      currentMood: "apathetic",
      spadingScript: "excavator.js",
    });

    engine.run();
  } finally {
    engine.destruct();
    propertyManager.resetAll();
  }

  print("You have successfully run queso!");
}
