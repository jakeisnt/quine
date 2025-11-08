import type { Path } from "../utils/path";
import type { URL } from "../utils/url";

type PageSettings = {
  siteName: string;
  sourceDir: Path;
  targetDir: Path;
  resourcesDir: Path;
  faviconsDir: Path;
  fallbackSourceDir?: Path;
  ignorePaths?: string[];
  url: URL;
  websocketPath: string;
};

export type { PageSettings };
