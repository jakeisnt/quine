import { Path } from "utils/path";
import File from "./classes/file";

import Directory from "./filetype/directory";
import TextFile from "file/classes/text";
import JavascriptFile from "./filetype/js";
import type { PageSettings } from "../types/site";

/*
 * A standard interface for interacting with files.
 *
 * Create a file with the provided path string
 * and the specific file class should handle the rest.
 *
 * Import all the files from the 'filetype' directory
 * and associate them with their filetype names.
 */

type FiletypeMap = { [key: string]: typeof File };

let filetypeMap: FiletypeMap;

// obtain a map of file to filetype
const getFiletypeMap = (cfg: PageSettings) => {
  // bootstrap the process; we know we have a directory
  const dir = new Directory(Path.create(__dirname + "/filetype/"), cfg);

  const newFiletypeMap: FiletypeMap = {};

  // Problem: to bootstrap the process, we need to know what class
  // a file is before we can create it. but we need to create it
  dir
    .contents(cfg, { omitNonJSFiles: true })
    .map((file: File) => {
      // because we have a js file, we know we can require it
      const fileClass = (file as JavascriptFile).require();
      // default to using the raw 'fileClass' if there is no default export (?)
      return fileClass?.default ?? fileClass;
    })
    .forEach((fileClass) => {
      if (!fileClass.filetypes) {
        throw new Error(
          `Filetype ${fileClass.name} does not have a 'filetypes' property`
        );
      }

      fileClass.filetypes.forEach((fileType: string) => {
        if (newFiletypeMap[fileType]) {
          throw new Error(`Filetype ${fileType} already exists`);
        }

        newFiletypeMap[fileType] = fileClass;
      });
    });

  return newFiletypeMap;
};

const fileCache: { [key: string]: File } = {};

/**
 * Given the source path of a file, return the appropriate file class.
 * @param {string} incomingPath - The source path of the file.
 * @param {Object} options - Additional options.
 * @returns {Object} The appropriate file class.
 */
const readFile = (incomingPath: string | Path, options: PageSettings): File => {
  if (!filetypeMap) {
    filetypeMap = getFiletypeMap(options);
  }

  const { sourceDir, fallbackSourceDir } = options ?? {};

  // Get the file extension
  let path = Path.create(incomingPath);

  // If the path doesn't exist, try it against a fallback
  if (!path.exists() && sourceDir && fallbackSourceDir) {
    path = path.relativeTo(sourceDir, fallbackSourceDir);
  }

  const extension = path.extension;

  if (!fileCache[path.toString()]) {
    if (!extension || !(extension in filetypeMap)) {
      console.log(
        `We don't have a filetype mapping for files with extension ${extension}. Assuming plaintext for file at path '${path.toString()}'.`
      );

      fileCache[path.toString()] = TextFile.create(path, options);
    } else {
      const FiletypeClass = filetypeMap[extension];
      fileCache[path.toString()] = FiletypeClass.create(path, options);
    }
  }

  return fileCache[path.toString()];
};

export { readFile };
