import { File } from "file/classes";
import JSFile from "./js.js";
import { readFile } from "file";
import HtmlPage from "../../html/builder";
import type { PageSettings } from "../../types/site";
import type { HtmlNode, PageSyntax } from "../../types/html";
import { Path } from "../../utils/path";

/**
 * Read a javascript file to string.
 */
const readJSFile = (path: Path, cfg: PageSettings) => {
  return new JSFile(path, cfg);
};

const folderIndexPageTable = ({
  files,
  rootUrl,
  sourceDir,
}: {
  files: File[];
  rootUrl: string;
  sourceDir: string;
}): PageSyntax => {
  return [
    "div",
    { class: "folder-index-page-table" },
    [
      "table",
      files.map((childFile) => {
        const lastLog = childFile.lastLog;

        return [
          "tr",
          ["td", { class: "file-hash-tr" }, lastLog?.shortHash],
          [
            "td",
            { class: "file-name-tr" },
            [
              "a",
              {
                href: childFile.htmlUrl({
                  rootUrl,
                  sourceDir,
                }),
              },
              childFile.name,
            ],
          ],
          ["td", { class: "file-type-tr" }, childFile.extension],
          [
            "td",
            {
              class: lastLog?.date ? "file-date-tr" : "file-date-untracked-tr",
            },
            lastLog?.date ?? "untracked",
          ],
        ];
      }) as HtmlNode[],
    ],
  ];
};

const directoryToHtml = (
  dir: Directory,
  {
    files,
    rootUrl,
    siteName,
    sourceDir,
    resourcesDir,
    faviconsDir,
  }: PageSettings & { files: File[] }
): PageSyntax => {
  const title = dir.name;

  return [
    "html",
    ["Header", { title, siteName, rootUrl, resourcesDir, faviconsDir }],
    [
      "body",
      ["Sidebar", { path: dir.path, title, sourceDir, rootUrl }],
      [
        "div",
        { class: "site-body" },
        [
          "main",
          folderIndexPageTable({ files, rootUrl, sourceDir }),
          ["ScrollUp"],
        ],
      ],
    ],
  ];
};

/**
 * Represents a directory, which is a file that contains other files.
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
    // special case for the js files: make sure they all exist.
    // don't cache this because we only want the default full dir cached.
    if (omitNonJSFiles) {
      const jsPaths = this.path.readDirectory();
      const maybeJSFiles = jsPaths.map((childPath: Path) => {
        if (childPath.extension !== "js" && childPath.extension !== "ts") {
          return undefined;
        } else {
          return readJSFile(childPath, this.cachedConfig);
        }
      });

      const retFiles: File[] = [];
      maybeJSFiles.forEach((f) => {
        if (f) {
          retFiles.push(f);
        }
      });

      return retFiles;
    }

    if (this.enumeratedContents) {
      return this.enumeratedContents;
    }

    const fileContents = this.path
      .readDirectory()
      // SHORTCUT: Fixes a bug where the site creates itself infinitely
      .filter((v) => v.toString() !== this.cachedConfig.targetDir)
      .map((v) => readFile(v, this.cachedConfig));

    this.enumeratedContents = fileContents;
    return fileContents;
  }

  /**
   * Given a file path relative to this directory,
   * find the relevant source file.
   */
  findFile(relativePath: Path, cfg: PageSettings) {
    const path = this.path.join(relativePath);

    try {
      return readFile(path, cfg);
    } catch (e) {
      return null;
    }
  }

  htmlUrl({ sourceDir }: { sourceDir: string }) {
    const relativeToSource = this.path.relativeTo(sourceDir);
    return relativeToSource.toString() + "/index.html";
  }

  write(config: PageSettings) {
    const { sourceDir, targetDir } = config;

    // first, make sure the corresponding directory exists.
    // this is e.g. '/site/docs/' and mkdir /site/docs/
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
  dependencies(settings: PageSettings) {
    if (!this.enumeratedDependencies) {
      this.enumeratedDependencies = this.asHtml(settings)?.dependencies();
    }

    return this.enumeratedDependencies;
  }

  /**
   * This is a directory, so we return true.
   */
  isDirectory() {
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
