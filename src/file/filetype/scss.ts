import { File, SourceFile } from "file/classes";
import * as sass from "sass";
const { pathToFileURL } = require("url");
import { wrapFile } from "../classes/utils";
import type CSSFile from "./css";
import type { PageSettings } from "../../types/site";

/**
 * Convert provided SCSS text to a CSS string.
 */
const scssToCss = (scssFile: File, cfg: PageSettings) => {
  const result = sass.compileString(scssFile.text(cfg), {
    sourceMap: false,
    importers: [
      {
        findFileUrl(url) {
          const nextUrl = new URL(url, pathToFileURL(`${cfg.sourceDir}/`));
          return nextUrl;
        },
      },
    ],
  });

  return result.css.toString();
};

class SCSSFile extends SourceFile {
  public static filetypes = ["scss", "sass"];
  public static targets = ["css"];

  css(cfg: PageSettings) {
    return wrapFile(this, (f) => scssToCss(f, cfg), {
      extension: "css",
    }) as CSSFile;
  }
}

export default SCSSFile;
