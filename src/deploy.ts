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
  console.log(`[deploy] Current branch: ${currentBranch}`);

  // Verify the folder to commit exists
  const deployPath = Path.create(folderToCommit);
  if (!deployPath.exists()) {
    throw new Error(`Deployment folder ${folderToCommit} does not exist. Did you run build first?`);
  }

  console.log("[deploy] Saving current changes");
  try {
    repo.addAll();
    repo.stash();
  } catch (error) {
    console.error("[deploy] Failed to stash changes:", error);
    throw new Error(`Failed to stash changes: ${error}`);
  }

  console.log("[deploy] Copying deployment to tmp dir");
  try {
    // Clean up any existing tmp dir first using shell command
    const tmpPath = Path.create(tmpDir);
    if (tmpPath.exists()) {
      console.log(`[deploy] Cleaning up existing tmp dir at ${tmpDir}`);
      repo.runCmd(`rm -rf ${tmpDir}`);
    }

    repo.path.move(folderToCommit, tmpDir);
  } catch (error) {
    console.error("[deploy] Failed to move folder to tmp:", error);
    // Try to restore stash before throwing
    try {
      repo.stashPop();
    } catch (stashError) {
      console.error("[deploy] Failed to restore stash:", stashError);
    }
    throw new Error(`Failed to move deployment folder: ${error}`);
  }

  console.log(`[deploy] Fetching ${targetBranch} branch from remote`);
  try {
    repo.runCmd(`git fetch origin ${targetBranch}:${targetBranch}`);
  } catch (error) {
    console.warn(`[deploy] Could not fetch ${targetBranch}, it may not exist yet:`, error);
  }

  console.log(`[deploy] Checking out ${targetBranch}`);
  try {
    repo.checkout(targetBranch);
  } catch (error) {
    console.error(`[deploy] Failed to checkout ${targetBranch}:`, error);
    // Try to restore original state
    try {
      Path.create(tmpDir).move(tmpDir, folderToCommit);
      repo.stashPop();
    } catch (restoreError) {
      console.error("[deploy] Failed to restore original state:", restoreError);
    }
    throw new Error(`Failed to checkout ${targetBranch}: ${error}`);
  }
  repo.status();

  console.log("[deploy] Removing all untracked files");
  try {
    repo.removeUntracked();
    repo.status();
  } catch (error) {
    console.error("[deploy] Failed to remove untracked files:", error);
    throw error;
  }

  console.log("[deploy] Moving tmp dir contents to deployment location");
  try {
    Path.create(tmpDir).move(
      `${tmpDir}/*`,
      `${Path.create(folderToCommit).parent.toString()}/`
    );
    repo.status();
  } catch (error) {
    console.error("[deploy] Failed to move tmp dir to deployment location:", error);
    throw error;
  }

  console.log("[deploy] Committing and pushing build");
  console.log(`[deploy] Current branch: ${repo.currentBranch()}`);
  try {
    repo.addAll();
    repo.status();
    repo.commit(`Deploy build from ${currentBranch} at ${new Date().toISOString()}`);
    repo.push();
    repo.status();
    console.log("[deploy] Successfully pushed to remote!");
  } catch (error) {
    console.error("[deploy] Failed to commit and push:", error);
    throw error;
  }

  console.log("restoring working branch");
  repo.checkout(currentBranch);
  repo.status();

  console.log("removing untracked files from working branch");
  repo.removeUntracked();
  repo.status();

  console.log("restoring deployment directory");
  try {
    // Remove the deployment directory if it exists (it shouldn't after untracked removal)
    const deployPath = Path.create(folderToCommit);
    if (deployPath.exists()) {
      console.log(`Removing existing deployment dir at ${folderToCommit}`);
      repo.runCmd(`rm -rf ${folderToCommit}`);
    }

    // Move tmp dir back to deployment directory
    const tmpPath = Path.create(tmpDir);
    if (tmpPath.exists()) {
      console.log(`Moving ${tmpDir} back to ${folderToCommit}`);
      tmpPath.move(tmpDir, folderToCommit);
    } else {
      console.warn(`Temp directory ${tmpDir} does not exist, skipping restore`);
    }
  } catch (error) {
    console.error("Failed to restore deployment directory:", error);
    console.warn("Continuing with stash pop anyway...");
  }

  console.log("restoring stashed changes");
  try {
    repo.stashPop();
  } catch (error) {
    console.error("Failed to pop stash:", error);
    console.warn("You may need to manually run 'git stash pop'");
  }
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
  console.log(`[deploy] Starting deployment to ${deploymentBranch} branch`);
  console.log(`[deploy] Target directory: ${targetDir}`);

  try {
    commitFolderToBranch({
      repo: currentRepo,
      targetBranch: deploymentBranch,
      folderToCommit: targetDir,
    });
    console.log("[deploy] Deployment completed successfully!");
  } catch (error) {
    console.error("[deploy] Deployment failed:", error);
    console.error("[deploy] Your working directory may be in an inconsistent state.");
    console.error("[deploy] Please check git status and restore manually if needed.");
    throw error;
  }
}

export { deploy };
