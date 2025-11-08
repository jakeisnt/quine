import File from "./file";

/**
 * A BinaryFile is a file that we can't read or write as a string (like an image).
 */
class BinaryFile extends File {
  // the binary contents of the file
  protected asBinary = null;
}

export default BinaryFile;
