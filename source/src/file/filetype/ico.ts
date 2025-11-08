import { BinaryFile } from "file/classes";

import logger from "utils/log";
import { HtmlPage } from "../../html";
import type { PageSettings } from "../../types/site";

// can follow!! https://github.com/lovell/sharp/issues/1118
// for html, you should inline the base64 image: https://stackoverflow.com/questions/13094257/display-an-ico-within-an-image-element-img

/**
 * An ICO file, usually to represent a page favicon.
 */
class IcoFile extends BinaryFile {
  static filetypes = ["ico"];

  serve() {
    return { contents: this.path.readBinary() ?? "", mimeType: "image/x-icon" };
  }

  asHtml(settings: PageSettings) {
    const binaryContents = this.path.readBinary();
    logger.file("Reading favicon binary. Contents:", binaryContents);
    const src = `data:image/x-icon;base64,${binaryContents ?? ""}`;
    return HtmlPage.create(["html", ["img", { src }]], settings);
  }
}

export default IcoFile;
