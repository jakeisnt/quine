// this file manages deployment to an external service
// right now its just github pages lol

import type { Repo } from "./utils/git";
import { Path } from "./utils/path";

function commitFolderToBranch({
  repo,
  folderToCommit,
  targetBranch,
}: {
  repo: Repo;
  folderToCommit: string;
  targetBranch: string;
}) {
  const tmpDir = "/tmp/jake-site-deploy";

  const currentBranch = repo.currentBranch();

  console.log("current branch", currentBranch);

  console.log("saving current changes");
  repo.addAll();
  repo.stash();

  console.log("copying deployment to tmp dir");

  // TODO: code should make sure 'production' branch is fetched.
  // it wasn't fetched! or the variable was not defined?
  // Add trailing slash to copy contents, not the directory itself
  repo.path.move(`${folderToCommit}/`, tmpDir, { force: true });
  repo.checkout(targetBranch);
  repo.status();

  console.log("removing all untracked files");
  repo.removeUntracked();
  repo.status();

  console.log("moving tmp dir contents to root");

  Path.create(tmpDir).move(
    `${tmpDir}/*`,
    `${Path.create(folderToCommit).parent.toString()}/`,
    { force: true }
  );
  repo.status();

  console.log("pushing build");
  console.log("we are on branch ", repo.currentBranch());
  repo.addAll();
  repo.status();
  repo.commit();
  repo.push();
  repo.status();

  console.log("restoring working branch");
  repo.checkout(currentBranch);
  repo.status();

  console.log("removing untracked");
  repo.removeUntracked();
  repo.status();

  console.log("removing deployment dir");
  // TODO: file.removeDir(folderToCommit, repo);
  console.log("moving tmp dir to deployment dir");
  // TODO: file.move(tmpDir, folderToCommit, repo);

  repo.stashPop();
}

async function deploy({
  currentRepo,
  deploymentBranch,
  targetDir,
}: {
  currentRepo: Repo;
  deploymentBranch: string;
  targetDir: string;
}) {
  commitFolderToBranch({
    repo: currentRepo,
    targetBranch: deploymentBranch,
    folderToCommit: targetDir,
  });
}

export { deploy };
