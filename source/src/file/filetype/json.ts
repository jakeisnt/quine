import { SourceFile } from "file/classes";

class JSONFile extends SourceFile {
  static filetypes = ["json", "lock"];
}

export default JSONFile;
