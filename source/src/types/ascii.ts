// Types related to ASCII codes and text.

enum TerminalColors {
  red = 31,
  green = 32,
  yellow = 33,
  blue = 34,
  magenta = 35,
  cyan = 36,
  grey = 90,
}

enum KeyCodes {
  ESC = "\u001B[",
  OSC = "\u001B]",
  BEL = "\u0007",
  SEP = ";",
}

export { TerminalColors, KeyCodes };
