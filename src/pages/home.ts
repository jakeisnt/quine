import { HtmlPage } from "html";
import { Path } from "utils/path";
import { TextFile } from "../file/classes";
import type { PageSyntax } from "../types/html";
import type { PageSettings } from "../types/site";

const homePageSyntax = (settings: PageSettings): PageSyntax => {
  const { url, sourceDir, siteName, resourcesDir, faviconsDir } = settings;
  const title = "index";
  return [
    "html",
    { lang: "en" },
    ["Header", { title, url, siteName, resourcesDir, faviconsDir }],
    [
      "body",
      [
        "Sidebar",
        {
          path: Path.create(sourceDir),
          title,
          url,
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
              ["a", { class: "internal", href: "/src/index.html" }, "write"],
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
};

class HomePage extends TextFile {
  private htmlPage?: HtmlPage;

  private getHtmlPage(settings: PageSettings) {
    if (!this.htmlPage) {
      this.htmlPage = HtmlPage.create(homePageSyntax(settings), settings);
      this.htmlPage.toString();
    }
    return this.htmlPage;
  }

  serve(settings: PageSettings) {
    return {
      contents: this.getHtmlPage(settings).toString(),
      mimeType: "text/html",
    };
  }

  dependencies(settings: PageSettings) {
    return this.getHtmlPage(settings).dependencies(settings);
  }
}

const homePage = (cfg: PageSettings) => {
  return new HomePage(Path.create(""), cfg);
};

export { homePage };
