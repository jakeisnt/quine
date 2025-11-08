import { SourceFile } from "file/classes";
import { readFile } from "file";
import { Path } from "utils/path";
import type { PageSettings } from "../../types/site";
import { File } from "file/classes";
import { wrapFile } from "../classes/utils";

class HTMLFile extends SourceFile {
  static filetypes = ["html", "htm", "svg"];

  /**
   * Write a file to a path at the provided config location.
   * When writing the html file,
   * we also write the non-html file if the file was faked.
   */
  write(config: PageSettings) {
    const { sourceDir, targetDir } = config;
    const targetPath = this.path.relativeTo(sourceDir, targetDir);
    targetPath.writeString(this.text(config));

    return this;
  }

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

    // NOTE: This is a special case.
    // To solve this in a systemic way, we'll need to
    const path = filePath.replaceExtension();

    let prevFile: File;
    try {
      prevFile = readFile(path, cfg);
    } catch (e) {
      const directoryPath = filePath.parent;
      prevFile = readFile(directoryPath, cfg);
    }

    return wrapFile(
      prevFile as SourceFile,
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
