import { Path } from "./path";

// Cache results.

/**
 * Fun utility for cacheing stuff
 */
const cache = false;

const fileCache: { [key: string]: File } = {};

const withCache = (path: Path, makeFile: (path: Path) => File | undefined) => {
  if (!cache) return makeFile(path);
  if (!fileCache[path.toString()]) {
    const res = makeFile(path);
    if (!res) return;
    fileCache[path.toString()] = res;
  }
  return fileCache[path.toString()];
};

export { withCache };
