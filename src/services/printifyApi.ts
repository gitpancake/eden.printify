import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { CreateProductRequest, PrintifyBlueprint, PrintifyPrintProvider, PrintifyProduct, PrintifyShop, ProductJsonFile } from "../types/printify";

export class PrintifyApiClient {
  private client: AxiosInstance;
  private shopId: string;

  constructor(apiToken: string, shopId: string) {
    this.shopId = shopId;
    this.client = axios.create({
      baseURL: "https://api.printify.com/v1",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "User-Agent": "EdenPrintify/1.0.0",
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("Printify API Error:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        });

        // Log detailed validation errors if available
        if (error.response?.data?.errors) {
          console.error("🚨 Validation Errors:");
          console.error(JSON.stringify(error.response.data.errors, null, 2));
        }

        // Log the full error response for debugging
        console.error("📋 Full Error Response:");
        console.error(JSON.stringify(error.response?.data, null, 2));

        // Log the request data that was sent
        console.error("📤 Request Data Sent:");
        console.error(JSON.stringify(JSON.parse(error.config?.data || "{}"), null, 2));

        throw error;
      }
    );
  }

  /**
   * Get all shops for the authenticated user
   */
  async getShops(): Promise<PrintifyShop[]> {
    try {
      const response: AxiosResponse<PrintifyShop[]> = await this.client.get("/shops.json");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch shops:", error);
      throw error;
    }
  }

  /**
   * Get all blueprints (product types) available
   */
  async getBlueprints(): Promise<PrintifyBlueprint[]> {
    try {
      const response: AxiosResponse<PrintifyBlueprint[]> = await this.client.get("/catalog/blueprints.json");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch blueprints:", error);
      throw error;
    }
  }

  /**
   * Get print providers for a specific blueprint
   */
  async getPrintProviders(blueprintId: number): Promise<PrintifyPrintProvider[]> {
    try {
      const response: AxiosResponse<PrintifyPrintProvider[]> = await this.client.get(`/catalog/blueprints/${blueprintId}/print_providers.json`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch print providers for blueprint ${blueprintId}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific print provider by ID
   */
  async getPrintProvider(providerId: number): Promise<PrintifyPrintProvider> {
    try {
      const response: AxiosResponse<PrintifyPrintProvider> = await this.client.get(`/catalog/print_providers/${providerId}.json`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch print provider ${providerId}:`, error);
      throw error;
    }
  }

  /**
   * Get variants for a specific blueprint and print provider
   */
  async getVariants(blueprintId: number, printProviderId: number): Promise<any[]> {
    try {
      const response: AxiosResponse<any[]> = await this.client.get(`/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch variants for blueprint ${blueprintId} and print provider ${printProviderId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new product in the specified shop
   */
  async createProduct(productData: CreateProductRequest): Promise<PrintifyProduct> {
    try {
      const response: AxiosResponse<PrintifyProduct> = await this.client.post(`/shops/${this.shopId}/products.json`, productData);
      return response.data;
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
   * Get all products in the specified shop
   */
  async getProducts(): Promise<PrintifyProduct[]> {
    try {
      const response: AxiosResponse<PrintifyProduct[]> = await this.client.get(`/shops/${this.shopId}/products.json`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch products:", error);
      throw error;
    }
  }

  /**
   * Get a specific product by ID
   */
  async getProduct(productId: string): Promise<PrintifyProduct> {
    try {
      const response: AxiosResponse<PrintifyProduct> = await this.client.get(`/shops/${this.shopId}/products/${productId}.json`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(productId: string, productData: Partial<CreateProductRequest>): Promise<PrintifyProduct> {
    try {
      const response: AxiosResponse<PrintifyProduct> = await this.client.put(`/shops/${this.shopId}/products/${productId}.json`, productData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      await this.client.delete(`/shops/${this.shopId}/products/${productId}.json`);
    } catch (error) {
      console.error(`Failed to delete product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Publish a product to a sales channel
   */
  async publishProduct(productId: string, salesChannelId: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.client.post(`/shops/${this.shopId}/products/${productId}/publishing_succeeded.json`, { external: { id: salesChannelId } });
      return response.data;
    } catch (error) {
      console.error(`Failed to publish product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Convert ProductJsonFile to CreateProductRequest
   */
  convertProductJsonToRequest(productJson: ProductJsonFile): CreateProductRequest {
    return {
      title: productJson.title,
      description: productJson.description,
      blueprint_id: productJson.blueprint_id,
      print_provider_id: productJson.print_provider_id,
      variants: productJson.variants,
      print_areas: productJson.print_areas,
      sales_channel_properties: productJson.sales_channel_properties,
    };
  }
}
