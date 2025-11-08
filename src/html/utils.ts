// Utility functions for generating HTML tags.

import { escapeHTML } from "bun";

/**
 * Excape things from HTML strings to avoid rendering them in the browser.
 * Forwarded from the 'bun' implementation.
 */
const escapeHtml = (text: string) => {
  return escapeHTML(text);
};

export { escapeHtml };
