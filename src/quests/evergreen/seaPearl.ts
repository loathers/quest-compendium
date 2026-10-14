import {
  inebrietyLimit,
  Location,
  mallPrice,
  Modifier,
  myAdventures,
  myFamiliar,
  myHp,
  myInebriety,
  myMaxhp,
  myMp,
  restoreHp,
  restoreMp,
  retrieveItem,
  toEffect,
  use,
  useSkill,
} from "kolmafia";
import {
  $effect,
  $item,
  $location,
  $modifier,
  $phylum,
  $skills,
  AsdonMartin,
  get,
  have,
  Snapper,
  uneffect,
} from "libram";

import { QuesoQuest, QuesoStrategy } from "../../engine";
import Macro from "../../macro";

function canSeaPearl(): boolean {
  return get("isMerkinGladiatorChampion");
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

  $skills`Feel Peaceful, Astral Shell, Elemental Saucesphere`.forEach((e) => {
    if (have(e) && !have(toEffect(e))) {
      useSkill(e);
    }
  });

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
  modifier: Modifier;
}

const SEA_PEARL_ZONES: SeaPearlZone[] = [
  {
    name: "Mine",
    prop: "_unblemishedPearlAnemoneMine",
    location: $location`Anemone Mine`,
    modifier: $modifier`Spooky Res`,
  },
  {
    name: "Bar",
    prop: "_unblemishedPearlDiveBar",
    location: $location`The Dive Bar`,
    modifier: $modifier`Sleaze Res`,
  },
  {
    name: "Reef",
    prop: "_unblemishedPearlMadnessReef",
    location: $location`Madness Reef`,
    modifier: $modifier`Stench Res`,
  },
  {
    name: "Trench",
    prop: "_unblemishedPearlMarinaraTrench",
    location: $location`The Marinara Trench`,
    modifier: $modifier`Hot Res`,
  },
  {
    name: "Deepests",
    prop: "_unblemishedPearlTheBriniestDeepests",
    location: $location`The Briniest Deepests`,
    modifier: $modifier`Cold Res`,
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
      outfit: () => getSeaPearlOutfit(zone.modifier.name),
      combat: new QuesoStrategy(Macro.hardKill),
      limit: { turns: 10 },
    })),
  ],
};

export const Quests: QuesoQuest[] = [SEA_PEARL_QUESTS];
