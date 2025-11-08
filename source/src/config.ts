import { Path } from "./utils/path";
import { URL } from "./utils/url";
import type { PageSettings } from "./types/site";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

interface QuineConfig {
  siteName: string;
  url: string;
  port?: number;
  websocketPath?: string;
  sourceDir: string;
  targetDir: string;
  resourcesDir: string;
  faviconsDir: string;
  ignorePaths: string[];
  deploymentBranch?: string;
}

/**
 * Load configuration from quine.config.json or use defaults
 */
export function loadConfig(configPath?: string): PageSettings & { deploymentBranch: string } {
  // Default configuration
  const defaults: QuineConfig = {
    siteName: "My Quine Site",
    url: "http://localhost:4242",
    port: 4242,
    websocketPath: "/__devsocket",
    sourceDir: "./",
    targetDir: "./docs",
    resourcesDir: "./resources",
    faviconsDir: "./favicons",
    ignorePaths: [".git", "node_modules"],
    deploymentBranch: "production",
  };

  let config: QuineConfig = defaults;

  // Try to load config file
  const configFilePath = configPath || resolve(process.cwd(), "quine.config.json");
  if (existsSync(configFilePath)) {
    try {
      const fileContent = readFileSync(configFilePath, "utf-8");
      const userConfig = JSON.parse(fileContent) as Partial<QuineConfig>;
      config = { ...defaults, ...userConfig };
      console.log(`[config] Loaded configuration from ${configFilePath}`);
    } catch (error) {
      console.error(`[config] Failed to load config from ${configFilePath}:`, error);
      console.log("[config] Using default configuration");
    }
  } else {
    console.log(`[config] No config file found at ${configFilePath}, using defaults`);
  }

  // Convert string paths to Path objects
  const sourceDir = Path.create(config.sourceDir);
  const targetDir = Path.create(config.targetDir);
  const resourcesDir = Path.create(config.resourcesDir);
  const faviconsDir = Path.create(config.faviconsDir);
  const fallbackSourceDir = sourceDir;

  // Convert ignore paths to absolute paths
  const ignorePaths = config.ignorePaths.map((p) => {
    const path = Path.create(p);
    // Check if path is absolute by seeing if it starts with /
    return p.startsWith("/") ? path.toString() : sourceDir.join(p).toString();
  });

  return {
    siteName: config.siteName,
    sourceDir,
    targetDir,
    fallbackSourceDir,
    url: URL.create(config.url),
    resourcesDir,
    faviconsDir,
    ignorePaths,
    websocketPath: config.websocketPath || "/__devsocket",
    deploymentBranch: config.deploymentBranch || "production",
  };
}

/**
 * Get the deployment branch from config
 */
export function getDeploymentBranch(config: ReturnType<typeof loadConfig>): string {
  return config.deploymentBranch;
}
