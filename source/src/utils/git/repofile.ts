import type { Repo } from ".";
import type { Path } from "../path";
import RepoCommit from "./commit";
import logger from "utils/log";

const ignoredDirectories = new Set([".git", ".direnv", "node_modules"]);

/**
 * A file we know to be in a git repository.
 */
class RepoFile {
  // the path to the file
  path: Path;
  // the repo this file is in
  private repo: Repo;

  constructor(repo: Repo, path: Path) {
    this.repo = repo;
    this.path = path;
  }

  static create(repo: Repo, path: Path) {
    const file = new RepoFile(repo, path);
    return file;
  }

  /**
   * Get the link to this file in git history at a particular commit
   * @param longHash the specific hash to link to
   */
  // historyLink(longHash: string) {
  //   return this.repo.historyLink(longHash, this.path);
  // }

  /**
   * Is the file ignored by the repo?
   * SHORTCUT: This obviously is not well thought out.
   */
  isIgnored() {
    return this.path.pathArray.some((pathval) =>
      ignoredDirectories.has(pathval)
    );
  }

  // get the last commit that cared about this file
  get lastLog() {
    // don't bother if the file is ignored
    if (this.isIgnored()) {
      return null;
    }

    const command = `git log -1 --full-history --pretty="format:%h %H %ad %ct" --date default --date=format:'%Y-%m-%d' ${this.path.toString()}`;
    try {
      const stdout = this.repo.runCmd(command);
      if (stdout) {
        const [line] = stdout.split("\n");
        const [shortHash, longHash, commitDate, timestamp] = line.split(" ");
        return RepoCommit.create({
          shortHash,
          longHash,
          commitDate,
          timestamp: parseInt(timestamp, 10),
          repo: this.repo,
        });
      } else {
        logger.git(
          `git log command failed on path ${this.path.toString()}. It's likely that no commit history was found for the path.`
        );
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get the full git log of changes to this file
   */
  get log() {
    if (this.isIgnored()) {
      return [];
    }

    const command = `git log --all --full-history --pretty="format:%h %H %ad" --date default --date=format:'%Y-%m-%d' ${this.path.toString()}`;
    try {
      const stdout = this.repo.runCmd(command);
      if (stdout) {
        return stdout.split("\n").map((line: string) => {
          const [shortHash, longHash, commitDate] = line.split(" ");
          return RepoCommit.create({
            shortHash,
            longHash,
            commitDate,
            timestamp: 0,
            repo: this.repo,
          });
        });
      } else {
        logger.git(
          `git log command failed on path ${this.path.toString()}. It's likely that no commit history was found for the path.`
        );
        return [];
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get the last timestamp of this file.
   */
  get lastTimestamp() {
    const command = `git log -1 --pretty=format:%ct --follow -- ${this.path.toString()}`;
    try {
      const stdout = this.repo.runCmd(command);
      return parseInt(stdout, 10);
    } catch (error) {
      throw error;
    }
  }
}

export default RepoFile;
