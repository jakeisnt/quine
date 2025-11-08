// styles things that print out to the cli
import { TerminalColors, KeyCodes } from "../types/ascii";

/**
 * Generate link text in the terminal.
 * @param text the text to show for the link.
 * @param url the url that the link should direct the user to.
 */
const linkText = (text: string, url: string) =>
  [
    KeyCodes.OSC,
    "8",
    KeyCodes.SEP,
    KeyCodes.SEP,
    url,
    KeyCodes.BEL,
    text,
    KeyCodes.OSC,
    "8",
    KeyCodes.SEP,
    KeyCodes.SEP,
    KeyCodes.BEL,
  ].join("");

const underlineText = (text: string) => {
  return `\u001b[4m${text}\u001b[24m`;
};

function boldText(text: string) {
  return `\x1b[1m${text}\x1b[0m`;
}

// change the color of the text when printing it out
function colorText(str: string, color: TerminalColors) {
  return "\x1b[" + TerminalColors[color] + "m" + str + "\x1b[0m";
}

/**
 * Configure the style of text to print to the console.
 */
class PrintStyle {
  private isBold = false;
  private isUnderlined = false;
  private colorName: TerminalColors | undefined;
  private text = "";
  private url: string | undefined;

  constructor(text: string) {
    this.text = text;
  }

  // bold a string when printing it out
  bold() {
    this.isBold = true;
    return this;
  }

  /**
   * add a link with a url.
   * if a url is not provided, assume the text is also the url.
   */
  link(maybeUrl?: string) {
    if (maybeUrl) {
      this.url = maybeUrl;
    } else {
      this.url = this.text;
    }
    return this;
  }

  color(colorName: string) {
    if (!(colorName in TerminalColors)) {
      throw new Error(
        `Tried to color a terminal value. ${colorName} is not a valid color`
      );
    }

    this.colorName = colorName as any as TerminalColors;
    return this;
  }

  underline() {
    this.isUnderlined = true;
    return this;
  }

  /**
   * Redefine the default toString behavior to pretty-print.
   * @returns
   */
  toString() {
    let str = this.text;
    if (this.url) {
      str = linkText(str, this.url);
    }
    if (this.isBold) {
      str = boldText(str);
    }
    if (this.colorName) {
      str = colorText(str, this.colorName);
    }

    if (this.isUnderlined) {
      str = underlineText(str);
    }

    return str;
  }
}

function style(text: string) {
  return new PrintStyle(text);
}

/**
 * Make text bold when rendering to the terminal.
 * @param text
 * @returns
 */
function bold(text: string) {
  return new PrintStyle(text).bold();
}

/**
 * Choose a color for text that's rendered to the terminal.
 * @param text the text to color
 * @param colorName the color to use for the text.
 */
function color(text: string, colorName: string) {
  return new PrintStyle(text).color(colorName);
}

/**
 * Accepts a string and a url. Prints a link.
 * If no url is provided, the text is assumed to be the url.
 */
function link(text: string, url?: string) {
  return new PrintStyle(text).link(url);
}

/**
 * Prints an underlined version of the text.
 */
function underline(text: string) {
  return new PrintStyle(text).underline();
}

export { style, bold, color, link, underline };
