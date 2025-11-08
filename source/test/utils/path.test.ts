import { Path } from "utils/path";
import { expect, test } from "bun:test";

test("Create a normalized absolute path", () => {
  expect(Path.create("/")).toEqual(new Path("/"));
  expect(Path.create("/a/b/c")).toEqual(Path.create("/a/b/c/"));
});

test("Create a relative path", () => {
  expect(Path.create("./test").pathArray).toEqual(
    Path.create(process.cwd() + "/test").pathArray
  );
});

test("Get the parent of a path", () => {
  expect(Path.create("/a/b/c").parent).toEqual(Path.create("/a/b"));
  expect(Path.create("/a/b/c/").parent).toEqual(Path.create("/a/b"));
  expect(Path.create("/").parent).toEqual(Path.create("/"));
});

test("replaceExtension", () => {
  expect(Path.create("/a/b/c").replaceExtension("js")).toEqual(
    Path.create("/a/b/c.js")
  );
  expect(Path.create("/a/b/c").replaceExtension("")).toEqual(
    Path.create("/a/b/c")
  );
  expect(Path.create("/a/b/c.js").replaceExtension("ts")).toEqual(
    Path.create("/a/b/c.ts")
  );
  expect(Path.create("/a/b/c.js.html").replaceExtension()).toEqual(
    Path.create("/a/b/c.js")
  );
});

test("relativeTo poop", () => {
  const path = Path.create(
    "/Users/jake/Desktop/personal/site/resources/style.css"
  );

  const relative = path.relativeTo(
    "/Users/jake/Desktop/personal",
    "/Users/jake/wiki"
  );
  expect(relative).toEqual(
    new Path("/Users/jake/wiki/site/resources/style.css")
  );
});

test("relativeTo paths", () => {
  const path = Path.create("/a/b/c");
  const relative = path.relativeTo("/a");
  expect(relative).toEqual(new Path("/b/c"));
});

test("extension", () => {
  expect(Path.create("/a/b/c").extension).toEqual(null);
  expect(Path.create("/a/b/c.md").extension).toEqual("md");
  expect(Path.create("/a/b/c.md").extension).toEqual("md");

  // test the extensions of directories
  expect(Path.create("/a/b/c").extension).toEqual(null);
  expect(Path.create("/a/b/c/").extension).toEqual(null);
});

test("isRootPath", () => {
  expect(Path.create("/").isRootPath()).toEqual(true);
  expect(Path.create("").isRootPath()).toEqual(false);
  expect(Path.create("/a").isRootPath()).toEqual(false);
  expect(Path.create("/a/b/c").isRootPath()).toEqual(false);
});
