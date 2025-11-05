import { readFile } from "./file";
import type { PageSettings } from "./types/site";
import { File } from "./file/classes";
import { homePage } from "./pages/home";

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

  try {
    file.write(settings);
  } catch (error) {
    console.error(`[build] Failed to write file ${file.path.toString()}:`, error);
    throw new Error(`Failed to write file ${file.path.toString()}: ${error}`);
  }

  try {
    const dependencies = file.dependencies(settings);
    dependencies.forEach((dependencyFile) => {
      try {
        buildSiteFromFile(dependencyFile, settings, filesSeenSoFar);
      } catch (error) {
        console.error(
          `[build] Failed to build dependency ${dependencyFile.path.toString()} of ${file.path.toString()}:`,
          error
        );
        // Continue with other dependencies even if one fails
      }
    });
  } catch (error) {
    console.error(`[build] Failed to get dependencies for ${file.path.toString()}:`, error);
    // Continue building even if we can't get dependencies
  }
};

/**
 * Build a site from a configuration.
 */
const buildFromPath = (settings: PageSettings) => {
  const { sourceDir, targetDir, ignorePaths } = settings;

  try {
    // Write the root file
    const rootFile = targetDir.join("/index.html");
    console.log(`[build] Writing root file to ${rootFile.toString()}`);
    rootFile.writeString(homePage(settings).serve(settings).contents);
  } catch (error) {
    console.error("[build] Failed to write root index.html:", error);
    throw new Error(`Failed to write root index.html: ${error}`);
  }

  // Read the rest of the repo under `source`.
  const cfg = { ...settings, targetDir: targetDir.join("/source") };

  // Start off from the root, source dir,
  // Bootstrap the process by reading the root file as HTML.
  const indexPath = sourceDir.join("/index.html");
  console.log(`[build] Reading source index from ${indexPath.toString()}`);

  const dir = readFile(indexPath, cfg);
  if (!dir) {
    const errorMsg = `Failed to read source index.html at ${indexPath.toString()}. Make sure the file exists and is readable.`;
    console.error(`[build] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  console.log("[build] Starting build from", dir.path.toString());

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

  try {
    buildSiteFromFile(dir, cfg, filePathsSeenSoFar);
    console.log("[build] Build completed successfully!");
  } catch (error) {
    console.error("[build] Build failed:", error);
    throw error;
  }
};

export { buildFromPath };
