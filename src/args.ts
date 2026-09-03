import { Args } from "grimoire-kolmafia";

export const args = Args.create("queso", "A script for running various quests", {
  debug: Args.flag({
    help: "Turn on debug printing",
    default: false,
  }),
  quest: Args.string({
    help: "The quest to run",
  }),
});
