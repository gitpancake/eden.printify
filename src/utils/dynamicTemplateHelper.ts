import axios from "axios";
import { loadConfig } from "./config";

interface Blueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
}

interface PrintProvider {
  id: number;
  title: string;
  location: string;
}

interface Variant {
  id: number;
  title: string;
  options?: any[];
  placeholders?: any[];
}

interface ProductTemplate {
  title: string;
  description: string;
  blueprint_id: number;
  print_provider_id: number;
  variants: any[];
  print_areas: any[];
}

interface ProductSuggestion {
  blueprint_id: number;
  print_provider_id: number;
  blueprint_title: string;
  print_provider_title: string;
  category: string;
  description: string;
  estimated_price: number;
  popularity_score: number;
}

export class DynamicTemplateHelper {
  private apiToken: string;
  private config: any;

  constructor() {
    this.config = loadConfig();
    this.apiToken = this.config.printifyApiToken;
  }

  /**
   * Get product suggestions based on category and requirements
   */
  async getProductSuggestions(category?: string, maxPrice?: number, location?: string): Promise<ProductSuggestion[]> {
    try {
      console.log("🔍 Discovering available products...");

      // Get all blueprints
      const blueprints = await this.getAllBlueprints();

      // Filter by category if specified
      const filteredBlueprints = category ? this.filterBlueprintsByCategory(blueprints, category) : blueprints;

      const suggestions: ProductSuggestion[] = [];

      // Sample a subset of blueprints for efficiency
      const sampleSize = Math.min(50, filteredBlueprints.length);
      const sampledBlueprints = this.sampleArray(filteredBlueprints, sampleSize);

      for (const blueprint of sampledBlueprints) {
        try {
          // Get print providers for this blueprint
          const printProviders = await this.getPrintProviders(blueprint.id);

          // Filter by location if specified
          const filteredProviders = location ? printProviders.filter((pp) => pp.location && pp.location.toLowerCase().includes(location.toLowerCase())) : printProviders;

          // Take top 3 providers per blueprint for efficiency
          const topProviders = filteredProviders.slice(0, 3);

          for (const provider of topProviders) {
            const category = this.categorizeBlueprint(blueprint);
            const estimatedPrice = this.estimatePrice(category);
            const popularityScore = this.calculatePopularityScore(blueprint, provider);

            // Filter by price if specified
            if (maxPrice && estimatedPrice > maxPrice) continue;

            suggestions.push({
              blueprint_id: blueprint.id,
              print_provider_id: provider.id,
              blueprint_title: blueprint.title,
              print_provider_title: provider.title,
              category,
              description: blueprint.description,
              estimated_price: estimatedPrice,
              popularity_score: popularityScore,
            });
          }

          // Add small delay to respect API limits
          await this.delay(50);
        } catch (error) {
          console.log(`⚠️  Skipping blueprint ${blueprint.id}: ${error.message}`);
        }
      }

      // Sort by popularity and return top suggestions
      return suggestions.sort((a, b) => b.popularity_score - a.popularity_score).slice(0, 20);
    } catch (error) {
      throw new Error(`Failed to get product suggestions: ${error.message}`);
    }
  }

  /**
   * Generate a complete product template for a specific blueprint/provider combination
   */
  async generateProductTemplate(blueprintId: number, printProviderId: number, customizations?: any): Promise<ProductTemplate> {
    try {
      console.log(`🔧 Generating template for blueprint ${blueprintId}, provider ${printProviderId}...`);

      // Get blueprint and provider details
      const blueprint = await this.getBlueprint(blueprintId);
      const printProvider = await this.getPrintProvider(blueprintId, printProviderId);
      const variants = await this.getVariants(blueprintId, printProviderId);

      if (!variants || variants.length === 0) {
        throw new Error("No variants found for this combination");
      }

      // Generate template
      const template: ProductTemplate = {
        title: customizations?.title || `${blueprint.title} - ${printProvider.title}`,
        description: customizations?.description || blueprint.description,
        blueprint_id: blueprintId,
        print_provider_id: printProviderId,
        variants: variants.map((variant) => ({
          id: variant.id,
          price: customizations?.price || this.estimatePrice(this.categorizeBlueprint(blueprint)),
          is_enabled: true,
          is_default: variant.id === variants[0].id,
          grams: this.estimateWeight(this.categorizeBlueprint(blueprint)),
          options: this.processVariantOptions(variant.options),
        })),
        print_areas: variants.map((variant) => ({
          variant_ids: [variant.id],
          placeholders: this.generatePlaceholders(variant, blueprint),
        })),
      };

      return template;
    } catch (error) {
      throw new Error(`Failed to generate template: ${error.message}`);
    }
  }

