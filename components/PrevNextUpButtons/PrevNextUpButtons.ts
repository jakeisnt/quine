import type File from "../../src/file/classes/file";
import { PageSettings } from "../../src/types/site";
import { getFileDirectory } from "../../src/file/utils";

const findFileIndex = (files: File[], file: File) => {
  return files.findIndex((f) => f.equals(file));
};

const prevNextUpHtml = ({
  file,
  url,
  sourceDir,
}: PageSettings & { file: File }) => {
  const dir = getFileDirectory(file);
  const contents = dir.contents();

  const curFileIndex = findFileIndex(contents, file);

  const prevFileIndex = curFileIndex <= 0 ? null : curFileIndex - 1;
  const nextFileIndex = curFileIndex < 0 ? null : curFileIndex + 1;

  const prevFile = (prevFileIndex && contents?.[prevFileIndex]) || null;
  const nextFile = (nextFileIndex && contents?.[nextFileIndex]) || null;

  return [
    "div",
    { class: "prev-next-up-buttons-container" },
    "Navigation",
    [
      "table",
      { class: "prev-next-up-buttons" },
      prevFile && [
        "tr",
        ["td", "Previous"],
        [
          "td",
          [
            "a",
            {
              class: "prev-button",
              href: prevFile.htmlUrl({ url, sourceDir }),
            },
            prevFile.name,
          ],
        ],
      ],
      nextFile && [
        "tr",
        ["td", "Next"],
        [
          "td",
          [
            "a",
            {
              class: "next-button",
              href: nextFile.htmlUrl({ url, sourceDir }),
            },
            nextFile.name,
          ],
        ],
      ],
      dir && [
        "tr",
        ["td", "Up"],
        [
          "td",
          [
            "a",
            { class: "up-button", href: dir.htmlUrl({ url, sourceDir }) },
            dir.name,
          ],
        ],
      ],
    ],
  ];
};

const PrevNextUpButtons = (args) => ({
  dependsOn: [],
  body: prevNextUpHtml(args),
});

export default PrevNextUpButtons;
