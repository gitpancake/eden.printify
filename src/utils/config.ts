import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export interface Config {
  printifyApiToken: string;
  defaultProductJsonPath: string;
}

export function loadConfig(): Config {
  const config: Config = {
    printifyApiToken: process.env.PRINTIFY_API_TOKEN || "",
    defaultProductJsonPath: process.env.DEFAULT_PRODUCT_JSON_PATH || "./product.json",
  };

  // Validate required configuration
  if (!config.printifyApiToken) {
    throw new Error("PRINTIFY_API_TOKEN environment variable is required");
  }

  return config;
}

export function validateConfig(config: Config): void {
  const errors: string[] = [];

  if (!config.printifyApiToken) {
    errors.push("PRINTIFY_API_TOKEN is required");
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join("\n")}`);
  }
}