  /**
   * Get available categories with product counts
   */
  async getAvailableCategories(): Promise<{ [category: string]: number }> {
    try {
      const blueprints = await this.getAllBlueprints();
      const categories: { [key: string]: number } = {};

      for (const blueprint of blueprints) {
        const category = this.categorizeBlueprint(blueprint);
        categories[category] = (categories[category] || 0) + 1;
      }

      return categories;
    } catch (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  /**
   * Search for products by keywords
   */
  async searchProducts(keywords: string[]): Promise<ProductSuggestion[]> {
    try {
      const blueprints = await this.getAllBlueprints();
      const matchingBlueprints = blueprints.filter((blueprint) => {
        const searchText = `${blueprint.title} ${blueprint.description}`.toLowerCase();
        return keywords.some((keyword) => searchText.includes(keyword.toLowerCase()));
      });

      const suggestions: ProductSuggestion[] = [];

      for (const blueprint of matchingBlueprints.slice(0, 10)) {
        // Limit to top 10 matches
        try {
          const printProviders = await this.getPrintProviders(blueprint.id);
          const topProvider = printProviders[0]; // Take first provider

          if (topProvider) {
            suggestions.push({
              blueprint_id: blueprint.id,
              print_provider_id: topProvider.id,
              blueprint_title: blueprint.title,
              print_provider_title: topProvider.title,
              category: this.categorizeBlueprint(blueprint),
              description: blueprint.description,
              estimated_price: this.estimatePrice(this.categorizeBlueprint(blueprint)),
              popularity_score: this.calculatePopularityScore(blueprint, topProvider),
            });
          }
        } catch (error) {
          // Skip if provider fetch fails
        }
      }

      return suggestions.sort((a, b) => b.popularity_score - a.popularity_score);
    } catch (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }

  // Private helper methods

  private async getAllBlueprints(): Promise<Blueprint[]> {
    const response = await axios.get("https://api.printify.com/v1/catalog/blueprints.json", {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "User-Agent": "EdenPrintify/1.0.0",
      },
      timeout: 30000,
    });

    const data = response.data;
    return Array.isArray(data) ? data : data.blueprints || [];
  }

  private async getBlueprint(blueprintId: number): Promise<Blueprint> {
    const blueprints = await this.getAllBlueprints();
    const blueprint = blueprints.find((bp) => bp.id === blueprintId);
    if (!blueprint) throw new Error(`Blueprint ${blueprintId} not found`);
    return blueprint;
  }

  private async getPrintProviders(blueprintId: number): Promise<PrintProvider[]> {
    try {
      const response = await axios.get(`https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers.json`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "User-Agent": "EdenPrintify/1.0.0",
        },
        timeout: 30000,
      });

      const data = response.data;
      return Array.isArray(data) ? data : data.print_providers || [];
    } catch (error) {
      return [];
    }
  }

  private async getPrintProvider(blueprintId: number, providerId: number): Promise<PrintProvider> {
    const providers = await this.getPrintProviders(blueprintId);
    const provider = providers.find((pp) => pp.id === providerId);
    if (!provider) throw new Error(`Print provider ${providerId} not found for blueprint ${blueprintId}`);
    return provider;
  }

