import {
  changeMcd,
  currentMcd,
  itemAmount,
  myAdventures,
  myHp,
  myLevel,
  myMaxhp,
  myMaxmp,
  myMp,
  putCloset,
  restoreMp,
  runChoice,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $effects,
  $familiar,
  $item,
  $locations,
  $skill,
  AutumnAton,
  get,
  have,
  uneffect,
} from "libram";

import { QuesoQuest } from "../engine";

const poisons = $effects`Hardly Poisoned at All, A Little Bit Poisoned, Somewhat Poisoned, Really Quite Poisoned, Majorly Poisoned`;

export const SETUP_QUEST: QuesoQuest = {
  name: "Setup",
  description: "Inital setup",
  tasks: [
    {
      name: "Beaten Up",
      completed: () => !have($effect`Beaten Up`),
      do: () => {
        if (["Poetic Justice", "Lost and Found"].includes(get("lastEncounter"))) {
          uneffect($effect`Beaten Up`);
        }
        if (have($effect`Beaten Up`)) {
          throw "Got beaten up for no discernable reason!";
        }
      },
      sobriety: "either",
    },
    {
      name: "Disco Nap",
      ready: () => have($skill`Disco Nap`) && have($skill`Adventurer of Leisure`),
      completed: () => poisons.every((e) => !have(e)),
      do: () => useSkill($skill`Disco Nap`),
      sobriety: "either",
    },
    {
      name: "Antidote",
      completed: () => poisons.every((e) => !have(e)),
      do: () => poisons.forEach((e) => uneffect(e)),
      sobriety: "either",
    },
    {
      name: "Recover",
      ready: () => have($skill`Cannelloni Cocoon`),
      completed: () => myHp() / myMaxhp() >= 0.75,
      do: () => {
        useSkill($skill`Cannelloni Cocoon`);
      },
      sobriety: "either",
    },
    {
      name: "Recover Failed",
      completed: () => myHp() / myMaxhp() >= 0.5,
      do: () => {
        throw "Unable to heal above 50% HP, heal yourself!";
      },
      sobriety: "either",
    },
    {
      name: "Recover MP",
      completed: () => myMp() >= Math.min(250, myMaxmp()),
      do: () => restoreMp(300),
      sobriety: "sober",
    },
    {
      name: "Kgnee",
      completed: () =>
        !have($familiar`Reagnimated Gnome`) || have($item`gnomish housemaid's kgnee`),
      do: (): void => {
        visitUrl("arena.php");
        runChoice(4);
      },
      outfit: { familiar: $familiar`Reagnimated Gnome` },
      sobriety: "sober",
    },
    {
      name: "MCD",
      completed: () => !currentMcd(),
      do: () => changeMcd(0),
      sobriety: "either",
    },
    {
      name: "Closet Sand Dollars",
      completed: () => itemAmount($item`sand dollar`) === 0,
      do: () => putCloset(itemAmount($item`sand dollar`), $item`sand dollar`),
      sobriety: "either",
    },
    {
      name: "Closet Hobo Nickels",
      completed: () =>
        itemAmount($item`hobo nickel`) === 0 ||
        (!have($familiar`Hobo Monkey`) && !have($item`hobo nickel`, 1000)),
      do: () => putCloset(itemAmount($item`hobo nickel`), $item`hobo nickel`),
      sobriety: "either",
    },
    {
      name: "Autumn-Aton",
      completed: () => AutumnAton.currentlyIn() !== null,
      do: (): void => {
        AutumnAton.sendTo(
          $locations`The Toxic Teacups, The Oasis, The Deep Dark Jungle, The Bubblin' Caldera, The Neverending Party, The Sleazy Back Alley`,
        );
      },
      ready: () => AutumnAton.available() && AutumnAton.turnsForQuest() < myAdventures() + 10,
      sobriety: "either",
    },
    {
      name: "Futuristic Gear",
      completed: () => have($item`futuristic shirt`),
      ready: () => have($item`wardrobe-o-matic`) && myLevel() >= 20,
      do: () => use($item`wardrobe-o-matic`),
      sobriety: "either",
    },
  ],
};

export const Quests = [SETUP_QUEST];
