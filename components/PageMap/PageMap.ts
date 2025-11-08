import { findTags } from "html";

const makePageMap = ({ articleHtml, file, rootDir, sourceDir }) => {
  const tags = findTags(articleHtml, ["h1", "h2", "h3", "h4", "h5", "h6"]);
  const link = file.htmlUrl({ rootDir, sourceDir });

  return [
    "div",
    { class: "sitemap-container" },
    ["span", { class: "sitemap-title" }, "In this article"],
    [
      "table",
      { class: "sitemap" }["tbody"].concat(
        tags.map((tag) => [
          "tr",
          ["td", { class: "sitemap-indent" }, tag.depth],
          [
            "td",
            { class: "sitemap-link" },
            ["a", { href: `${link}#${tag.id}` }, tag.text],
          ],
        ])
      ),
    ],
  ];
};

const PageMap = (args) => ({
  dependsOn: [],
  body: makePageMap(args),
});

export default PageMap;
