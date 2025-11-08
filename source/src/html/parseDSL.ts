import { isObject } from "utils/object";
import { isArray } from "utils/array";
import type {
  HtmlTag,
  HtmlNode,
  HtmlTagNode,
  PageSyntax,
  HtmlAttributes,
} from "../types/html";

/**
 * Is `attrs` a set of HTML attributes`
 */
const isHtmlAttributes = <T extends HtmlTag>(
  attrs: any
): attrs is HtmlAttributes<T> => {
  return isObject(attrs);
};

// Utilities for parsing the HTML DSL internal to this project.

/**
 * Get the name of a tag.
 */
const tagName = ([name]: HtmlTagNode) => name;

/**
 * Get the attributes object of a tag.
 */
const tagAttributes = <T extends HtmlTag>([, attributes]: HtmlTagNode):
  | HtmlAttributes<T>
  | undefined => {
  return isHtmlAttributes<T>(attributes) ? attributes : undefined;
};

/**
 * Collect elements from an HTML page that meet the provided predicate.
 */
const collectElements = (
  htmlPage: PageSyntax,
  predicate: (node: HtmlNode) => boolean
): HtmlNode[] => {
  // assume we only look for roots, so we return directly here lol
  if (predicate(htmlPage)) {
    return [htmlPage];
  } else if (isArray(htmlPage)) {
    // if we can act on the contents:
    const results = htmlPage.flatMap((tag) =>
      collectElements(tag as HtmlNode, predicate)
    );
    return results;
  }

  return [];
};

/**
 * Find html elements with the given tag names on an html page
 */
const findTags = (htmlPage: PageSyntax, tags: HtmlTag[]) => {
  return collectElements(
    htmlPage,
    (tl: HtmlNode) =>
      (isHtmlTagNode(tl) && tl?.[0] && tags.includes(tl?.[0])) || false
  );
};

const isHtmlTagNode = (v: any): v is HtmlTagNode => {
  return isArray(v);
};

/**
 * Get the link(s) embedded in an HTML tag
 * for example, the 'href' field of an <a> tag,
 * the 'link' of a 'style' tag,
 * or the 'src' of a 'script' tag.
 */
const getTagLink = (tag: HtmlNode): string | undefined => {
  if (!isHtmlTagNode(tag)) {
    return;
  }

  const name = tagName(tag);
  const attrs = tagAttributes(tag);

  // NOTE: There is a bug here where some attrs to an a tag are null. Not sure why.
  switch (true) {
    case ["a", "href", "link"].includes(name):
      return attrs?.["href"];
    case ["img", "script"].includes(name):
      return attrs?.["src"];
    default:
      throw new Error(
        `No link found in tag, invalid input to getLinkTag: ${tag.toString()}`
      );
  }
};

export { isHtmlAttributes, findTags, getTagLink };
