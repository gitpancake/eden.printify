#!/usr/bin/env node

/**
 * Create a simple test image for Printify uploads
 * This creates a basic PNG image that meets Printify's requirements
 */

const { createCanvas } = require("canvas");
const fs = require("fs");

function createTestImage() {
  console.log("🎨 Creating a simple test image for Printify...");

  // Create a canvas with recommended dimensions
  const width = 1000;
  const height = 1000;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fill background
  ctx.fillStyle = "#4A90E2";
  ctx.fillRect(0, 0, width, height);

  // Add some simple shapes
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(200, 200, 600, 600);

  ctx.fillStyle = "#FF6B6B";
  ctx.beginPath();
  ctx.arc(500, 500, 200, 0, 2 * Math.PI);
  ctx.fill();

  // Add text
  ctx.fillStyle = "#333333";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Test Design", 500, 300);
  ctx.fillText("Printify Ready", 500, 700);

  // Save the image
  const buffer = canvas.toBuffer("image/png");
  const filename = "test-design.png";
  fs.writeFileSync(filename, buffer);

  console.log(`✅ Test image created: ${filename}`);
  console.log(`📏 Dimensions: ${width}x${height} pixels`);
  console.log(`💾 File size: ${(buffer.length / 1024).toFixed(1)} KB`);
  console.log("");
  console.log("💡 You can now upload this image:");
  console.log(`   yarn start upload-image ${filename}`);
}

createTestImage();
