import pathLibrary from "path";
import { execSync } from "./cmd";
import fs from "fs";
import mime from "mime";
import { Repo } from "./git";

/**
 * If a path string has a postfixed slash, remove it.
 */
const removePostfixedSlash = (pathString: string) => {
  if (pathString[pathString.length - 1] === "/") {
    return pathString.slice(0, pathString.length - 1);
  }

  return pathString;
};

/**
 * A Path is the path to a file or directory on a system.
 */
class Path {
  // These params are immutable, so it's safe to store both
  // and access them directly.
  public pathArray: string[] = [];
  public relativePathArray: string[] = [];

  public relativePathString: String = "";
  private pathString: string = "";

  private doesFileExist?: boolean = undefined;
  private lstats?: fs.Stats = undefined;

  /**
   * Construct a Path.
   * Do not call this directly.
   *
   * Works for both relative and absolute paths, fixing them into absolute paths as needed.
   * this should only be called by the static methods.
   */
  constructor(pathString: string) {
    let normalizedPath = pathLibrary.normalize(pathString);

    let absolutePath = normalizedPath;
    if (!pathLibrary.isAbsolute(normalizedPath)) {
      absolutePath = pathLibrary.resolve(process.cwd(), normalizedPath);
    }

    normalizedPath = removePostfixedSlash(normalizedPath);
    absolutePath = removePostfixedSlash(absolutePath);

    this.relativePathString = normalizedPath;
    this.relativePathArray = normalizedPath
      .split("/")
      .slice(1)
      .filter((p) => p.length);

    this.pathString = absolutePath;
    this.pathArray = absolutePath
      .split("/")
      .slice(1)
      .filter((p) => p.length);
  }

  /**
   * Create a path. Call this to make a path.
   * @param maybePathString either an existing Path or a string.
   */
  static create(maybePathString: Path | string) {
    if (typeof maybePathString === "string") {
      return new Path(maybePathString);
    } else if (maybePathString instanceof Path) {
      return maybePathString;
    }

    throw new Error(
      `Path provided must be a string or Path, given ${maybePathString}`
    );
  }

  /**
   * Returns a new Path with the proper full path.
   */
  static fromUrl(url: string, websiteName: string, sourcePath: string) {
    return new Path(url.replace(websiteName, sourcePath));
  }

  toString() {
    return this.pathString;
  }

  /**
   * This path is equal to another path if they have the same pathString.
   * If the other path is a string, this is still true..
   * @param otherPath The other path to compare this path to.
   */
  equals(otherPath: Path | string) {
    return this.pathString === Path.create(otherPath).pathString;
  }

  /**
   * Get the name of this file, including the extension.
   */
  get name() {
    return this.pathArray[this.pathArray.length - 1];
  }

  /**
   * Get the title of this file, NOT including the extension.
   */
  get title() {
    return this.name.split(".")[0];
  }
  /**
   * Get the mimeType of this file based on its path string.
   */
  get mimeType() {
    return mime.getType(this.pathString) || "text/plain";
  }

  /**
   * Get this file's extension.
   * If we don't have an extension provided, we determine it from disk.
   */
  get extension(): string | null {
    // we always fetch [1], because if the file has multiple extensions
    // we ignore the second and only care about the first.
    const ext = pathLibrary.extname(this.pathString).split(".")[1] ?? null;

    if (ext) {
      return ext;
    } else if (this.exists() && this.isDirectory()) {
      return "dir";
    }

    return ext;
  }

  /**
   * Get the parent of this path.
   */
  get parent() {
    return Path.create(
      "/" + this.pathArray.slice(0, this.pathArray.length - 1).join("/")
    );
  }

  /**
   * Is this path the root path of the directory?
   */
  isRootPath() {
    return this.pathArray.length === 0;
  }

