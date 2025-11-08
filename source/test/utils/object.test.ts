import { isObject } from "utils/object";

import { expect, test } from "bun:test";

test("isObject", () => {
  expect(isObject([])).toEqual(false);
  expect(isObject({})).toEqual(true);
  expect(isObject("")).toEqual(false);
  expect(isObject(1)).toEqual(false);
  expect(isObject(null)).toEqual(false);
  expect(isObject(undefined)).toEqual(false);
});
