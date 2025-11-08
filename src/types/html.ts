// All tags supported by the browser.
// @ts-ignore
type NativeHtmlTag =
  | "html"
  | "body"
  | "div"
  | "img"
  | "a"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "button"
  | "script"
  | "link"
  | "meta"
  | "table"
  | "tr"
  | "td"
  | "p"
  | "span"
  | "ul"
  | "li"
  | "ol"
  | "form"
  | "input"
  | "label"
  | "select"
  | "option"
  | "textarea"
  | "header"
  | "footer"
  | "main"
  | "nav"
  | "section"
  | "article"
  | "aside"
  | "figure"
  | "figcaption"
  | "canvas"
  | "audio"
  | "video"
  | "source"
  | "track"
  | "embed"
  | "object"
  | "param"
  | "iframe"
  | "picture"
  | "svg"
  | "path"
  | "g";

// Any acceptable tag, including components.
type HtmlTag = string;

// A generic HTML attribute.
// Doesn't type specific tag names.
// Allows passing anything.
type GenericAttribute = { [key: string]: any };

type HtmlAttributes = GenericAttribute & {
  src?: string;
  href?: string;
  class?: string;
  role?: string;
  id?: string;
};

// HTML nodes that are never rendered.
// These should be discarded if found in the tree.
type FalsyHtmlNode = undefined | null;

type HtmlTerminalNode = string | FalsyHtmlNode;

// An HTML node available to our DSL.
type HtmlNode = string | HtmlTagNode | HtmlNode[] | HtmlTerminalNode;

// A compound HTML tag.
// Optionally allows the user to configure the HTML with attributes.
type HtmlTagNode =
  | [HtmlTag]
  | [HtmlTag, ...HtmlNode[]]
  | [HtmlTag, HtmlAttributes, ...HtmlNode[]]
  // NOTE: this should be the same type as the above.
  // but typescript is having trouble reading it?
  | [HtmlTag, HtmlAttributes, ...string[]];

type PageSyntax = HtmlNode;

// A dependency on another file.
type Dependency = {
  src: string;
};

export type {
  HtmlTag,
  PageSyntax,
  HtmlNode,
  HtmlTagNode,
  HtmlAttributes,
  HtmlTerminalNode,
  Dependency,
};
