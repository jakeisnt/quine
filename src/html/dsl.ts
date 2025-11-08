// a hiccup-like HTML domain specific language
// inspired by https://gist.github.com/hns/654226

import { isArray } from "utils/array";
import { component } from "./components";
import type {
  PageSyntax,
  HtmlAttributes,
  HtmlTag,
  HtmlNode,
  Dependency,
} from "../types/html";
import { isHtmlAttributes } from "./parseDSL";

/**
 * Convert HTML to a string.
 */
function html(...args: PageSyntax[]) {
  let buffer: string[] = [];
  let dependencies: Dependency[] = [];
  build(args, buffer, dependencies);

  return {
    dependsOn: dependencies,
    body: buffer.join(""),
  };
}

/**
 * Render a PageSyntax node to an HTML page string.
 * Include front matter that configures the document as a whole.
 */
function htmlPage(...args: PageSyntax[]) {
  const { dependsOn, body } = html(...args);
  return {
    dependsOn,
    body: `<!DOCTYPE html>${body}`,
  };
}

/**
 * Build the HTML attributes between the tag.
 * @param attrs the attributes to build into the JS.
 * @param buffer buffer to queue the changes to.
 */
function buildAttributes(attrs: HtmlAttributes, dependencies: Dependency[]) {
  if (!attrs || Object.keys(attrs).length === 0) {
    return "";
  }

  // The buffer starts with an empty string so the `.join`
  // operation prefixes the attributes with a space if they exist!
  const buffer: string[] = [""];
  for (var key in attrs) {
    buffer.push(`${key}="${attrs[key]?.toString()}"`);
  }

  if (attrs.href) {
    dependencies.push({ src: attrs.href });
  }

  if (attrs.src) {
    dependencies.push({ src: attrs.src });
  }

  return buffer.join(" ");
}

/**
 * Build a custom component.
 * @param name the name of the component
 * @param args the arguments to the component
 */
function buildComponent(
  name: string,
  args: object,
  buffer: string[],
  dependencies: Dependency[]
) {
  const { dependsOn, body } = component(name, args);
  build(body, buffer, dependencies);
  dependencies.push(...dependsOn);
}

/**
 * Build a single HTML tag.
 * The callback proceeds to build the rest of the page sequentially.
 */
function buildTag(
  tagName: string,
  attributes: HtmlAttributes,
  buffer: string[],
  dependencies: Dependency[],
  list: HtmlNode,
  index: number
) {
  const isComponent = tagName[0] === tagName[0].toUpperCase();

  if (isComponent) {
    buildComponent(
      tagName,
      { ...attributes, children: list?.slice(index) },
      buffer,
      dependencies
    );
    return;
  }

  // Create the start of the tag: <tag { .. attrs .. }>
  buffer.push(`<${tagName}${buildAttributes(attributes, dependencies)}>`);

  // Build the contents of the tag - an arbitrary array of elements.
  buildRest(list, index, buffer, dependencies);

  // Close the tag: </ tag >
  buffer.push(`</${tagName}>`);
}

/**
 * Build an HTML configuration from the list of nodes,
 * adding the stringified representation to the buffer.
 */
function build(list: HtmlNode, buffer: string[], dependencies: Dependency[]) {
  let index = 0;

  let nextElement = list?.[index];

  // if our next element is the start of an HTML tag:
  if (typeof nextElement === "string") {
    // split the tag to get potential `id` or `class` syntax from the tag name.
    const [tagName, attr] = splitTag(nextElement);
    index += 1;

    let attributesToUse = attr;
    nextElement = list?.[index];

    // If, after the tag, we have more attributes,
    // merge them with the attributes we found when splitting the tag.
    if (isHtmlAttributes(nextElement)) {
      attributesToUse = mergeAttributes(attr, nextElement);
      index += 1;
    }

    buildTag(tagName, attributesToUse, buffer, dependencies, list, index);
  } else {
    // if we don't have a tag, we know we have an array of tags. Process those.
    buildRest(list, index, buffer, dependencies);
  }
}

/**
 * Build an arbitrary HTML node.
 * @param list the HTML node(s) to process.
 * @param index our current index into the HTML node list.
 * @param buffer our output string buffer.
 */
function buildRest(
  list: HtmlNode,
  index: number,
  buffer: string[],
  dependencies: Dependency[]
) {
  const length = list?.length ?? 0;

  while (index < length) {
    var item = list?.[index++];
    if (isArray(item)) {
      build(item, buffer, dependencies);
    } else {
      // NOTE: The information is not encompassed in the type (yet)
      // but it's possible for anything in the tree to be undefined.
      // This makes it easier for us to use conditionals and return falsy
      // elements if the item isn't truthy for some reason.
      item ? buffer.push(item.toString()) : undefined;
    }
  }
}

/**
 * Merge the `class` properties of HTML attributes objects.
 * @param attr1 the attributes to merge into.
 * @param attr2 the attributes to merge into attr1.
 * @returns a compbined set of HTML attributes
 */
function mergeAttributes(attr1: HtmlAttributes, attr2: HtmlAttributes) {
  for (var key in attr2) {
    if (!attr1.hasOwnProperty(key)) {
      attr1[key] = attr2[key];
    } else if (key === "class") {
      attr1[key] += " " + attr2[key];
    }
  }

  return attr1;
}

/**
 * Split a tag name into the tag followed by some attributes.
 * This allows us to support Hiccup-like configuration such as:
 * 'div.className#htmlId' -> <div class="className" id="htmlId"> ... </div>
 *
 * @param tag the tag name to split out
 * @returns the tag name and corresponding HTML attributes to set -- if any.
 */
function splitTag(tag: string): [HtmlTag, HtmlAttributes] {
  let attr: HtmlAttributes = {};
  let match = tag.match(/([^\s\.#]+)(?:#([^\s\.#]+))?(?:\.([^\s#]+))?/);
  if (match?.[2]) attr.id = match[2];
  if (match?.[3]) attr.class = match[3].replace(/\./g, " ");
  return [match?.[1] as HtmlTag, attr];
}

export { html, htmlPage };
