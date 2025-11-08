import type { Path } from "../../src/utils/path";
import type { PageSyntax } from "../../src/types/html";
import { File } from "../../src/file/classes";

// List of folders that shows folder contents.
const folderIndexPageTable = ({
  files,
  url,
  sourceDir,
}: {
  files: File[];
  url: URL;
  sourceDir: Path;
}): PageSyntax => {
  return [
    "div",
    { class: "folder-index-page-table" },
    [
      "table",
      files.map((childFile) => {
        const lastLog = childFile.lastLog;

        return [
          "tr",
          ["td", { class: "file-hash-tr" }, lastLog?.shortHash],
          [
            "td",
            { class: "file-name-tr" },
            [
              "a",
              {
                href: childFile.htmlUrl({
                  url,
                  sourceDir,
                }),
              },
              childFile.name,
            ],
          ],
          ["td", { class: "file-type-tr" }, childFile.extension],
          [
            "td",
            {
              class: lastLog?.date ? "file-date-tr" : "file-date-untracked-tr",
            },
            lastLog?.date ?? "untracked",
          ],
        ];
      }),
    ],
  ];
};

const FolderIndex = (args) => ({
  dependsOn: [],
  body: folderIndexPageTable(args),
});

export default FolderIndex;
