import { makeSpaces } from "utils/string";

import { expect, test } from "bun:test";

test("makeSpaces", () => {
  expect(makeSpaces(1)).toEqual(" ");
  expect(makeSpaces(2)).toEqual("  ");
  expect(makeSpaces(3)).toEqual("   ");
  expect(makeSpaces(4)).toEqual("    ");
});
