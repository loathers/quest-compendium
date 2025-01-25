import { gitInfo, isDarkMode, print, visitUrl } from "kolmafia";

export const HIGHLIGHT = isDarkMode() ? "yellow" : "blue";

/**
 * Compares the local version of this script against the most recent release branch, printing results to the CLI
 */
export function checkGithubVersion(): void {
  if (process.env.GITHUB_REPOSITORY === "CustomBuild") {
    print("Skipping version check for custom build");
  } else if (process.env.GITHUB_REPOSITORY !== undefined) {
    const localSHA = gitInfo("loathers-quest-compedium-release").commit;

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
