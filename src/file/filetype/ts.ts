import { SourceFile } from "../classes";
import type { PageSettings } from "../../types/site";
import type { Path } from "../../utils/path";
import type JSFile from "./js";
import { wrapFile } from "../classes/utils";
import * as ts from "typescript";

const tsToJs = (tsFile: SourceFile, cfg: PageSettings) => {
  const result = ts.transpileModule(tsFile.text(cfg), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
    },
  });

  return result.outputText;
};

class TypeScriptFile extends SourceFile {
  static filetypes = ["ts", "tsx", "js", "jsx"];

  static create(filePath: Path, cfg: PageSettings) {
    // If requesting a .js file, try to find the .ts version
    if (filePath.extension === "js" || filePath.extension === "jsx") {
      const tsPath = filePath.replaceExtension("ts");
      if (tsPath.exists()) {
        return new TypeScriptFile(tsPath, cfg);
      }
      // Also try .tsx for jsx files
      if (filePath.extension === "jsx") {
        const tsxPath = filePath.replaceExtension("tsx");
        if (tsxPath.exists()) {
          return new TypeScriptFile(tsxPath, cfg);
        }
      }
      return null;
    }

    // Normal .ts file handling
    if (filePath.exists()) {
      return new TypeScriptFile(filePath, cfg);
    }
    return null;
  }

  js(cfg: PageSettings): JSFile {
    return wrapFile(this, (f) => tsToJs(f as SourceFile, cfg), {
      extension: "js",
    }) as JSFile;
  }
}

export default TypeScriptFile;
