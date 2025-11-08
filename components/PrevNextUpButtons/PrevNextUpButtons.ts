import type File from "../../src/file/classes/file";

const findFileIndex = (files: File[], file: File) => {
  return files.findIndex((f) => f.equals(file));
};

const prevNextUpHtml = ({
  file,
  rootUrl,
  sourceDir,
}: {
  file: File;
  rootUrl: string;
  sourceDir: string;
}) => {
  const dir = file.directory();
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
              href: prevFile.htmlUrl({ rootUrl, sourceDir }),
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
              href: nextFile.htmlUrl({ rootUrl, sourceDir }),
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
            { class: "up-button", href: dir.htmlUrl({ sourceDir }) },
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
