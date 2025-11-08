import { HtmlPage } from "../../html";
import File from "./file";
import type { PageSettings } from "../../types/site";

/**
 * Represents any file that can be read as a UTF-8 string.
 */
class TextFile extends File {
  // The string contents of the file
  protected asString?: string;

  read() {
    this.asString = this.path.readString();
    return this;
  }

  /**
   * Write a file to a path at the provided config location.
   */
  write(config: PageSettings = this.cachedConfig) {
    const { sourceDir, targetDir } = config;
    const targetPath = this.path.relativeTo(sourceDir, targetDir);
    targetPath.writeString(this.serve(config).contents);
    return this;
  }

  text(config?: PageSettings): string {
    if (!this.asString) {
      this.read();
    }

    return this.asString as string;
  }

  toString() {
    return this.text(this.cachedConfig);
  }

  asHtml(settings: PageSettings) {
    return HtmlPage.create(
      ["Article", { file: this, ...settings }, ["SourceBlock", { file: this }]],
      settings
    );
  }

  serve(settings: PageSettings) {
    return { contents: this.text(settings), mimeType: this.mimeType };
  }
}

export default TextFile;
