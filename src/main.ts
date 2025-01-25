import { print } from "kolmafia";
import { sinceKolmafiaRevision } from "libram";

import { checkGithubVersion } from "./lib";

export default function main(): void {
  sinceKolmafiaRevision(28307);
  checkGithubVersion();

  print("You have successfully run queso!");
}
