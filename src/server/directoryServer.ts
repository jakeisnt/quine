import { Path } from "../utils/path";

import log from "utils/log";

import { makeFileResponse } from "./utils";
import { readFile } from "../file";
import { createServer } from "./createServer";
import Directory from "../file/filetype/directory";
import { homePage } from "../pages/home";
import { getPageSettings } from "./utils";

/**
 * Serve the files in a directory.
 * @param {*} absolutePathToDirectory primary directory we should source files from.
 * @param {*} fallbackDirPath path to directory we should fall back to serving.
 */
const directoryServer = ({
  absolutePathToDirectory,
  fallbackDirPath,
  url,
  port,
  siteName,
  websocketPath,
}: {
  absolutePathToDirectory: Path;
  fallbackDirPath: string;
  url: string;
  port: number;
  siteName: string;
  websocketPath: string;
}) => {
  let pageSettings = getPageSettings({
    url,
    port,
    siteName,
    absolutePathToDirectory,
    fallbackDirPath,
  });

  const dir = readFile(
    absolutePathToDirectory,
    pageSettings
  ) as unknown as Directory;

  let fallbackDir: Directory;

  try {
    if (fallbackDirPath) {
      fallbackDir = readFile(
        fallbackDirPath,
        pageSettings
      ) as unknown as Directory;
    }
  } catch (e: any) {
    log.debug("Error finding fallback dir:", e.message);
  }

  if (!dir.isDirectory()) {
    throw new Error(
      `Received path '${absolutePathToDirectory}' is not a directory`
    );
  }

  pageSettings = getPageSettings({
    url,
    port,
    siteName,
    absolutePathToDirectory: dir.path,
    fallbackDirPath,
  });

  createServer({
    url,
    port,
    websocketPath,
    onRequest: ({ path }: { path: Path }) => {
      let pathToUse = Path.create(path);

      // If we request the root, serve up the home page
      if (["", "/", "/index", "/index.html"].includes(pathToUse.toString())) {
        return makeFileResponse(homePage(pageSettings), {
          ...pageSettings,
          websocketPath,
        });
      }

      if (path.name === "index.html") {
        // if the path is a directory, serve the parent like an html file
        pathToUse = Path.create(path.parent.toString() + ".html");
      }

      // we look for a directory with .html,
      // then fall back to types.html

      let file = dir.findFile(pathToUse, pageSettings);
      if (!file) {
        // if we can't find the file, attempt to find it in a fallback directory.
        file = fallbackDir?.findFile(pathToUse, pageSettings);
      }
      if (!file) {
        return new Response("Not found", { status: 404 });
      }

      return makeFileResponse(file, { ...pageSettings, websocketPath });
    },

    onSocketConnected: (ws) => {
      log.hotReload("hot reload socket connected");
    },
  });
};

export { directoryServer };
