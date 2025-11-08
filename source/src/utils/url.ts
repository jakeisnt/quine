// URL module.
// For now, wrap the internal Node API to defensively abstract
// ++ give us a `create` function to call.

class InternalURL extends URL {
  static create(urlPath: string) {
    return new this(urlPath);
  }
}

export { InternalURL as URL };
