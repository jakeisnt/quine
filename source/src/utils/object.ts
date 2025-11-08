/**
 * Determine whether an item is an object.
 */
function isObject(item: any): item is Object {
  return item instanceof Object && item.constructor !== Array;
}

export { isObject };
