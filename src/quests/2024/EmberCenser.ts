import {
  creatableAmount,
  create,
  myAdventures,
  myMaxhp,
  myMaxmp,
  restoreHp,
  restoreMp,
  use,
} from "kolmafia";
import { $element, $familiar, $item, $skill, get, have, tryFindFreeKill } from "libram";

import { QuesoQuest, QuesoStrategy } from "../../engine";
import Macro from "../../macro";

tryFindFreeKill({});

export const EMBERIZA_AUREOLA_QUEST: QuesoQuest = {
  name: "Emberiza Aureola",
  description: "Fight Embering Hulks to acquire a familiar",
  completed: () => have($familiar`Emberiza Aureola`),
  tasks: [
    {
      name: "Fight Embering Hulk",
      ready: () => myAdventures() > 0,
      completed: () =>
        get("_emberingHulkFought") ||
        creatableAmount($item`ember egg`) > 0 ||
        have($item`ember egg`) ||
        have($familiar`Emberiza Aureola`),
      do: () => use($item`miniature Embering Hulk`),
      acquire: [{ item: $item`miniature Embering Hulk` }],
      prepare: () => restoreHp(myMaxhp()) && restoreMp(Math.min(300, myMaxmp() - 1)),
      outfit: () => ({
        modifier: `Spell Damage Percent, Myst, 0.1 Hot Resistance`,
      }),
      // TODO: do free kills work?
      combat: new QuesoStrategy(() =>
        Macro.tryHaveSkill($skill`Implode Universe`).elementalCombat($element`Hot`),
      ),
      sobriety: "either",
    },
    {
      name: "Acquire ember egg",
      ready: () => creatableAmount($item`ember egg`) > 0,
      completed: () => have($item`ember egg`) || have($familiar`Emberiza Aureola`),
      do: () => create($item`ember egg`),
      sobriety: "either",
    },
    {
      name: "Use ember egg",
      ready: () => have($item`ember egg`),
      completed: () => have($familiar`Emberiza Aureola`),
      do: () => use($item`ember egg`),
      sobriety: "either",
    },
  ],
};

export const Quests: QuesoQuest[] = [EMBERIZA_AUREOLA_QUEST];