  /**
   * Fetch and construct the repo if we don't have one yet.
   * Returns null if we can't find a repo for the page.
   */
  private __repo(): Repo | null {
    if (this.isRootPath()) {
      return null;
    }

    if (!this.isDirectory()) {
      return this.parent.__repo();
    }

    const gitDir = this.join("/.git");

    if (gitDir.exists()) {
      return Repo.create(this);
    }

    return this.parent.__repo();
  }

  /**
   * Get the git repo that this path is a member of.
   */
  get repo() {
    if (!this.exists()) {
      return null;
    }

    const rootRepo = this.__repo();
    return rootRepo ?? undefined;
  }

  /**
   * Copy the file or directory at this path to another path.
   * If the path is not a subdir of this path, throw an error.
   */
  copy(from: Path, to: Path) {
    // TODO: this would be a good safeguard to add, but it doesn't work?
    // if (!this.contains(from)) {
    //   throw new Error(
    //     `Cannot copy ${from.toString()} to ${to.toString()} because it is not a subdirectory of ${this.toString()}`
    //   );
    // }

    try {
      execSync(`cp -r ${from.pathString} ${to.pathString}`, {
        cwd: this.toString(),
      });
    } catch (e) {
      console.log("error copying directory", e);
    }
  }

  /**
   * Move the file or directory at this path to another path.
   * If the path is not a subdir of this path, throw an error.
   */
  move(fromPath: Path | string, toPath: Path | string) {
    console.log("moving from ", { from: fromPath, to: toPath });

    try {
      // Avoid normalizing the paths by using the originals provided
      // Use shell: true to allow wildcard expansion
      execSync(`rsync -av --delete ${fromPath} ${toPath}`, {
        cwd: this.toString(),
        shell: true,
      });
    } catch (e) {
      console.log("error moving directory", e);
    }
  }

  /**
   * get this path's position relative to another path or string
   * ASSUME that the other paths, if defined, are the prefix of this one.
   * REMOVE 'maybeOtherPath' from this path's string.
   * If 'maypeReplaceWithPath' is defined, append it.
   */
  relativeTo(
    maybeOtherPath: Path | string,
    maybeReplaceWithPath: Path | string = ""
  ) {
    const otherPath = Path.create(maybeOtherPath);

    if (!this.pathString.startsWith(otherPath.toString())) {
      throw new Error(
        `Path we are removing is not present on the current path. Was looking for path: ${this.pathString} relative to ${maybeOtherPath}`
      );
    }

    let resultingPathString = this.pathString;

    if (otherPath) {
      resultingPathString = resultingPathString.replace(
        otherPath.toString(),
        maybeReplaceWithPath.toString()
      );
    }
    return Path.create(resultingPathString);
  }

  /**
   * Does the file at this path exist?
   */
  exists() {
    if (this.doesFileExist === undefined) {
      this.doesFileExist = fs.existsSync(this.pathString);
    }

    return this.doesFileExist;
  }

  /**
   * Accepts the extension WITHOUT a prefixed period
   */
  addExtension(extension: string) {
    return new Path(`${this.toString()}.${extension}`);
  }

  /**
   * Replace the path's extension with a new one.
   * @argument extension the extension WITHOUT a prefixed period
   * if undefined, the extension is dropped
   * if the path has multiple extensions, the last one is dropped
   */
  replaceExtension(extension?: string) {
    let newPathWithExtension = this.pathString;
    if (!newPathWithExtension.includes(".") && extension) {
      newPathWithExtension += `.${extension}`;
    } else {
      newPathWithExtension = newPathWithExtension.replace(
        /\.[a-zA-Z0-9]+$/,
        extension ? `.${extension}` : ""
      );
    }
    return new Path(newPathWithExtension);
  }

  /**
   * Is this path a directory?
   */
  isDirectory({ noFSOperation } = { noFSOperation: false }) {
    if (noFSOperation) {
      const extension = this.pathString.split(".")[1];
      return !extension;
    }

    if (!this.exists()) {
      throw new Error(`File ${this.toString()} doesnt exist`);
    }

    if (!this.lstats) {
      this.lstats = fs.lstatSync(this.pathString);
    }

    return this.lstats?.isDirectory();
  }

