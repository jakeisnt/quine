import { HtmlPage } from "html";
import { Path } from "utils/path";
import { TextFile } from "../file/classes";
import type { PageSyntax } from "../types/html";
import type { PageSettings } from "../types/site";

const makeHomePage = (settings: PageSettings) => {
  const { rootUrl, sourceDir, siteName, resourcesDir, faviconsDir } = settings;
  const title = "index";
  const htmlText: PageSyntax = [
    "html",
    ["Header", { title, rootUrl, siteName, resourcesDir, faviconsDir }],
    [
      "body",
      [
        "Sidebar",
        {
          path: Path.create(sourceDir),
          title,
          rootUrl,
          sourceDir,
        },
      ],
      [
        "div",
        { class: "site-body" },
        [
          "main",
          [
            "article",
            { class: "wikipage aboutMe" },
            ["p", "Hey, I'm Jake Chvatal."],
            ["p", "I'm a software engineer based in Stockholm, Sweden."],
            [
              "p",
              "During the day, I work at ",
              [
                "a",
                { class: "external", href: "https://improvin.com" },
                "Improvin'",
              ],

              ", building tools to help food companies reduce their environmental impact.",
            ],
            [
              "p",
              "On nights and weekends, I ",
              ["a", { class: "internal", href: "/pages/index.html" }, "write"],
              ", take ",
              [
                "a",
                { class: "external", href: "https://instagram.com/jakeisnt" },
                "photos",
              ],
              ", and design simple hardware and software tools.",
            ],
            ["LastFM"],
          ],
        ],
      ],
    ],
  ];

  return HtmlPage.create(htmlText, settings).toString();
};

class HomePage extends TextFile {
  serve(settings: PageSettings) {
    return {
      contents: makeHomePage(settings),
      mimeType: "text/html",
    };
  }
}

const homePage = (cfg: PageSettings) => {
  return new HomePage(Path.create(""), cfg);
};

export { homePage };
