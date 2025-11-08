import { SourceFile } from "file/classes";
import { readFile } from "file";
import { Path } from "utils/path";
import type { PageSettings } from "../../types/site";
import { File } from "file/classes";
import { wrapFile } from "../classes/utils";

/**
 * Find an HTML parent file at the provided path.
 *
 * Path example resolutions:
 * - src/file.html -> src/file
 * - src/file.html -> src/file.html if the file exists
 * - src/file.js.html -> src/file.js
 * - src/index.html -> src.html for directories
 */
const findHtmlParentFile = (path: Path) => {
  // If we have the HTML file, use it!
  if (path.exists()) {
    return path;
  }

  // If we're fetching the index.html file, redirect to the parent.
  if (path.name === "index.html") {
    return path.parent;
  }

  // Otherwise, lop off the `.html` extension and continue.
  return path.replaceExtension();
};

class HTMLFile extends SourceFile {
  static filetypes = ["html", "htm", "svg"];

  /**
   * Create an HTML file from path.
   */
  static create(filePath: Path, cfg: PageSettings) {
    // If we have the html, just return it
    if (filePath.exists()) {
      return new HTMLFile(filePath, cfg);
    }

    // Otherwise, try to get the non-html version of the file.
    // if the path is a directory, this won't work;
    // we then get the containing directory if this fails.

    // NOTE: This logic is a special case.
    // Other transformations should not be implemented this way.
    const path = findHtmlParentFile(filePath);

    let prevFile = readFile(path, cfg);
    // if (!prevFile) {
    //   const directoryPath = filePath.parent;
    //   prevFile = readFile(directoryPath, cfg);
    // }
    if (!prevFile) return;

    return wrapFile(
      prevFile,
      // the function is available on all children of the file
      // @ts-ignore
      (f: File) => f?.asHtml?.(cfg)?.toString() ?? "",
      {
        extension: "html",
        addExtension: true,
        mimeType: "text/html",
      },
      (file, settings: PageSettings) => {
        // @ts-ignore
        return file?.asHtml?.(settings)?.dependencies() ?? [];
      }
    );
  }

  /**
   * Find the dependencies of the HTML file.
   *
   * The dependencies of an html file are the internal links
   * in the file's html.
   */
  dependencies(settings: PageSettings) {
    return this.asHtml(settings).dependencies();
  }
}

export default HTMLFile;
