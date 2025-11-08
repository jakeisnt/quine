import { HtmlPage } from "html";
import { expect, test } from "bun:test";

const PAGE_SETTINGS = {
  rootUrl: "http://localhost:3000",
  sourceDir: "/",
  siteName: "Jake Chvatal",
  targetDir: "/",
  resourcesDir: "/",
  faviconsDir: "/",
};

test("Create an HtmlPage", () => {
  // create just html
  const page = HtmlPage.create(
    ["html", ["body", ["h1", "hello world"]]],
    PAGE_SETTINGS
  );

  expect(page.toString()).toEqual(
    "<!DOCTYPE html><html><body><h1>hello world</h1></body></html>"
  );
});

// create an html page with a table and a complex set of links
test("Create an HtmlPage with a table", () => {
  const page = HtmlPage.create(
    [
      "html",
      [
        "body",
        [
          "table",
          [
            "tr",
            ["td", ["a", { href: "http://localhost:3000" }, "hello world"]],
          ],
        ],
      ],
    ],
    PAGE_SETTINGS
  );

  expect(page.toString()).toEqual(
    '<!DOCTYPE html><html><body><table><tr><td><a href="http://localhost:3000">hello world</a></td></tr></table></body></html>'
  );
});

// create an html page with an a tag, a href, a script, an img, and a link
test("Create an HtmlPage with a tag, href, etc..", () => {
  const page = HtmlPage.create(
    [
      "html",
      [
        "body",
        [
          "a",
          { href: "http://localhost:3000" },
          "hello world",
          ["img", { src: "http://localhost:3000" }],
          ["script", { src: "http://localhost:3000" }],
          ["link", { href: "http://localhost:3000" }],
        ],
      ],
    ],
    PAGE_SETTINGS
  );

  expect(page.toString()).toEqual(
    '<!DOCTYPE html><html><body><a href="http://localhost:3000">hello world<img src="http://localhost:3000"></img><script src="http://localhost:3000"></script><link href="http://localhost:3000"></link></a></body></html>'
  );
});

test("Create an HTML page with some inline styles and javascript", () => {
  const page = HtmlPage.create(
    [
      "html",
      [
        "body",
        [
          "h1",
          { style: "color: red;" },
          "hello world",
          ["script", "alert('hello world')"],
        ],
      ],
    ],
    PAGE_SETTINGS
  );

  expect(page.toString()).toEqual(
    "<!DOCTYPE html><html><body><h1 style=\"color: red;\">hello world<script>alert('hello world')</script></h1></body></html>"
  );
});
