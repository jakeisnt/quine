import { PageSyntax } from "../../src/types/html";

/**
 * Construct a meta tag with a name and content.
 */
const meta = (key: string, value: string): PageSyntax => {
  return ["meta", { name: key, content: value }];
};

/**
 * Construct a meta property tag.
 */
const prop = (key: string, value: string): PageSyntax => {
  return ["meta", { property: key, content: value }];
};

/**
 * Provided an icon directory, configure page icons of the front matter.
 */
const favicons = (iconDir: string) => {
  return [];
  return [
    [
      "link",
      { rel: "icon", type: "image/x-icon", href: iconDir + "/favicon.ico" },
    ],
    [
      "link",
      { rel: "apple-touch-icon", href: iconDir + "/apple-touch-icon.png" },
    ],
  ];
};

/**
 * Configure the page color scheme.
 */
const colorScheme = (
  schemeName: string,
  backgroundColor: string
): PageSyntax => {
  return [
    "meta",
    {
      name: "theme-color",
      media: `(prefers-color-scheme: ${schemeName})`,
      content: backgroundColor,
    },
  ];
};

/**
 * Configure the color theme of this particular site. (hardcoded.)
 */
const theme = (): PageSyntax[] => {
  return [colorScheme("light", "white"), colorScheme("dark", "#111")];
};

/**
 * Generate open graph headers for this website
 * @param title the title of this specific page.
 * @param url the root URL that the site will be hosted on
 * @param siteName the name of the website as a whole.
 */
const openGraphHeaders = ({
  title,
  url,
  siteName = title,
}: {
  title: string;
  url: string;
  siteName?: string;
}): PageSyntax[] => {
  return [
    prop("og:title", title),
    prop("og:type", "website"),
    prop("og:url", url),
    prop("og:site_name", siteName),
  ];
};

// header we can use for every page
const header = ({
  title,
  targetDir,
  url,
  siteName,
  resourcesDir,
  faviconsDir,
}): PageSyntax => {
  return [
    "head",
    ["meta", { charset: "utf-8" }],
    [
      "meta",
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    ["title", `${title} / ${siteName}`],
    openGraphHeaders({ title, url, siteName }),
    meta("keywords", "jake"),
    meta("author", "Jake Chvatal"),
    meta("robots", "index,follow"),
    meta("description", "hi"),
    theme(),
    favicons(faviconsDir),
    // TODO: generate manifest.
    // ["link", { rel: "manifest", href: "/resources/manifest.json" }],
  ];
};

const Header = (args) => ({
  dependsOn: [
    { src: "resources/style.scss" },
    { src: "resources/global.scss" },
    { src: "resources/elementsstyle.scss" },
    { src: "resources/lib.ts" },
    { src: "resources/elements.ts", defer: true },
  ],
  body: header(args),
});

export default Header;
