/**
 * Determine whether the argument is an array.
 */
function isArray(item: any): item is Array<any> {
  return item instanceof Object && item.constructor === Array;
}

export { isArray };
