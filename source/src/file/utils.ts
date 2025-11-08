import type File from "./classes/file";
import type Directory from "./filetype/directory";
import type { PageSettings } from "../types/site";
import { readFile } from "./index";

/**
 * Utility functions for working with files.
 * These are separate from the File class to avoid circular dependencies.
 */

/**
 * Get the parent directory of a file.
 * This is extracted from File.directory() to break circular dependencies.
 */
export function getFileDirectory(file: File, cfg?: PageSettings): Directory {
  const config = cfg ?? file.cachedConfig;
  return readFile(file.path.parent, config) as unknown as Directory;
}
