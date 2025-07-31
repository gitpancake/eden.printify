import axios from "axios";
import * as fs from "fs";
import * as path from "path";

export class ImageUploader {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  /**
   * Upload an image to Printify
   */
  async uploadImage(imagePath: string): Promise<{ id: string; url: string; preview_url: string }> {
    try {
      console.log(`📤 Uploading image: ${imagePath}`);

      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      // Read the image file
      const imageBuffer = fs.readFileSync(imagePath);
      const fileName = path.basename(imagePath);

      // Create form data
      const FormData = require("form-data");
      const form = new FormData();
      form.append("file", imageBuffer, {
        filename: fileName,
        contentType: this.getContentType(fileName),
      });

      // Upload to Printify
      const response = await axios.post("https://api.printify.com/v1/uploads/images.json", form, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "User-Agent": "EdenPrintify/1.0.0",
          ...form.getHeaders(),
        },
      });

      const uploadData = response.data;
      console.log(`✅ Image uploaded successfully: ${uploadData.id}`);

      return {
        id: uploadData.id,
        url: uploadData.url,
        preview_url: uploadData.preview_url,
      };
    } catch (error) {
      console.error(`❌ Failed to upload image: ${error}`);
      throw error;
    }
  }

  /**
   * Create a simple test image if none exists
   */
  async createTestImage(): Promise<string> {
    const testImagePath = "./test-image.png";

    if (fs.existsSync(testImagePath)) {
      console.log(`✅ Test image already exists: ${testImagePath}`);
      return testImagePath;
    }

    console.log(`🎨 Creating test image: ${testImagePath}`);

    // Create a simple PNG image using a data URL
    const { createCanvas } = require("canvas");
    const canvas = createCanvas(500, 500);
    const ctx = canvas.getContext("2d");

    // Draw a simple design
    ctx.fillStyle = "#FF6B6B";
    ctx.fillRect(0, 0, 500, 500);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Test Design", 250, 250);

    // Save the image
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(testImagePath, buffer);

    console.log(`✅ Test image created: ${testImagePath}`);
    return testImagePath;
  }

  /**
   * Get content type based on file extension
   */
  private getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const contentTypes: { [key: string]: string } = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };
    return contentTypes[ext] || "image/png";
  }

  /**
   * Upload multiple images and return their data
   */
  async uploadImages(imagePaths: string[]): Promise<Array<{ id: string; url: string; preview_url: string }>> {
    const results = [];
    for (const imagePath of imagePaths) {
      try {
        const result = await this.uploadImage(imagePath);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to upload ${imagePath}:`, error);
        throw error;
      }
    }
    return results;
  }
}
