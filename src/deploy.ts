// this file manages deployment to an external service
// right now its just github pages lol

import type { Repo } from "./utils/git";

async function deploy({
  currentRepo,
  targetDir,
}: {
  currentRepo: Repo;
  targetDir: string;
}) {
  const currentBranch = currentRepo.currentBranch();

  console.log("deploying from branch", currentBranch);
  console.log("target directory", targetDir);

  console.log("adding all changes");
  currentRepo.addAll();
  currentRepo.status();

  console.log("committing build");
  currentRepo.commit();
  currentRepo.status();

  console.log("pushing to remote");
  currentRepo.push();
  currentRepo.status();

  console.log("deployment complete");
}

export { deploy };
