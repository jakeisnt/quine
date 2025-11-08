import { makeFileResponse } from "./utils";
import { createServer } from "./createServer";
import { readFile } from "../file";
import log from "utils/log";
import { getPageSettings } from "./utils";
import type { Path } from "../utils/path";

/**
 * A hot-reloading single file server.
 */
const singleFileServer = ({
  url,
  port,
  absolutePathToFile,
  siteName,
  websocketPath,
}: {
  url: string;
  port: number;
  absolutePathToFile: Path;
  siteName: string;
  websocketPath: string;
}) => {
  const sourceDir = absolutePathToFile.parent;

  const settings = getPageSettings({
    url,
    port,
    siteName,
    absolutePathToDirectory: sourceDir,
    fallbackDirPath: sourceDir.toString(),
  });

  const file = readFile(absolutePathToFile, settings);

  // TODO: hunt down the websocket type and use it properly
  let wsClientConnection: any = null;

  createServer({
    url,
    port,
    websocketPath,
    onRequest: () => {
      return makeFileResponse(file, { ...settings, websocketPath });
    },
    onSocketConnected: (ws) => {
      log.network("socket connected");
      wsClientConnection = ws;
    },
  });

  file.watch((eventType, curFile) => {
    if (eventType === "change") {
      log.hotReload("File changed. Reloading...");
      // re-read the file into memory
      file.read();
      wsClientConnection?.send("reload");
    }
  });
};

export { singleFileServer };
