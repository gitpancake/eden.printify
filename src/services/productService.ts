import { AxiosError } from "axios";
import * as fs from "fs";
import * as path from "path";
import { PrintifyProduct, PrintifyShop, ProductJsonFile } from "../types/printify";
import { ProductValidator } from "../utils/productValidator";
import { PrintifyApiClient } from "./printifyApi";

export class ProductService {
  private apiClient: PrintifyApiClient;

  constructor(apiClient: PrintifyApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Read a product JSON file and return the parsed data
   */
  async readProductJson(filePath: string): Promise<ProductJsonFile> {
    try {
      const fullPath = path.resolve(filePath);

      if (!fs.existsSync(fullPath)) {
        throw new Error(`Product JSON file not found: ${fullPath}`);
      }

      const fileContent = fs.readFileSync(fullPath, "utf8");
      const productData: ProductJsonFile = JSON.parse(fileContent);

      // Validate product data using the validator
      const validation = ProductValidator.validateProduct(productData);
      ProductValidator.printValidationResults(validation);

      if (!validation.isValid) {
        throw new Error("Product validation failed. Please fix the errors above.");
      }

      console.log(`✅ Successfully read product JSON from: ${fullPath}`);
      return productData;
    } catch (error) {
      console.error("❌ Error reading product JSON file:", error);
      throw error;
    }
  }

  /**
   * Create a product from JSON data
   */
  async createProductFromJson(productData: ProductJsonFile): Promise<PrintifyProduct> {
    try {
      console.log("🔄 Creating product in Printify...");

      // Convert JSON data to API request format
      const createRequest = this.apiClient.convertProductJsonToRequest(productData);

      // Create the product
      const createdProduct = await this.apiClient.createProduct(createRequest);

      console.log(`✅ Product created successfully! ID: ${createdProduct.id}`);
      console.log(`📝 Title: ${createdProduct.title}`);

      return createdProduct;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("❌ Error creating product:", error.response?.data);
      } else {
        console.error("❌ Error creating product:", error);
      }
      throw new Error("Failed to create product");
    }
  }

  /**
   * Read product JSON file and create product in one step
   */
  async createProductFromFile(filePath: string): Promise<PrintifyProduct> {
    try {
      console.log(`📖 Reading product data from: ${filePath}`);

      // Read the JSON file
      const productData = await this.readProductJson(filePath);

      // Create the product
      const createdProduct = await this.createProductFromJson(productData);

      return createdProduct;
    } catch (error) {
      console.error("❌ Error creating product from file:", error);
      throw error;
    }
  }

  /**
   * List all available shops
   */
  async listShops(): Promise<PrintifyShop[]> {
    try {
      console.log("🔄 Fetching available shops...");
      const shops = await this.apiClient.getShops();

      console.log(`✅ Found ${shops.length} shop(s):`);
      shops.forEach((shop, index) => {
        console.log(`  ${index + 1}. ${shop.title} (ID: ${shop.id}) - ${shop.sales_channel}`);
      });

      return shops;
    } catch (error) {
      console.error("❌ Error fetching shops:", error);
      throw error;
    }
  }

  /**
   * List all products in the current shop
   */
  async listProducts(): Promise<PrintifyProduct[]> {
    try {
      console.log("🔄 Fetching products from shop...");
      const products = await this.apiClient.getProducts();

      console.log(`✅ Found ${products.length} product(s):`);
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.title} (ID: ${product.id})`);
      });

      return products;
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      throw error;
    }
  }
}
