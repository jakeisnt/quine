import { File } from "file/classes";
import JSFile from "./js.js";
import { readFile } from "file";
import HtmlPage from "../../html/builder";
import type { PageSettings } from "../../types/site";
import type { PageSyntax } from "../../types/html";
import { Path } from "../../utils/path";
import type { URL } from "../../utils/url.js";

/**
 * Read a javascript file to string.
 */
const readJSFile = (path: Path, cfg: PageSettings) => {
  return new JSFile(path, cfg);
};

const directoryToHtml = (
  dir: Directory,
  {
    files,
    url,
    siteName,
    sourceDir,
    resourcesDir,
    faviconsDir,
  }: PageSettings & { files: File[] }
): PageSyntax => {
  const title = dir.name;

  return [
    "html",
    { lang: "en" },
    ["Header", { title, siteName, url, resourcesDir, faviconsDir }],
    [
      "body",
      ["Sidebar", { path: dir.path, title, sourceDir, url }],
      [
        "div",
        { class: "site-body" },
        ["main", ["FolderIndex", { files, url, sourceDir }], ["ScrollUp"]],
      ],
    ],
  ];
};

/**
 * A directory - a file that contains other files.
 */
class Directory extends File {
  static filetypes = ["dir"];
  private enumeratedContents: File[] | undefined = undefined;
  private enumeratedDependencies: File[] | undefined = undefined;
  private enumeratedHtml: HtmlPage | undefined = undefined;

  /**
   * Recursively fetch and flatten the file tree.
   */
  tree(cfg: PageSettings) {
    const myContents = this.contents(cfg);
    const childFiles: File[] = [];

    myContents.forEach((file) => {
      if (file.isDirectory()) {
        childFiles.push(...file.tree(cfg));
      } else {
        childFiles.push(file);
      }
    });

    return childFiles;
  }

  /**
    // Special case for the js files: make sure they all exist.
    // Don't cache this because we only want the default full dir cached.
   */
  jsFileContents() {
    const jsPaths = this.path.readDirectory();

    const retFiles: File[] = [];

    jsPaths.forEach((childPath: Path) => {
      if (childPath.extension !== "js" && childPath.extension !== "ts") {
        return;
      }
      const maybeJSFile = readJSFile(childPath, this.cachedConfig);
      if (maybeJSFile) retFiles.push(maybeJSFile);
    });

    return retFiles;
  }

  /**
   * Get all the files in the immediate directory.
   * This is not treated as a property and is not cached due to the possibility of files changing.
   *
   * @param {boolean} omitNonJSFiles - Flag to bootstrap the setup. The 'readFile' function dispatches based on this flag to force JavaScript files.
   */
  contents(
    cfg?: PageSettings,
    { omitNonJSFiles = false }: { omitNonJSFiles: boolean } = {
      omitNonJSFiles: false,
    }
  ): File[] {
    if (omitNonJSFiles) {
      return this.jsFileContents();
    }

    if (this.enumeratedContents) {
      return this.enumeratedContents;
    }

    const fileContents = this.path
      .readDirectory()
      // SHORTCUT: Fixes a bug where the site creates itself infinitely
      .filter((v: Path) => !v.equals(this.cachedConfig.targetDir))
      .map((v: Path): File | undefined => {
        try {
          return readFile(v, this.cachedConfig);
        } catch (error) {
          console.warn(`[directory] Failed to read file ${v.toString()}:`, error);
          return undefined;
        }
      })
      .filter((v: File | undefined): v is File => {
        if (v === undefined) {
          return false;
        }
        return true;
      });

    this.enumeratedContents = fileContents;
    return fileContents;
  }

  htmlUrl({ url, sourceDir }: { url: URL; sourceDir: Path }) {
    const relativeToSource = this.path.relativeTo(sourceDir);
    return `${url.toString().slice(0, -1)}${relativeToSource}/index.html`;
  }

  /**
   * Create this directory if it doesn't yet exist.
   */
  write(config: PageSettings) {
    const { sourceDir, targetDir } = config;

    const targetPath = this.path.relativeTo(sourceDir, targetDir);
    targetPath.make({ isDirectory: true });

    return this;
  }

  /**
   * Find all of the dependencies of a directory.
   *
   * The dependencies of a directory are all of the files that it contains,
   * but as html versions. this is a proxy for finding those links in the html
   *
   * SHORTCUT: the dependencies of a directory in general are not html-ified.
   * That's a quick hack we use here to bootstrap building files.
   */
  dependencies(settings: PageSettings): File[] {
    if (!this.enumeratedDependencies) {
      this.enumeratedDependencies = this.contents(settings).flatMap((file) =>
        file.isDirectory() ? file.dependencies(settings) : [file]
      );
    }
    return this.enumeratedDependencies;
  }

  /**
   * This is a directory, so we return true.
   */
  isDirectory(): this is Directory {
    return true;
  }

  /**
   * Render the directory as HTML, cacheing the rendering if necessary.
   */
  asHtml(settings: PageSettings) {
    if (!this.enumeratedHtml) {
      const files = this.contents(settings);
      const page = directoryToHtml(this, {
        files,
        ...settings,
      });

      this.enumeratedHtml = HtmlPage.create(page, settings);
    }

    return this.enumeratedHtml;
  }

  /**
   * Get the MIME type of this directory.
   *
   * SHORTCUT: As of now we only use folders for their HTML rendering,
   * so we always treat them as HTML files.
   */
  get mimeType() {
    return "text/html";
  }
}

export default Directory;
