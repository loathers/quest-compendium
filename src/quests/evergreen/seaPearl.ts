import { CombatStrategy } from "grimoire-kolmafia";
import {
  inebrietyLimit,
  Location,
  mallPrice,
  myAdventures,
  myFamiliar,
  myHp,
  myInebriety,
  myMaxhp,
  myMp,
  myPrimestat,
  restoreHp,
  restoreMp,
  retrieveItem,
  Skill,
  use,
  useSkill,
} from "kolmafia";
import {
  $effect,
  $item,
  $location,
  $phylum,
  $skill,
  $stat,
  AsdonMartin,
  get,
  have,
  Macro,
  Snapper,
  tryFindFreeKill,
  uneffect,
} from "libram";

import { QuesoQuest } from "../../engine";

tryFindFreeKill({});

function canSeaPearl(): boolean {
  return (
    get("isMerkinGladiatorChampion") &&
    (mallPrice($item`unblemished pearl`) / 10 >= get("valueOfAdventure") ||
      myInebriety() > inebrietyLimit() + 1)
  );
}

function seaPearlPrepare(): void {
  const goodphylum = $phylum`fish`;
  if (Snapper.getTrackedPhylum() !== goodphylum) {
    Snapper.trackPhylum(goodphylum);
  }
  if (mallPrice($item`shadow brick`) < get("valueOfAdventure")) {
    retrieveItem($item`shadow brick`, 13);
  }
  if (!have($effect`Fishy`) && mallPrice($item`cuppa Gill tea`) < get("valueOfAdventure") * 30) {
    retrieveItem($item`cuppa Gill tea`);
    use($item`cuppa Gill tea`);
  }
  if (AsdonMartin.installed() && !have($effect`Driving Waterproofly`)) {
    AsdonMartin.drive(AsdonMartin.Driving.Waterproofly);
  }
  if (!have($effect`Feeling Peaceful`) && get("_feelPeacefulUsed") < 3) {
    useSkill($skill`Feel Peaceful`);
  }
  if (!have($effect`Astral Shell`)) {
    useSkill($skill`Astral Shell`);
  }
  if (!have($effect`Elemental Saucesphere`)) {
    useSkill($skill`Elemental Saucesphere`);
  }
  if (have($effect`The Colors...`)) {
    uneffect($effect`The Colors...`);
  }
  if (myHp() < 1000 && myMaxhp() > 1000) {
    restoreHp(1000);
  }
  if (myMp() < 50) {
    restoreMp(50);
  }
}

function combatSkill(): Skill {
  if (myPrimestat() === $stat`Muscle`) {
    return $skill`Lunging Thrust-Smack`;
  } else return $skill`Saucegeyser`;
}

function buildSeaPearlMacro(): Macro {
  const macro = Macro.if_(`monsterphylum plant`, Macro.trySkill($skill`Tear Away your Pants!`)).if_(
    `!monsterphylum ${$phylum`fish`}`,
    Macro.trySkill($skill`Sea *dent: Talk to Some Fish`),
  );

  return macro.trySkillRepeat(combatSkill()).repeat();
}

function getSeaPearlOutfit(elementModifier: string) {
  const needsScuba = !have($effect`Driving Waterproofly`);
  const isUnderwaterFam = myFamiliar().underwater;

  return {
    modifier: elementModifier,
    back: needsScuba ? $item`Elf Guard SCUBA tank` : undefined,
    offhand: myInebriety() > inebrietyLimit() ? $item`Drunkula's wineglass` : undefined,
    famequip: !isUnderwaterFam && needsScuba ? $item`das boot` : undefined,
  };
}

interface SeaPearlZone {
  name: string;
  prop: string;
  location: Location;
  modifier: string;
}

const SEA_PEARL_ZONES: SeaPearlZone[] = [
  {
    name: "Sea Pearl Mine",
    prop: "_unblemishedPearlAnemoneMine",
    location: $location`Anemone Mine`,
    modifier: "spooky res",
  },
  {
    name: "Sea Pearl Bar",
    prop: "_unblemishedPearlDiveBar",
    location: $location`The Dive Bar`,
    modifier: "sleaze res",
  },
  {
    name: "Sea Pearl Reef",
    prop: "_unblemishedPearlMadnessReef",
    location: $location`Madness Reef`,
    modifier: "stench res",
  },
  {
    name: "Sea Pearl Trench",
    prop: "_unblemishedPearlMarinaraTrench",
    location: $location`The Marinara Trench`,
    modifier: "hot res",
  },
  {
    name: "Sea Pearl Deepests",
    prop: "_unblemishedPearlTheBriniestDeepests",
    location: $location`The Briniest Deepests`,
    modifier: "cold res",
  },
];

function seaPearlCompleted(): boolean {
  return SEA_PEARL_ZONES.every((z) => get(z.prop, false));
}

const SEA_PEARL_QUESTS: QuesoQuest = {
  name: "Farm Sea Pearls",
  description: "Go to Sea Pearl Zones to farm Sea Pearls",
  completed: () => seaPearlCompleted(),
  tasks: [
    ...SEA_PEARL_ZONES.map((zone) => ({
      name: zone.name,
      ready: () =>
        canSeaPearl() &&
        !get(zone.prop) &&
        myAdventures() >= 10 - get(`${zone.prop}Progress`, 0) / 10,
      completed: () => get(zone.prop, false),
      prepare: () => seaPearlPrepare(),
      do: () => zone.location,
      outfit: () => getSeaPearlOutfit(zone.modifier),
      combat: new CombatStrategy().macro(buildSeaPearlMacro()),
      clear: "all" as const,
      tracking: "Sea Pearl",
      limit: { turns: 10 },
    })),
  ],
};

export const Quests: QuesoQuest[] = [SEA_PEARL_QUESTS];
