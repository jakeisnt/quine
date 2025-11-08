import { readFile } from "../../src/file";
import { Path } from "../../src/utils/path";
import { expect, test, describe } from "bun:test";
import { PAGE_SETTINGS } from "../testConstants";

describe("basic file resolution", () => {
  test("resolves typescript files", () => {
    const tsFile = readFile(
      Path.create("./src/file/filetype/ts.ts"),
      PAGE_SETTINGS
    );
    expect(tsFile).toBeTruthy();
    expect(tsFile?.extension).toBe("ts");
    expect(tsFile?.mimeType).toBe("text/typescript");
  });

  test("resolves scss files", () => {
    const cssFile = readFile(
      Path.create("./resources/global.scss"),
      PAGE_SETTINGS
    );
    expect(cssFile).toBeTruthy();
    expect(cssFile?.extension).toBe("scss");
    expect(cssFile?.mimeType).toBe("text/x-scss");
  });
});

describe("directory handling", () => {
  test("resolves directory", () => {
    const dir = readFile(Path.create("./src/file/filetype/"), PAGE_SETTINGS);
    expect(dir).toBeTruthy();
    expect(dir?.isDirectory()).toBe(true);
  });

  test("lists directory contents correctly", () => {
    const dir = readFile(Path.create("./src/file/filetype/"), PAGE_SETTINGS);
    if (dir?.isDirectory()) {
      const children = dir.contents();
      expect(children).toBeTruthy();
      expect(children?.some((f) => f.name === "css.ts")).toBe(true);
      expect(children?.some((f) => f.name === "ts.ts")).toBe(true);
      expect(children?.some((f) => f.name === "html.ts")).toBe(true);
    }
  });

  test("handles nested directories", () => {
    const dir = readFile(Path.create("./src/file/"), PAGE_SETTINGS);
    if (dir?.isDirectory()) {
      const children = dir.contents();
      expect(children?.some((f) => f.name === "filetype")).toBe(true);
      expect(children?.some((f) => f.name === "classes")).toBe(true);
    }
  });
});

describe("typescript to javascript resolution", () => {
  test("resolves .js to .ts file", () => {
    const jsFile = readFile(
      Path.create("./src/file/filetype/css.js"),
      PAGE_SETTINGS
    );
    expect(jsFile).toBeTruthy();
    expect(jsFile?.path.toString()).toContain("css.ts");
  });

  test("resolves .jsx to .tsx file", () => {
    const jsxFile = readFile(
      Path.create("./src/components/Article/Article.jsx"),
      PAGE_SETTINGS
    );
    expect(jsxFile).toBeTruthy();
    expect(jsxFile?.path.toString()).toContain("Article.ts");
  });

  test("maintains file identity when accessed different ways", () => {
    const tsPath = Path.create("./src/file/filetype/css.ts");
    const jsPath = Path.create("./src/file/filetype/css.js");

    const tsFile = readFile(tsPath, PAGE_SETTINGS);
    const jsFile = readFile(jsPath, PAGE_SETTINGS);

    if (tsFile && jsFile) {
      expect(tsFile.path).toEqual(jsFile.path);
    } else {
      throw new Error("File not found");
    }
  });
});

describe("edge cases", () => {
  test("handles files with multiple extensions", () => {
    const file = readFile(
      Path.create("./test/readFile.test.ts.html"),
      PAGE_SETTINGS
    );
    expect(file).toBeTruthy();
    expect(file?.extension).toBe("html");
  });

  test("handles case sensitivity correctly", () => {
    const lowerCase = readFile(
      Path.create("./src/file/filetype/css.ts"),
      PAGE_SETTINGS
    );
    const upperCase = readFile(
      Path.create("./SRC/FILE/FILETYPE/CSS.TS"),
      PAGE_SETTINGS
    );
    if (lowerCase && upperCase) {
      expect(lowerCase.path).toEqual(upperCase.path);
    } else {
      throw new Error("File not found");
    }
  });

  test("handles path traversal attempts", () => {
    const file = readFile(
      Path.create("./src/../src/file/filetype/css.ts"),
      PAGE_SETTINGS
    );
    expect(file).toBeTruthy();
    expect(file?.path.toString()).not.toContain("..");
  });
});

describe("file metadata", () => {
  test("provides correct mime types", () => {
    const types = [
      { path: "./src/file/filetype/css.ts", mime: "text/typescript" },
      { path: "./resources/global.scss", mime: "text/x-scss" },
      { path: "./src/file/filetype/html.ts", mime: "text/typescript" },
    ];

    for (const { path, mime } of types) {
      const file = readFile(Path.create(path), PAGE_SETTINGS);
      expect(file?.mimeType).toBe(mime);
    }
  });

  test("provides correct file names", () => {
    const file = readFile(
      Path.create("./src/file/filetype/css.ts"),
      PAGE_SETTINGS
    );
    expect(file?.name).toBe("css.ts");
    expect(file?.title).toBe("css");
  });
});
