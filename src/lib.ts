import { makeValue, ValueFunctions } from "garbo-lib";
import {
  gitInfo,
  inebrietyLimit,
  isDarkMode,
  Item,
  myAdventures,
  myFamiliar,
  myInebriety,
  print,
  visitUrl,
} from "kolmafia";
import { $familiar, $item, PropertiesManager, SourceTerminal } from "libram";

import { args } from "./args";

export const propertyManager = new PropertiesManager();

export function shouldRedigitize(): boolean {
  const digitizesLeft = SourceTerminal.getDigitizeUsesRemaining();
  const monsterCount = SourceTerminal.getDigitizeMonsterCount() + 1;
  // triangular number * 10 - 3
  const digitizeAdventuresUsed = monsterCount * (monsterCount + 1) * 5 - 3;
  // Redigitize if fewer adventures than this digitize usage.
  return (
    SourceTerminal.have() &&
    SourceTerminal.canDigitize() &&
    myAdventures() / 0.96 < digitizesLeft * digitizeAdventuresUsed
  );
}

export const HIGHLIGHT = isDarkMode() ? "yellow" : "blue";
export function printh(message: string) {
  print(message, HIGHLIGHT);
}

export function printd(message: string) {
  if (args.debug) {
    print(message, HIGHLIGHT);
  }
}

/**
 * Compares the local version of this script against the most recent release branch, printing results to the CLI
 */
export function checkGithubVersion(): void {
  if (process.env.GITHUB_REPOSITORY === "CustomBuild") {
    print("Skipping version check for custom build");
  } else if (process.env.GITHUB_REPOSITORY !== undefined) {
    const localSHA = gitInfo("loathers-quest-compendium-release").commit;

    const gitData = visitUrl(
      `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/branches`,
    );
    if (!gitData) print("Failed to reach github!");
    else {
      // Query GitHub for latest release commit
      const gitBranches: { name: string; commit: { sha: string } }[] = JSON.parse(gitData);
      const releaseSHA = gitBranches.find((branchInfo) => branchInfo.name === "release")?.commit
        ?.sha;

      print(
        `Local Version: ${localSHA} (built from ${process.env.GITHUB_REF_NAME}@${process.env.GITHUB_SHA})`,
      );
      if (releaseSHA === localSHA) {
        print("Queso is up to date!", HIGHLIGHT);
      } else if (releaseSHA === undefined) {
        print(
          "Queso may be out of date, unable to query GitHub for latest version. Maybe run 'git update'?",
          HIGHLIGHT,
        );
      } else {
        print(`Release Version: ${releaseSHA}`);
        print("Queso is out of date. Please run 'git update'!", "red");
      }
    }
  } else {
    print("Queso was built from an unknown repository, unable to check for update.", HIGHLIGHT);
  }
}

export function sober() {
  return myInebriety() <= inebrietyLimit() + (myFamiliar() === $familiar`Stooper` ? -1 : 0);
}

let _valueFunctions: ValueFunctions;
// note: add spirits
const valueFunctions = () =>
  (_valueFunctions ??= makeValue({ itemValues: new Map([[$item`fake hand`, 50000]]) }));
export function garboValue(...items: Item[]): number {
  return valueFunctions().averageValue(...items);
}