  private async getVariants(blueprintId: number, printProviderId: number): Promise<Variant[]> {
    try {
      const response = await axios.get(`https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "User-Agent": "EdenPrintify/1.0.0",
        },
        timeout: 30000,
      });

      const data = response.data;

      // Handle different response structures
      let variants: any[] = [];
      if (Array.isArray(data)) {
        variants = data;
      } else if (data && typeof data === "object" && data.variants) {
        variants = Array.isArray(data.variants) ? data.variants : [];
      } else if (data && typeof data === "object") {
        // If data is an object but doesn't have variants, it might be the variants array itself
        variants = Object.values(data)
          .filter((item) => Array.isArray(item))
          .flat();
      }

      return variants;
    } catch (error) {
      console.error(`Error fetching variants for blueprint ${blueprintId}, provider ${printProviderId}:`, error);
      return [];
    }
  }

  private categorizeBlueprint(blueprint: Blueprint): string {
    const title = blueprint.title.toLowerCase();
    const description = blueprint.description.toLowerCase();

    if (title.includes("t-shirt") || title.includes("tee") || description.includes("t-shirt")) return "t-shirts";
    if (title.includes("hoodie") || title.includes("sweatshirt")) return "hoodies";
    if (title.includes("mug") || title.includes("cup")) return "mugs";
    if (title.includes("poster") || title.includes("print")) return "posters";
    if (title.includes("phone") || title.includes("case")) return "phone-cases";
    if (title.includes("bag") || title.includes("tote")) return "bags";
    if (title.includes("hat") || title.includes("cap")) return "hats";
    if (title.includes("tank") || title.includes("sleeveless")) return "tank-tops";
    if (title.includes("sticker")) return "stickers";
    if (title.includes("pillow")) return "pillows";
    if (title.includes("towel")) return "towels";
    if (title.includes("sock")) return "socks";
    if (title.includes("jacket")) return "jackets";
    if (title.includes("dress")) return "dresses";
    if (title.includes("pant") || title.includes("legging")) return "pants";

    return "other";
  }

  private estimatePrice(category: string): number {
    const priceMap: { [key: string]: number } = {
      "t-shirts": 2500, // $25.00
      hoodies: 4500, // $45.00
      mugs: 1500, // $15.00
      posters: 2000, // $20.00
      "phone-cases": 1800, // $18.00
      bags: 3000, // $30.00
      hats: 2200, // $22.00
      "tank-tops": 2000, // $20.00
      stickers: 500, // $5.00
      pillows: 3500, // $35.00
      towels: 2500, // $25.00
      socks: 1200, // $12.00
      jackets: 5500, // $55.00
      dresses: 4000, // $40.00
      pants: 3500, // $35.00
      other: 2000, // $20.00
    };

    return priceMap[category] || 2000;
  }

  private estimateWeight(category: string): number {
    const weightMap: { [key: string]: number } = {
      "t-shirts": 180,
      hoodies: 400,
      mugs: 350,
      posters: 50,
      "phone-cases": 30,
      bags: 200,
      hats: 100,
      "tank-tops": 150,
      stickers: 5,
      pillows: 500,
      towels: 300,
      socks: 50,
      jackets: 600,
      dresses: 250,
      pants: 300,
      other: 200,
    };

    return weightMap[category] || 200;
  }

  private calculatePopularityScore(blueprint: Blueprint, provider: PrintProvider): number {
    let score = 50; // Base score

    // Boost popular brands
    const popularBrands = ["gildan", "champion", "bella+canvas", "next level"];
    if (popularBrands.some((brand) => blueprint.brand.toLowerCase().includes(brand))) {
      score += 20;
    }

    // Boost popular categories
    const popularCategories = ["t-shirts", "hoodies", "mugs"];
    const category = this.categorizeBlueprint(blueprint);
    if (popularCategories.includes(category)) {
      score += 15;
    }

    // Boost US-based providers
    if (provider.location && provider.location.toLowerCase().includes("united states")) {
      score += 10;
    }

    return score;
  }

  private filterBlueprintsByCategory(blueprints: Blueprint[], category: string): Blueprint[] {
    return blueprints.filter((blueprint) => this.categorizeBlueprint(blueprint) === category);
  }

  private generatePlaceholders(variant: Variant, blueprint: Blueprint): any[] {
    if (Array.isArray(variant.placeholders) && variant.placeholders.length > 0) {
      return variant.placeholders.map((placeholder) => ({
        position: placeholder.position || "front",
        images: [
          {
            id: `placeholder_${placeholder.position || "front"}`,
            name: `${blueprint.title} ${placeholder.position || "front"} design`,
            url: "https://example.com/placeholder-image.png",
            preview_url: "https://example.com/placeholder-image.png",
            x: 0,
            y: 0,
            scale: 1,
            angle: 0,
          },
        ],
      }));
    }

    // Default placeholder
    return [
      {
        position: "front",
        images: [
          {
            id: "placeholder_front",
            name: `${blueprint.title} front design`,
            url: "https://example.com/placeholder-image.png",
            preview_url: "https://example.com/placeholder-image.png",
            x: 0,
            y: 0,
            scale: 1,
            angle: 0,
          },
        ],
      },
    ];
  }

  private sampleArray<T>(array: T[], size: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
  }

  private processVariantOptions(options: any): any[] {
    if (!options) return [];

    if (Array.isArray(options)) {
      return options;
    }

    if (typeof options === "object") {
      // Convert object format { color: 'Red', size: 'L' } to array format [{ id: 1, value: 'Red' }, { id: 2, value: 'L' }]
      return Object.entries(options).map(([, value], index) => ({
        id: index + 1,
        value: value?.toString() || "Default",
      }));
    }

    return [];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
