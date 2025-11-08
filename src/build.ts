import { readFile } from "./file";
import type { PageSettings } from "./types/site";
import { File } from "./file/classes";

/**
 * Recursively build a website, starting with
 * the provided file and building all of its dependencies.
 */
const buildSiteFromFile = (
  file: File,
  settings: PageSettings,
  filesSeenSoFar: Set<string>
) => {
  if (filesSeenSoFar.has(file.path.toString())) return;
  filesSeenSoFar.add(file.path.toString());

  file.write(settings);

  file.dependencies(settings).map((dependencyFile) => {
    buildSiteFromFile(dependencyFile, settings, filesSeenSoFar);
  });
};

/**
 * Build a site from a configuration.
 */
const buildFromPath = (settings: PageSettings) => {
  const { sourceDir, targetDir, ignorePaths } = settings;

  // Start off from the root, source dir,
  // Pootstrap the process by reading the root file as HTML.
  const dir = readFile(sourceDir.toString() + "/index.html", settings);

  console.log("Starting with", dir.path.toString());

  // If we've already seen a file path, we should ignore it.
  // Ignore paths the user is provided and the target dir --
  // the target dir could be a subdirectory of the source dir
  // and we don't want to build the site into itself.
  const filePathsSeenSoFar = new Set([
    ...(ignorePaths ?? []),
    ...(ignorePaths ?? []).map((p) => p + ".html"),
    targetDir.toString(),
    // hardcode in the .git ignore path so i dont fuck up
    sourceDir + "/.git",
    sourceDir + "/.direnv",
    sourceDir + "/node_modules",
    targetDir.toString() + ".html",
    targetDir.toString() + "/index.html",
  ]);

  buildSiteFromFile(dir, settings, filePathsSeenSoFar);
};

export { buildFromPath };
