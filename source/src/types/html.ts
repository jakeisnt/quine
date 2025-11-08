// All tags supported by the browser.

// @ts-ignore
type NativeHtmlTag = keyof HTMLElementTagNameMap;

// Any acceptable tag, including components.
type HtmlTag = NativeHtmlTag | string;

// A generic HTML attribute.
// Doesn't type specific tag names.
// Allows passing anything.
type GenericAttribute = { [key: string]: any };

// A generic HTML attribute for a specific tag.
type HtmlAttributes<T extends HtmlTag> = T extends keyof HTMLElementTagNameMap
  ? Partial<HTMLElementTagNameMap[T]>
  : GenericAttribute;

// HTML nodes that are never rendered.
// These should be discarded if found in the tree.
type FalsyHtmlNode = undefined | null;

type HtmlTerminalNode = Node | string | FalsyHtmlNode;

// An HTML node available to our DSL.
type HtmlNode = string | HtmlTagNode | HtmlNode[] | HtmlTerminalNode;

// A compound HTML tag.
// Optionally allows the user to configure the HTML with attributes.
type HtmlTagNode =
  | [HtmlTag]
  | [HtmlTag, ...HtmlNode[]]
  | [HtmlTag, HtmlAttributes<HtmlTag>, ...HtmlNode[]]
  // NOTE: this should be the same type as the above.
  // but typescript is having trouble reading it?
  | [HtmlTag, HtmlAttributes<HtmlTag>, ...string[]]
  | [NativeHtmlTag]
  | [NativeHtmlTag, ...HtmlNode[]]
  | [NativeHtmlTag, HtmlAttributes<NativeHtmlTag>, ...HtmlNode[]]
  | [NativeHtmlTag, HtmlAttributes<NativeHtmlTag>, ...string[]];

type PageSyntax = HtmlNode;

// A dependency on another file.
type Dependency = {
  src: string;
};

export type {
  NativeHtmlTag,
  HtmlTag,
  PageSyntax,
  HtmlNode,
  HtmlTagNode,
  HtmlAttributes,
  HtmlTerminalNode,
  Dependency,
};
