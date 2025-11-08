// NOTE: This function was removed...
// We will want a sort of 'jquery for html' soon, especially for our DSL.
// That's what that does!
import { findTags } from "html";

const makePageMap = ({ articleHtml, file, url, sourceDir }) => {
  const tags = findTags(articleHtml, ["h1", "h2", "h3", "h4", "h5", "h6"]);
  const link = file.htmlUrl({ url, sourceDir });

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
