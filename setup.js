#!/usr/bin/env node

/**
 * Setup script for Eden Printify Product Creator
 *
 * This script helps users:
 * 1. Set up environment variables
 * 2. Create initial configuration
 * 3. Test the connection
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log("🚀 Welcome to Eden Printify Product Creator Setup!");
  console.log("=".repeat(50));
  console.log("");

  // Check if .env file already exists
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    console.log("⚠️  .env file already exists!");
    const overwrite = await question("Do you want to overwrite it? (y/N): ");
    if (overwrite.toLowerCase() !== "y" && overwrite.toLowerCase() !== "yes") {
      console.log("Setup cancelled.");
      rl.close();
      return;
    }
  }

  console.log("📋 Please provide your Printify credentials:");
  console.log("");

  // Get API token
  const apiToken = await question("Enter your Printify API token: ");
  if (!apiToken.trim()) {
    console.log("❌ API token is required!");
    rl.close();
    return;
  }

  // Note: Shop ID will be fetched automatically
  console.log("ℹ️  Shop ID will be fetched automatically from your Printify account");

  // Optional: Default product JSON path
  const defaultPath = await question("Default product.json path (press Enter for ./product.json): ");
  const productPath = defaultPath.trim() || "./product.json";

  // Create .env file
  const envContent = `# Printify API Configuration
PRINTIFY_API_TOKEN=${apiToken}

# Optional: Default path for product.json file
DEFAULT_PRODUCT_JSON_PATH=${productPath}

# Optional: Debug mode (set to 'true' to enable verbose logging)
DEBUG=false
`;

  fs.writeFileSync(envPath, envContent);
  console.log("");
  console.log("✅ .env file created successfully!");
  console.log("");

  // Test the connection
  console.log("🔍 Testing connection to Printify API...");
  try {
    // Load environment variables
    require("dotenv").config();

    // Test API connection by listing shops
    const { spawn } = require("child_process");
    const testProcess = spawn("node", ["dist/index.js", "list-shops"], {
      stdio: "pipe",
      env: process.env,
    });

    let output = "";
    testProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    testProcess.stderr.on("data", (data) => {
      output += data.toString();
    });

    await new Promise((resolve) => {
      testProcess.on("close", resolve);
    });

    if (testProcess.exitCode === 0) {
      console.log("✅ Connection test successful!");
      console.log("");
      console.log("🎉 Setup completed successfully!");
      console.log("");
      console.log("Next steps:");
      console.log("1. Edit your product.json file with your product details");
      console.log("2. Run 'yarn start create' to create your first product");
      console.log("3. Run 'yarn start help' to see all available commands");
    } else {
      console.log("❌ Connection test failed!");
      console.log("Please check your API token.");
      console.log("");
      console.log("Error output:");
      console.log(output);
    }
  } catch (error) {
    console.log("❌ Error testing connection:", error.message);
  }

  rl.close();
}

// Handle Ctrl+C
rl.on("SIGINT", () => {
  console.log("\nSetup cancelled.");
  rl.close();
});

setup().catch((error) => {
  console.error("❌ Setup failed:", error);
  rl.close();
});
