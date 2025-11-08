import { Path } from "utils/path";
import type { Dependency, PageSyntax } from "../types/html";
import type { PageSettings } from "../types/site";

// Support the Component interface.
// Resolves dependencies automatically and allows partial page refresh.

/**
 * Convert a Path-specified dependency into an HTML tag.
 * Usually used to pull them into frontmatter.
 *
 * Places the dependencies where we expect them to be.
 * That is -- relative to targetDir.
 */
const getDependencyHelp = (
  path: Path,
  etc: object = {},
  cfg: PageSettings
): PageSyntax => {
  const extension = path.extension;
  switch (extension) {
    case "ts":
      return getDependencyHelp(path.replaceExtension("js"), etc, cfg);
    case "js":
      return [
        "script",
        {
          type: "module",
          ...etc,
          src: path.toString().replace(cfg.sourceDir.toString(), ""),
        },
      ];
    case "scss":
      return getDependencyHelp(path.replaceExtension("css"), etc, cfg);
    case "css":
      return [
        "link",
        {
          rel: "stylesheet",
          ...etc,
          href: path.toString().replace(cfg.sourceDir.toString(), ""),
        },
      ];
    default:
      throw new Error(`Unknown extension: ${extension}`);
  }
};

/**
 * `getDependency` with a nicer arg structure.
 */
const getDependency = (dep: { src: Path }, cfg: PageSettings) => {
  const { src, ...rest } = dep;
  return getDependencyHelp(src, rest, cfg);
};

const componentCache: { [key: string]: Function } = {};

/**
 * Require a component from disk.
 */
const requireComponent = (name: string, sourceDir: Path) => {
  const maybeComponent = componentCache[name];
  if (maybeComponent) {
    return maybeComponent;
  }
  const rootPath = sourceDir;
  const componentDir = `${rootPath}/components/${name}`;
  const componentFunction = require(`${componentDir}/${name}.js`).default;

  componentCache[name] = componentFunction;
  return componentFunction;
};

// SHORTCUT: dependency paths are relative to the source repo.
// we expect paths like /resources/a and /resources/b,
// then chop those up here.
const parseDependencies = (deps: Dependency[]) => {
  return deps.map((dep) => ({ ...dep, src: Path.create(dep.src) }));
};

/**
 * Render a JS component.
 * @param name the name of the component
 * @param args arguments to pass to that component.
 * @returns the component
 */
const component = (
  name: string,
  args: Object | undefined,
  config: PageSettings
): { dependsOn: Dependency[]; body: PageSyntax } => {
  const componentFunction = requireComponent(name, config.sourceDir);
  const { dependsOn: dependsOnRaw, body } = componentFunction(args);

  const dependsOn = parseDependencies(dependsOnRaw);
  const componentWithDependencies = [
    dependsOn.map((v) => getDependency(v, config)),
    body,
  ];

  return { dependsOn: dependsOnRaw, body: componentWithDependencies };
};

export { component };
