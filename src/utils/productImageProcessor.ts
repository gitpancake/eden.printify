import axios, { AxiosError } from "axios";
import * as fs from "fs";
import * as path from "path";
import { ProductJsonFile } from "../types/printify";

export class ProductImageProcessor {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  /**
   * Process a product JSON file: extract images, upload them, and replace with real IDs
   */
  async processProductWithImages(productJsonPath: string): Promise<string> {
    try {
      console.log(`🔄 Processing product with images: ${productJsonPath}`);

      // Read the product JSON file
      const productData = this.readProductJson(productJsonPath);

      // Extract all image URLs from the product
      const imageUrls = this.extractImageUrls(productData);

      if (imageUrls.length === 0) {
        console.log("ℹ️  No images found in product JSON");
        return productJsonPath;
      }

      console.log(`📤 Found ${imageUrls.length} images to upload`);

      // Upload all images and get their IDs
      const uploadedImages = await this.uploadImages(imageUrls);

      // Check if any images were successfully uploaded
      if (uploadedImages.size === 0) {
        console.log("⚠️  No images were successfully uploaded. Creating product without images...");
        // Create a version without images for testing
        const productWithoutImages = this.createProductWithoutImages(productData);
        const outputPath = this.writeUpdatedProduct(productWithoutImages, productJsonPath);
        console.log(`✅ Product created without images: ${outputPath}`);
        return outputPath;
      }

      // Replace image URLs with uploaded image IDs
      const updatedProductData = this.replaceImageUrls(productData, uploadedImages);

      // Clean up product data for Printify compatibility
      const cleanedProductData = this.cleanProductData(updatedProductData);

      // Write the updated product data to a new file
      const outputPath = this.writeUpdatedProduct(cleanedProductData, productJsonPath);

      console.log(`✅ Product processed successfully: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error("❌ Error processing product with images:", error);
      throw error;
    }
  }

  /**
   * Read and parse product JSON file
   */
  private readProductJson(filePath: string): ProductJsonFile {
    const fullPath = path.resolve(filePath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Product JSON file not found: ${fullPath}`);
    }

    const fileContent = fs.readFileSync(fullPath, "utf8");
    return JSON.parse(fileContent);
  }

  /**
   * Extract all image URLs from product data
   */
  private extractImageUrls(productData: ProductJsonFile): Array<{ url: string; name: string; id: string }> {
    const imageUrls: Array<{ url: string; name: string; id: string }> = [];

    productData.print_areas.forEach((printArea) => {
      printArea.placeholders.forEach((placeholder) => {
        placeholder.images.forEach((image) => {
          // Only process external URLs (not Printify URLs)
          if (this.isExternalUrl(image.url)) {
            imageUrls.push({
              url: image.url,
              name: image.name,
              id: image.id,
            });
          }
        });
      });
    });

    return imageUrls;
  }

  /**
   * Check if a URL is external (not from Printify)
   */
  private isExternalUrl(url: string): boolean {
    return !url.includes("printify.com") && !url.includes("via.placeholder.com");
  }

  /**
   * Upload image URL to Printify
   */
  private async uploadImageUrlToPrintify(imageUrl: string, imageName: string): Promise<{ id: string; url: string; preview_url: string }> {
    try {
      console.log(`📤 Uploading image to Printify: ${imageName} from ${imageUrl}`);

      const fileName = `${imageName.replace(/[^a-zA-Z0-9]/g, "_")}.png`;

      // Upload to Printify using URL
      const uploadResult = await this.uploadImageToPrintify(imageUrl, fileName);

      console.log(`✅ Image uploaded successfully: ${uploadResult.id}`);
      return uploadResult;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("❌ Error uploading image:", error.response?.data);
      } else {
        console.error("❌ Error uploading image:", error);
      }
      throw new Error("Failed to upload image");
    }
  }

  /**
   * Upload image URL to Printify
   */
  private async uploadImageToPrintify(imageUrl: string, fileName: string): Promise<{ id: string; url: string; preview_url: string }> {
    const response = await axios.post(
      "https://api.printify.com/v1/uploads/images.json",
      {
        url: imageUrl,
        file_name: fileName,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "User-Agent": "EdenPrintify/1.0.0",
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const uploadData = response.data;
    return {
      id: uploadData.id,
      url: uploadData.url || uploadData.preview_url, // Use preview_url as fallback if url is not provided
      preview_url: uploadData.preview_url,
    };
  }

  /**
   * Upload multiple images and return mapping of old IDs to new data
   */
  private async uploadImages(imageUrls: Array<{ url: string; name: string; id: string }>): Promise<Map<string, { id: string; url: string; preview_url: string }>> {
    const uploadedImages = new Map<string, { id: string; url: string; preview_url: string }>();

    for (const imageInfo of imageUrls) {
      try {
        const uploadResult = await this.uploadImageUrlToPrintify(imageInfo.url, imageInfo.name);
        uploadedImages.set(imageInfo.id, uploadResult);
      } catch (error) {
        console.error(`❌ Failed to upload image ${imageInfo.name}, skipping...`);
        // Continue with other images
        throw new Error("Failed to upload image");
      }
    }

    return uploadedImages;
  }

  /**
   * Replace image URLs in product data with uploaded image data
   */
  private replaceImageUrls(productData: ProductJsonFile, uploadedImages: Map<string, { id: string; url: string; preview_url: string }>): ProductJsonFile {
    const updatedProductData = JSON.parse(JSON.stringify(productData)); // Deep clone

    updatedProductData.print_areas.forEach((printArea: any) => {
      printArea.placeholders.forEach((placeholder: any) => {
        placeholder.images.forEach((image: any) => {
          const uploadedImage = uploadedImages.get(image.id);
          if (uploadedImage) {
            console.log(`🔄 Replacing image ${image.id} with uploaded image ${uploadedImage.id}`);
            image.id = uploadedImage.id;
            image.url = uploadedImage.url;
            image.preview_url = uploadedImage.preview_url;
          }
        });
      });
    });

    return updatedProductData;
  }

  /**
   * Create a product version without images for testing
   */
  private createProductWithoutImages(productData: ProductJsonFile): ProductJsonFile {
    const productWithoutImages = JSON.parse(JSON.stringify(productData)); // Deep clone

    // Remove all images from placeholders but keep the placeholder structure
    productWithoutImages.print_areas.forEach((printArea: any) => {
      printArea.placeholders.forEach((placeholder: any) => {
        placeholder.images = []; // Empty the images array
      });
    });

    return productWithoutImages;
  }

  /**
   * Clean up product data for Printify compatibility
   */
  private cleanProductData(productData: ProductJsonFile): ProductJsonFile {
    const cleanedProduct = JSON.parse(JSON.stringify(productData)); // Deep clone

    // Remove sales_channel_properties if they cause issues
    if (cleanedProduct.sales_channel_properties) {
      delete cleanedProduct.sales_channel_properties;
    }

    return cleanedProduct;
  }

  /**
   * Write updated product data to a new file
   */
  private writeUpdatedProduct(productData: ProductJsonFile, originalPath: string): string {
    const originalName = path.basename(originalPath, ".json");
    const outputPath = path.join(path.dirname(originalPath), `${originalName}-with-uploaded-images.json`);

    fs.writeFileSync(outputPath, JSON.stringify(productData, null, 2));
    return outputPath;
  }
}
