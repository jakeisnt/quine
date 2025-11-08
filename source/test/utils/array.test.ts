import { isArray } from "utils/array";

import { expect, test } from "bun:test";

test("isArray", () => {
  expect(isArray([])).toEqual(true);
  expect(isArray({})).toEqual(false);
  expect(isArray("")).toEqual(false);
  expect(isArray(1)).toEqual(false);
  expect(isArray(null)).toEqual(false);
  expect(isArray(undefined)).toEqual(false);
});
