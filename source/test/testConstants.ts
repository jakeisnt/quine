import { Path } from "../src/utils/path";
import { URL } from "../src/utils/url";

const PAGE_SETTINGS = {
  url: URL.create("http://localhost:3000"),
  websocketPath: "/__devsocket",
  sourceDir: Path.create("./"),
  siteName: "Jake Chvatal",
  targetDir: Path.create("./"),
  resourcesDir: Path.create("./"),
  faviconsDir: Path.create("./"),
};

export { PAGE_SETTINGS };
