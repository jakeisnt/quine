import { File, SourceFile } from "file/classes";
import * as sass from "sass";
import { pathToFileURL } from "url";
import { wrapFile } from "../classes/utils";
import type CSSFile from "./css";
import type { PageSettings } from "../../types/site";

// Add cache for compiled CSS
const cssCache = new Map<string, string>();

/**
 * Convert provided SCSS text to a CSS string.
 */
const scssToCss = (scssFile: File, cfg: PageSettings) => {
  const cacheKey = `${scssFile.path}:${scssFile.lastTimestamp}`;

  if (cssCache.has(cacheKey)) {
    return cssCache.get(cacheKey)!;
  }

  const result = sass.compileString(scssFile.text(cfg), {
    sourceMap: false,
    importers: [
      {
        findFileUrl(url) {
          const nextUrl = new URL(
            url,
            pathToFileURL(`${cfg.sourceDir}/`).toString()
          );
          return nextUrl;
        },
      },
    ],
  });

  cssCache.set(cacheKey, result.css.toString());
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
