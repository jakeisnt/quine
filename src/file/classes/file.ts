import { Path } from "../../utils/path";
import type { PageSettings } from "../../types/site";
import type { URL } from "../../utils/url";
import type Directory from "../filetype/directory";

/**
 * Any file on the system.
 */
class File {
  // the full path to the file
  public path: Path;

  // The page settings config used within this file's lifetime
  public cachedConfig: PageSettings;

  // If this file is 'pretending' to be another file,
  // the file that this was wrapped around is accessible here.

  // This allows us to pull tricks like asking questions about a
  // javascript file when the actual file is written in typescript,
  // converting configuration files into others on the fly,
  // reading SCSS as CSS, etc.
  public fakeFileOf?: File;

  // The source file types that this file represents.
  public static filetypes: string[] = [];

  // The supported target file types of this file, if any.
  // If a file class supports a specific target <t>,
  // the file must also have a function <t>() to call
  // that produces a file with the type of that target.
  public static targets: string[] = [];

  /**
   * Construct a file.
   */
  constructor(pathArg: Path, cfg: PageSettings) {
    // Normalize the path when creating a File
    const filePath = Path.create(pathArg).normalize();

    if (!filePath.exists()) {
      throw new Error(
        `from File constructor: File at path '${filePath}' does not exist`
      );
    }

    this.path = filePath;
    this.cachedConfig = cfg;
  }

  static create(path: Path, cfg: PageSettings): File | undefined {
    return new this(path, cfg);
  }

  /**
   * Two files are equal if their paths are equal.
   */
  equals(file: File) {
    return this.path.equals(file.path);
  }

  clone(): typeof this {
    // note: `this.constructor` is always callable as a constructor,
    // but TypeScript doesn't seem to have a special notion of a 'constructor'
    // function that can be invoked like an arbitrary function.
    // Not even sure it's possible with the JS spec.
    return new (this.constructor as any)(this.path);
  }

  // read the file at the path
  read() {
    throw new Error("File.read() is not implemented");
  }

  // the title of the file does not
  get title() {
    return this.path.title;
  }

  // the name of a file includes the extension
  get name() {
    return this.path.name;
  }

  // the type of the file is the extension (for now?)
  get extension() {
    return this.path.extension;
  }

  // get the mime type of the file
  get mimeType() {
    return this.path.mimeType;
  }

  /**
   * By default, files haven o text.
   *
   * Maybe I'll discover a way to render as text at some point.
   * This is necessary because overrides for serve() rely on overriding this.text
   * so that e.g. an HTML file can return '' for the text
   */
  text(cfg: PageSettings) {
    return "";
  }

  /**
   * Determine if the file is a directory.
   * Always false here; directory subclass reimplements this.
   */
  isDirectory(): this is Directory {
    return false;
  }

  write(config: PageSettings): typeof this {
    console.error(
      `file.write() is not implemented for file at '${this.path.toString()}'`
    );

    return this;
  }

  /**
   * Get the url to the html page with this file
   */
  htmlUrl({ url, sourceDir }: { url: URL; sourceDir: Path }) {
    const relativeToSource = this.path.relativeTo(sourceDir);
    return `${url.toString().slice(0, -1)}${relativeToSource.addExtension(
      "html"
    )}`;
  }

  get repo() {
    const repoAtPath = this.path.repo;
    if (!repoAtPath) {
      console.log(
        `From File.repo: File at path '${this.path}' is not in a repo`
      );
      return null;
    }

    return repoAtPath;
  }

  get lastLog() {
    return this.repo?.getFile(this.path)?.lastLog;
  }

  get log() {
    return this.repo?.getFile(this.path)?.log ?? [];
  }

  get lastTimestamp() {
    return this.repo?.getFile(this.path).lastTimestamp;
  }

  // by default, files do not depend on any other files.
  dependencies(settings: PageSettings): File[] {
    return [];
  }

  /**
   * Serve the file as HTML.
   * By default, assume the file has some text output and try to get that.
   */
  serve(args: PageSettings) {
    return { contents: this.text(args), mimeType: this.mimeType };
  }

  /**
   * Watch the file, attaching an event listener to pick up on file events.
   */
  watch(callback: (eventType: string, file: File) => void) {
    const closeWatcher = this.path.watch((eventType: string) => {
      callback(eventType, this);
    });

    return closeWatcher;
  }
}

export default File;