  // read this path as a utf8 string
  readString() {
    return fs.readFileSync(this.pathString, "utf8");
  }

  /**
   * Write a string to the file at this path,
   * creating the file if it doesn't exist.
   */
  writeString(str: string) {
    // if (this.isDirectory({ noFSOperation: true })) {
    //   throw new Error("Cannot write a string to a non-directory file");
    // }
    this.make();
    fs.writeFileSync(this.pathString, str);
  }

  readBinary() {
    // const chunks = [];
    let buffer;

    // const readStream = fs.createReadStream(this.pathString);
    // readStream.on('data', (chunk) => {
    //   chunks.push(chunk);
    // });

    // readStream.on('end', () => {
    //   buffer = Buffer.concat(chunks);
    // });

    // while (!buffer) {
    // }
    return buffer;
  }

  writeBinary() {
    // const outStream = fs.createWriteStream(outPath);
    // inStream.pipe(outStream);
    // TODO
    // await new Promise((resolve) => {
    //   outStream.on('close', resolve);
    // });
  }

  /**
   * Read an entire directory, returning all of the paths in the directory.
   */
  readDirectory() {
    if (!this.isDirectory()) {
      throw new Error(
        `Cannot read directory '${this.pathString}' because it is not a directory`
      );
    }

    let normalizedPathString = this.pathString;

    // if the path doesn't end in a slash, add one
    if (normalizedPathString[normalizedPathString.length - 1] !== "/") {
      normalizedPathString += "/";
    }

    return fs
      .readdirSync(normalizedPathString)
      .map((fileName) => new Path(`${normalizedPathString}${fileName}`));
  }

  /**
   * Join the provided next part of the path to this path,
   * producing the conjunction of the two.
   */
  join(nextPart: Path | string) {
    return Path.create(this.pathString + nextPart.toString());
  }

  /**
   * Determines whether this path contains the other.
   * This implementation is a bit strange and title might not be accurate.
   */
  contains(maybeOtherPathString: Path | string) {
    const otherPath = Path.create(maybeOtherPathString);

    if (
      this.pathArray.length > otherPath.pathArray.length ||
      this.pathString === otherPath.pathString
    ) {
      return false;
    }

    for (let i = 0; i < this.pathArray.length; i++) {
      if (otherPath.pathArray[i] !== this.pathArray[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Make this path exist, creating any parent directories along the way.
   * Assume the path is a file unless provided that it's a directory.
   */
  make(settings?: { isDirectory?: boolean }) {
    const isDirectory = settings?.isDirectory;

    if (this.exists()) {
      console.log(".make: File already exists at path ", this.pathString);
      return this;
    }

    // If this file is supposed to have a parent, then,
    // by definition, its parent must be a directory.
    // Make sure the parent directory exists.
    if (!this.parent.exists()) {
      console.log(
        "The parent of this path",
        this.toString(),
        "does not exist. Making it: ",
        this.parent.toString()
      );

      this.parent.make({ isDirectory: true });
    }

    if (isDirectory) {
      console.log("Making directory at", this.pathString);
      fs.mkdirSync(this.pathString);
    } else {
      console.log("Making file at", this.pathString);
      fs.writeFileSync(this.pathString, "");
    }

    return this;
  }

  /**
   * Watch this file for any action.
   * Invoke a callback listener if the file changes.
   */
  watch(callback: Function) {
    if (!this.exists()) {
      throw new Error(
        `Cannot watch path '${this.pathString}' because it does not exist`
      );
    }

    const watcher = fs.watch(this.pathString, (eventType, filename) => {
      // TODO: filename could be different if the file moves?
      callback(eventType, this);
    });

    return () => watcher.close();
  }

  normalize() {
    return Path.create(
      pathLibrary.normalize(this.toString())
    );
  }
}

export { Path };
