import type { PageSyntax } from "../../src/types/html";
import type { PageSettings } from "../../src/types/site";
import TextFile from "../../src/file/classes/text";

/**
 * Render an 'article' using some standard style configuration.
 * An article is usually a source code file.
 */
const renderArticle = ({
  children,
  file,
  siteName,
  url,
  sourceDir,
  targetDir,
  resourcesDir,
  faviconsDir,
}: PageSettings & {
  articleHtml: PageSyntax;
  file: TextFile;
  children;
}): PageSyntax => {
  const title = file.name;

  return [
    "html",
    { lang: "en" },
    ["Header", { title, targetDir, url, siteName, resourcesDir, faviconsDir }],
    [
      "body",
      ["Sidebar", { path: file.path, title, url, sourceDir }],
      [
        "div",
        { class: "site-body" },
        [
          "main",
          [
            "article",
            { class: "wikipage" },
            ["h1", { class: "title-top" }, title],
            children,
          ],
        ],
        [
          "div",
          { class: "article-rhs-container" },
          [
            "div",
            { class: "article-rhs" },
            ["GitHistoryTable", { file }],
            ["PrevNextUpButtons", { file, url, sourceDir }],
          ],
        ],
      ],
    ],
  ];
};

const Article = (args) => ({
  dependsOn: [],
  body: renderArticle(args),
});

export default Article;
