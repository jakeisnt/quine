import { makeFileResponse } from "./utils";
import { createServer } from "./createServer";
import { readFile } from "../file";
import log from "utils/log";
import type { PageSettings } from "../types/site";
import type { Path } from "../utils/path";

/**
 * A hot-reloading single file server.
 */
const singleFileServer = (absolutePathToFile: Path, settings: PageSettings) => {
  const file = readFile(absolutePathToFile, settings);
  if (!file) return;

  let wsClientConnection: WebSocket;

  createServer({
    ...settings,
    onRequest: () => makeFileResponse(file, settings),

    onSocketConnected: (ws) => {
      log.network("socket connected");
      wsClientConnection = ws;
    },
  });

  file.watch((eventType) => {
    if (eventType === "change") {
      log.hotReload("File changed. Reloading...");
      // Re-read the file into memory
      file.read();
      wsClientConnection?.send("reload");
    }
  });
};

export { singleFileServer };
