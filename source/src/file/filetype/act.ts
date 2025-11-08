// act is a custom filetype I have designed to be used with acting scripts.

// @ts-nocheck

import { TextFile } from "file/classes";
import * as ohm from "ohm-js";

const grammar = ohm.grammar(`
Act {
  Exp
    = (Title
    | Alias
    | Line
    | Subtext
    | Comment)+

  Title
    = "#" astring "/n"

  Alias
    = astring "=" astring "/n"

  Line
    = astring ": " Message "/n"

  Subtext
    = "(" Message ")" "/n"

  Comment
    = "-" astring "/n"

 Message
   = (astring | Italic)+

Italic
   = "/" astring "/"

//  a string with any number of uppercase, lowercase letters
astring
  = letter alnum*
}
`);

// a CSS file is a text file
class ActFile extends TextFile {
  static filetypes = ["act"];
}

export default ActFile;
