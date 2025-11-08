import { SourceFile } from "file/classes";
import type { Path } from "../../utils/path";
import type { PageSettings } from "../../types/site";

/**
 * A CSS file.
 */
class CSSFile extends SourceFile {
  static filetypes = ["css"];

  /**
   * Create a CSS file if the file exists.
   */
  static create(filePath: Path, cfg: PageSettings) {
    if (filePath.exists()) {
      return new CSSFile(filePath, cfg);
    }
  }
}

export default CSSFile;
