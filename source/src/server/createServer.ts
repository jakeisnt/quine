import { Path } from "../utils/path";
import { link } from "../utils/printstyle";
import { withoutUrl } from "./utils";
import log from "../utils/log";
import type { URL } from "../utils/url";

type OnRequestType = (cfg: { path: Path }) => any;
type OnSocketConnectedType = (ws: any) => any;

/**
 * Start a server at the provided URL and port.
 * Handle requests with the provided callback.
 */
const createServer = ({
  url,
  websocketPath,
  onRequest = () => {},
  onSocketConnected = () => {},
}: {
  url: URL;
  websocketPath: string;
  onRequest: OnRequestType;
  onSocketConnected: OnSocketConnectedType;
}) => {
  const linkText = link(url.toString()).underline().color("blue");
  const httpWebsocketUrl = `${url}${websocketPath}`;

  log.production(`Starting server at ${linkText}`);

  const server = Bun.serve({
    port: url.port,

    fetch(req, server) {
      const path = withoutUrl(req.url, url);
      log.network("FETCH", path);
      if (req.url === httpWebsocketUrl) {
        log.network("websocket request");
        if (server.upgrade(req)) {
          return;
        }
      }

      let returnPath = Path.create(path);

      // 'sec-fetch-dest' header determines how the script will be used
      // on the website, so we assume it's a js file - and push that -
      // if it's used in a script.
      if (req.headers.get("sec-fetch-dest") === "script") {
        returnPath = returnPath.replaceExtension("js");
      }

      return onRequest({
        // req,
        // server,
        path: returnPath,
      });
    },
    websocket: {
      // TODO: what does this field do?
      message(ws, message) {
        log.network("Received message from client: ", message);
      },
      open(ws) {
        onSocketConnected(ws);
      },
    },
  });

  return server;
};

export { createServer };
