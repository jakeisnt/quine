import { Path } from "../utils/path";

import type { PageSettings } from "../types/site";
import log from "utils/log";

import { makeFileResponse } from "./utils";
import { readFile } from "../file";
import { createServer } from "./createServer";
import Directory from "../file/filetype/directory";
import { homePage } from "../pages/home";

/**
 * Load the specified source files from disk,
 * bootstrapping the source finding process.
 */
const findSource = (
  settings: PageSettings
): {
  fallbackDir?: Directory;
  dir: Directory;
} => {
  const dir = readFile(settings.sourceDir, settings) as unknown as Directory;

  if (!dir.isDirectory()) {
    throw new Error(`Received path '${settings.sourceDir}' is not a directory`);
  }

  return { dir };
};

/**
 * Is the path the root?
 */
const isRootPath = (path: Path, settings: PageSettings) => {
  return (
    path.equals(settings.sourceDir) ||
    ["", "/", "/index", "/index.html"].includes(path.toString())
  );
};

/**
 * Format the path provided to be a nice + friendly absolute path
 * @param path
 * @param settings
 */
const formatPath = (path: Path, settings: PageSettings) => {
  // If path already starts with sourceDir, return as-is
  if (path.toString().startsWith(settings.sourceDir.toString())) {
    return path;
  }

  // If path starts with targetDir, swap targetDir with sourceDir
  if (path.toString().startsWith(settings.targetDir.toString())) {
    return Path.create(
      path
        .toString()
        .replace(settings.targetDir.toString(), settings.sourceDir.toString())
    );
  }

  // Otherwise, prepend sourceDir
  return Path.create(settings.sourceDir.toString() + path.toString());
};

/**
 * Serve the files in a directory.
 */
const directoryServer = (settings: PageSettings) => {
  let pageSettings = settings;
  const { dir } = findSource(settings);
  pageSettings = { ...settings, sourceDir: dir.path };

  createServer({
    ...settings,
    onRequest: ({ path }: { path: Path }) => {
      let pathToUse = path;

      // If we request the root, serve up the home page. Hardcoded.
      if (isRootPath(pathToUse, settings)) {
        return makeFileResponse(homePage(pageSettings), pageSettings);
      }

      pathToUse = formatPath(pathToUse, pageSettings);
      console.log({
        path: path.toString(),
        pth2: pathToUse.toString(),
      });

      let file = readFile(pathToUse, pageSettings);

      if (!file) {
        return new Response("Not found", { status: 404 });
      }

      return makeFileResponse(file, pageSettings);
    },

    onSocketConnected: (ws: WebSocket) => {
      log.hotReload("hot reload socket connected");
    },
  });
};

export { directoryServer };
