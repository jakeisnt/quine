import { File, SourceFile } from "file/classes";
import JavascriptFile from "./js";

import { wrapFile } from "../classes/utils";
import type { PageSettings } from "../../types/site";

const transpiler = new Bun.Transpiler({
  loader: "ts",
});

const tsToJs = (tsFile: File, cfg: PageSettings) => {
  return transpiler.transformSync(tsFile.text(cfg));
};

class TypescriptFile extends SourceFile {
  public static filetypes = ["ts"];
  public static targets = ["js"];

  js(cfg: PageSettings) {
    return wrapFile(this, (f) => tsToJs(f, cfg), {
      extension: "js",
    }) as JavascriptFile;
  }
}

export default TypescriptFile;
