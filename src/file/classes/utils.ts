import type { PageSettings } from "../../types/site";
import { File } from ".";

/**
 * Convert a file, wrapping that a file in a parent.
 * The parent file dispatches to a cloned child file for info.
 */
const wrapFile = (
  sourceFile: File, // the ts file
  getText: (source: File) => string,
  {
    extension,
    addExtension = false,
    mimeType: mimeTypeArgument,
  }: {
    extension: string;
    // append the extension instead of replacing it
    addExtension?: boolean;
    mimeType?: string;
  },
  getDependencies: (source: File, settings: PageSettings) => File[] = () => []
) => {
  const wrappingFile = sourceFile.clone();

  wrappingFile.fakeFileOf = sourceFile;
  wrappingFile.path =
    sourceFile.path[addExtension ? "addExtension" : "replaceExtension"](
      extension
    );

  wrappingFile.write = (config: PageSettings) => {
    const { sourceDir, targetDir } = config;

    // Write the source file
    // This has to be done first - the target file could be dependent
    sourceFile.write(config);

    // Write the wrapping file
    let targetPath = wrappingFile.path.relativeTo(sourceDir, targetDir);
    if (sourceFile.isDirectory() && extension === "html") {
      // Convert file with name `x/folder.html` to name `x/folder/index.html`
      targetPath = targetPath.replaceExtension().join("/index.html");
    }
    targetPath.writeString(wrappingFile.text(config));

    return wrappingFile;
  };

  wrappingFile.dependencies = (settings: PageSettings) => {
    return getDependencies(sourceFile, settings);
  };

  wrappingFile.text = () => getText(sourceFile);
  wrappingFile.isDirectory = () => sourceFile.isDirectory();

  Object.defineProperty(wrappingFile, "mimeType", {
    get() {
      return mimeTypeArgument ?? wrappingFile.path.mimeType;
    },
  });

  Object.defineProperty(wrappingFile, "require", {
    get() {
      return require(sourceFile.path.toString());
    },
  });

  return wrappingFile; // the js file
};

export { wrapFile };
