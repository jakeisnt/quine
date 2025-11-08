// utilities for creating cli programs
import { makeSpaces } from "./string";
import { bold, color } from "./printstyle";

/**
 * Configure a single command line option.
 */
class Option {
  public name: string;
  public apply: Function;
  public description: string;
  private creator: CLI;

  constructor(name: string, creator: CLI) {
    this.name = name;
    this.description = "";
    this.apply = () => {};
    this.creator = creator;
  }

  /**
   * Provide a description for this CLI option.
   */
  describe(desc: string) {
    this.description = desc;
    return this;
  }

  /**
   * Add an action to be called with this CLI option.
   */
  action(fn: () => any) {
    this.apply = fn;
    return this;
  }

  /**
   * Create the next CLI option.
   * @param name the name of the next option.
   */
  option(name: string) {
    return this.creator.option(name);
  }

  /**
   * Execute this CLI option.
   * Allows us to execute the CLI regardless of where we are
   * in the builder process.
   */
  exec(args: string[]) {
    return this.creator.exec(args);
  }
}

class CLI {
  private name = "";
  private options: Option[] = [];
  private description: string = "";

  constructor(name: string = "<command>") {
    this.name = name;
    this.options = [];
  }

  option(name: string) {
    const option = new Option(name, this);
    this.options.push(option);
    return option;
  }

  describe(desc: string) {
    this.description = desc;
    return this;
  }

  exec(args: string[]) {
    this.addHelpOption();
    const option = this.options.find((o) => o.name === args[0]);

    if (option) {
      option.apply(args.slice(1));
    } else {
      this.printHelp();
    }
  }

  // add the help option
  // the help option needs to reference `this`,
  // so it can't be added in the constructor
  addHelpOption() {
    this.option("help")
      .describe("Show help")
      .action(() => this.printHelp());

    return this;
  }

  printHelp() {
    console.log(
      `${bold(this.name)}${this.description ? `: ${this.description}` : ""}\n`
    );

    const maxNameLength = this.options.reduce(
      (max, o) => Math.max(max, o.name.length),
      0
    );

    this.options.forEach((o) => {
      const spaces = makeSpaces(maxNameLength - o.name.length);
      console.log(`  ${color(o.name, "blue")} ${spaces} ${o.description}`);
    });
  }
}

/**
 * Create a new CLI.
 * @param args the string of arguments passed to the cli wehn created.
 *
 * api:
 * cli('name')
 *   .describe('description')
 *   .option(name).describe(desc).action(fn)
 *   .option(name).describe(desc).action(fn)
 *   .exec(argv)
 */
function cli(...args: string[]) {
  return new CLI(...args);
}

export { cli };
