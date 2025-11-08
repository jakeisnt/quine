import { SourceFile } from "file/classes";
import { Path } from "../../utils/path";
import type { PageSettings } from "../../types/site";

class JavascriptFile extends SourceFile {
  static filetypes = ["js"];

  /**
   * Require this file, loading in its semantic information.
   * @returns a file configuration; notably has exports like `default`.
   */
  require() {
    return require(this.path.toString());
  }

  /**
   * Write the JS file to disk.
   *
   * Also write an equivalent file without an extension
   * to support imports like `import lib from 'lib'`.
   */
  write(cfg: PageSettings) {
    const { sourceDir, targetDir } = cfg;

    const targetPath = this.path.relativeTo(sourceDir, targetDir);
    targetPath.writeString(this.text(cfg));

    const targetNonJSPath = targetPath.replaceExtension();
    targetNonJSPath.writeString(this.text(cfg));

    return this;
  }

  /**
   * Create this file if it exists.
   */
  static create(filePath: Path, cfg: PageSettings): JavascriptFile | undefined {
    if (filePath.exists()) {
      return new JavascriptFile(filePath, cfg);
    }
  }
}

export default JavascriptFile;
