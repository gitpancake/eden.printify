#!/usr/bin/env node

/**
 * Example script demonstrating how to use the Eden Printify Product Creator
 *
 * This script shows how to:
 * 1. Set up environment variables
 * 2. Create a product from JSON
 * 3. Handle errors
 */

const { spawn } = require("child_process");
const path = require("path");

// Example product data
const exampleProduct = {
  title: "Example T-Shirt",
  description: "A simple example t-shirt product",
  blueprint_id: 1,
  print_provider_id: 1,
  variants: [
    {
      id: 23494,
      price: 2500,
      is_enabled: true,
      is_default: true,
      grams: 180,
      options: [
        { id: 1, value: "White" },
        { id: 2, value: "M" },
      ],
    },
  ],
  print_areas: [
    {
      variant_ids: [23494],
      placeholders: [
        {
          position: "front",
          images: [
            {
              id: "example_image",
              name: "Example Design",
              url: "https://example.com/design.png",
              preview_url: "https://example.com/design-preview.png",
            },
          ],
        },
      ],
    },
  ],
};

// Write example product to file
const fs = require("fs");
const examplePath = path.join(__dirname, "example-product.json");
fs.writeFileSync(examplePath, JSON.stringify(exampleProduct, null, 2));

console.log("📝 Created example product file:", examplePath);
console.log("📋 Example product data:");
console.log(JSON.stringify(exampleProduct, null, 2));

console.log("\n🚀 To use this example:");
console.log("1. Set your environment variables:");
console.log('   export PRINTIFY_API_TOKEN="your_token_here"');
console.log('   export PRINTIFY_SHOP_ID="your_shop_id_here"');
console.log("");
console.log("2. Run the product creator:");
console.log(`   yarn start create ${examplePath}`);
console.log("");
console.log("3. Or use the default product.json:");
console.log("   yarn start create");
