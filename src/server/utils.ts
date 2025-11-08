import File from "../file/classes/file";
import type { PageSettings } from "../types/site";
import { Path } from "../utils/path";

/**
 * Format a URL with the URL, port, and path.
 */
const formatUrl = ({
  url,
  port,
  path,
}: {
  url: string;
  port: number;
  path?: string;
}) => `${url}${port ? ":" + port : ""}${path ?? ""}`;

/**
 * Remove the full path from the URL.
 */
const withoutUrl = (fullPath: string, url: string) => fullPath.replace(url, "");

/**
 * inject a hot reload script into the body iof an html string.
 */
const injectHotReload = ({
  htmlString,
  websocketPath,
}: {
  htmlString: string;
  websocketPath: string;
}) => {
  const script = `
    <script>
      console.log('hot reload script loaded');
      const socket = new WebSocket('${websocketPath}');
      socket.addEventListener('message', function (event) {
        console.log('Received message from server ', event.data);
        window.location.reload();
      });
    </script>
  `;

  return htmlString.replace("</body>", `${script}</body>`);
};

/**
 * make a response to a request for a file with the file
 */
const makeFileResponse = (
  file: File,
  {
    siteName,
    sourceDir,
    rootUrl,
    websocketPath,
    resourcesDir,
    faviconsDir,
    targetDir,
  }: PageSettings & { websocketPath: string }
) => {
  const { contents, mimeType } = file.serve({
    siteName,
    rootUrl,
    sourceDir,
    targetDir,
    resourcesDir,
    faviconsDir,
  });

  let responseText =
    mimeType === "text/html"
      ? injectHotReload({ htmlString: contents, websocketPath })
      : contents;

  return new Response(responseText, {
    headers: {
      // NEVER cache. this is always a dev server.
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      // content-type (required)
      "content-type": mimeType,
    },
  });
};

/**
 * Format page settings according to the provided arguments.
 */
const getPageSettings = ({
  url,
  port,
  siteName,
  absolutePathToDirectory,
  fallbackDirPath,
}: {
  url: string;
  port: number;
  siteName: string;
  absolutePathToDirectory: Path;
  fallbackDirPath: string;
}): PageSettings => {
  const sourceDir = absolutePathToDirectory.toString();
  const rootUrl = formatUrl({ url, port });
  const resourcesDir = `${sourceDir}/resources`;
  const faviconsDir = `${sourceDir}/favicons`;

  return {
    siteName,
    sourceDir,
    fallbackSourceDir: fallbackDirPath,
    faviconsDir,
    resourcesDir,
    rootUrl,
    targetDir: absolutePathToDirectory.toString() + "/docs",
  };
};

export { withoutUrl, formatUrl, makeFileResponse, getPageSettings };
