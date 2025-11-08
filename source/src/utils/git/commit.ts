import type { Repo } from ".";
// import type { Path } from "../path";

/**
 * A single commit in a repository.
 * Ask me questions about the specific commit.
 */
class RepoCommit {
  // short hash to reference teh git commit
  public shortHash: string;
  // long hash to reference the git commit
  public longHash: string;
  // commit date from the git format: YYYY-MM-DD
  public commitDate: string;
  public timestamp: number;
  // 'backlink' ref to the repo that this commit is a part of
  public repo: Repo;

  constructor({
    shortHash,
    longHash,
    commitDate,
    timestamp,
    repo,
  }: {
    shortHash: string;
    longHash: string;
    commitDate: string;
    timestamp: number;
    repo: Repo;
  }) {
    this.shortHash = shortHash;
    this.longHash = longHash;
    this.commitDate = commitDate;
    this.timestamp = timestamp;
    this.repo = repo;
  }

  static create(args: {
    shortHash: string;
    longHash: string;
    commitDate: string;
    timestamp: number;
    repo: Repo;
  }) {
    return new RepoCommit(args);
  }

  get date() {
    return this.commitDate;
  }

  /**
   * Get the link associated with this repo commit at a given path.
   *
   * TODO: not quite finished yet.
   */
  // historyLink(filePath: Path) {
  //   if (!this.repo.remoteUrl) {
  //     throw new Error(
  //       "Cannot create history link without a defined remote URL"
  //     );
  //   }

  //   return `${this.repo.remoteUrl}/blob/${
  //     this.longHash
  //   }/${filePath.toString()}`;
  // }
}

export default RepoCommit;
