import { SourceFile } from "file/classes";
import { readFile } from "file";
import SCSSFile from "./scss";
import type { Path } from "../../utils/path";
import type { PageSettings } from "../../types/site";

/**
 * A CSS file on disk.
 * A CSS file is a source file that can convert from SCSS, etc.
 */
class CSSFile extends SourceFile {
  static filetypes = ["css"];

  /**
   * Override the default 'create' behavior.
   * Potentially create a parent as well.
   * @param filePath path to the file to create from.
   */
  static create(filePath: Path, cfg: PageSettings) {
    if (filePath.exists()) {
      return new CSSFile(filePath, cfg);
    }

    // If this file doesn't exist, try making the scss file
    const scssPath = filePath.replaceExtension("scss");
    const prevFile = readFile(scssPath, cfg) as SCSSFile;

    return prevFile.css(cfg);
  }
}

export default CSSFile;
