// command execution made stupid simple
import { promisify } from "util";

const exec = promisify(require("child_process").exec);
const execSync = require("child_process").execSync;

export { exec, execSync };
