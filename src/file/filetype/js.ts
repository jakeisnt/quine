import { SourceFile } from "file/classes";
import { readFile } from "../index";
import { Path } from "../../utils/path";
import TypescriptFile from "./ts";
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
   * Otherwise, dispatch to a compile source and convert it.
   */
  static create(filePath: Path, cfg: PageSettings): JavascriptFile {
    if (filePath.exists()) {
      return new JavascriptFile(filePath, cfg);
    }

    // The algorithm has to work like so:
    // 1. try to create() a file.
    // 2. if success, return that file.
    // 3. if the file can't be found,
    //    collect a list of all file types that include this file's extension
    //    in their `targets` array.
    // 4. For each of those files,
    //    swap our current file path with the extension of that file type and
    //    attempt to create() it.
    //    notice that this is a recursive call to the function: goes to (1).
    //
    //    we take the first file that fits. there is no specified precedence.
    //    notably, this means it is not allowed to have two files with the same name but different extensions
    //    that support the same compilation target,
    //    in a directory, because those will conflict and one will take precedense

    // If we don't have the JS file, try grabbing the TS file.

    // Really, though, this file should not have to know what can compile to it.
    // We need to register that in the source file somehow.
    const tsPath = filePath.replaceExtension("ts");
    const typescriptFile = readFile(tsPath, cfg) as TypescriptFile;

    return typescriptFile.js(cfg);
  }
}

export default JavascriptFile;
