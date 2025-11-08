import { TextFile } from "file/classes";

// a CSS file is a text file
class MarkdownFile extends TextFile {
  static filetypes = ["md"];
}

export default MarkdownFile;
