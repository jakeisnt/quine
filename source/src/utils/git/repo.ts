import { execSync } from "../cmd";
import { Path } from "../path";
import RepoFile from "./repofile";

/**
 * a git repository is a directory with a .git subdirectory
 * This is basically a git porcelain that keeps the current repo
 */
class Repo {
  // the full path to the repository
  // this is the directory that contains the .git subdirectory
  public path: Path;

  constructor(path: Path) {
    this.path = path;
  }

  static create(sourcePath: Path) {
    return new Repo(sourcePath);
  }

  /**
   * Get a reference to the git repo's file at the provided path.
   * @param atPath
   * @returns
   */
  getFile(atPath: Path) {
    if (!this.path.contains(atPath)) {
      throw new Error(`File ${atPath} is not in the repository`);
    }

    return RepoFile.create(this, atPath);
  }

  /**
   * Run a command from this git repository's root.
   */
  runCmd(command: string) {
    const cmdResult = execSync(command, { cwd: this.path.toString() });
    return cmdResult.toString();
  }

  checkout(branchName: string) {
    return this.runCmd(`git checkout ${branchName}`);
  }

  addAll() {
    console.log("adding all to git");
    this.runCmd("git add .");
  }

  commit(message = "robot commit") {
    console.log("committing", { message });
    this.runCmd(`git -c commit.gpgsign=false commit -m "${message}"`);
  }

  push() {
    this.runCmd("git push");
  }

  removeUntracked() {
    this.runCmd("git clean -fxd");
  }

  currentBranch() {
    const branch = this.runCmd("git branch --show-current");
    console.log("current branch", branch);
    return branch;
  }

  status() {
    const status = this.runCmd("git status");
    console.log(status);
  }

  stash() {
    this.runCmd("git stash");
  }

  stashPop() {
    this.runCmd("git stash pop");
  }
}

export default Repo;
