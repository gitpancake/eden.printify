import * as fs from "fs";
import * as path from "path";
import { PrintifyApiClient } from "../services/printifyApi";
import { ProductJsonFile } from "../types/printify";

export class ProductTemplateGenerator {
  private apiClient: PrintifyApiClient;

  constructor(apiClient: PrintifyApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Generate a product template for a specific blueprint and print provider
   */
  async generateTemplate(blueprintId: number, printProviderId: number, outputPath?: string): Promise<string> {
    try {
      console.log(`🎨 Generating product template for blueprint ${blueprintId}, print provider ${printProviderId}...`);

      // Get blueprint information
      const blueprints = await this.apiClient.getBlueprints();
      const blueprint = blueprints.find((bp) => bp.id === blueprintId);

      if (!blueprint) {
        throw new Error(`Blueprint ${blueprintId} not found`);
      }

      // Get print provider information
      const providers = await this.apiClient.getPrintProviders(blueprintId);
      const provider = providers.find((pp) => pp.id === printProviderId);

      if (!provider) {
        throw new Error(`Print provider ${printProviderId} not found for blueprint ${blueprintId}`);
      }

      // Get variants
      const variantsResponse = await this.apiClient.getVariants(blueprintId, printProviderId);
      const variants = (variantsResponse as any)?.variants || variantsResponse;

      if (!Array.isArray(variants) || variants.length === 0) {
        throw new Error(`No variants found for blueprint ${blueprintId} and print provider ${printProviderId}`);
      }

      // Generate template
      const template = this.createProductTemplate(blueprint, provider, variants);

      // Write to file
      const fileName = outputPath || `product-template-${blueprintId}-${printProviderId}.json`;
      const fullPath = path.resolve(fileName);

      fs.writeFileSync(fullPath, JSON.stringify(template, null, 2));

      console.log(`✅ Product template generated: ${fullPath}`);
      console.log(`📝 Template includes ${template.variants.length} variants`);
      console.log(`🎨 Template includes ${template.print_areas.length} print areas`);

      return fullPath;
    } catch (error) {
      console.error("❌ Error generating product template:", error);
      throw error;
    }
  }

  /**
   * Create a product template from blueprint, provider, and variant data
   */
  private createProductTemplate(blueprint: any, provider: any, variants: any[]): ProductJsonFile {
    // Get the first variant as default
    const defaultVariant = variants[0];

    // Extract available options from the variant and ensure it's an array
    let options: any[] = [];
    if (defaultVariant.options && Array.isArray(defaultVariant.options)) {
      options = defaultVariant.options;
    } else if (defaultVariant.options && typeof defaultVariant.options === "object") {
      // If options is an object, convert it to an array with proper structure
      options = Object.entries(defaultVariant.options).map(([, value]: [string, any], index: number) => ({
        id: index + 1, // Use sequential IDs starting from 1
        value: value?.toString() || "Default",
      }));
    }

    // Create a sample variant with safe option mapping
    const sampleVariant = {
      id: defaultVariant.id,
      price: 2500, // Default price in cents ($25.00)
      is_enabled: true,
      is_default: true,
      grams: defaultVariant.grams || 180,
      options: options.map((opt: any) => ({
        id: opt.id || 0,
        value: (opt.values && Array.isArray(opt.values) && opt.values[0]) || opt.value || "Default",
      })),
    };

    // Create print areas based on available placeholders
    const printAreas = [];
    if (defaultVariant.placeholders && defaultVariant.placeholders.length > 0) {
      const placeholders = defaultVariant.placeholders.map((placeholder: any) => ({
        position: placeholder.position,
        images: [
          {
            id: `sample_image_${placeholder.position}`,
            name: `Sample ${placeholder.position} design`,
            url: "https://via.placeholder.com/3319x3761/FF0000/FFFFFF?text=Sample+Design",
            preview_url: "https://via.placeholder.com/3319x3761/FF0000/FFFFFF?text=Sample+Design",
            x: 0, // Center horizontally
            y: 0, // Center vertically
            scale: 1, // Full scale
            angle: 0, // No rotation
          },
        ],
      }));

      printAreas.push({
        variant_ids: [defaultVariant.id],
        placeholders: placeholders,
      });
    }

    const template: ProductJsonFile = {
      title: `${blueprint.title} - Sample Product`,
      description: `A sample ${blueprint.title} product created with ${provider.title}. ${blueprint.description}`,
      blueprint_id: blueprint.id,
      print_provider_id: provider.id,
      variants: [sampleVariant],
      print_areas: printAreas,
      sales_channel_properties: [
        {
          sales_channel_id: "shopify",
          properties: {
            title: `${blueprint.title} - Custom Title`,
            description: `Custom description for ${blueprint.title}`,
            price: 2500,
            is_enabled: true,
          },
        },
      ],
    };

    return template;
  }

  /**
   * Generate multiple templates for popular products
   */
  async generatePopularTemplates(): Promise<string[]> {
    try {
      console.log("🎨 Generating popular product templates...");

      // Popular product combinations (using actual blueprint and print provider IDs)
      const popularCombinations = [
        { blueprintId: 5, printProviderId: 50, name: "t-shirt" }, // Unisex Cotton Crew Tee
        { blueprintId: 6, printProviderId: 26, name: "heavy-tee" }, // Unisex Heavy Cotton Tee
        { blueprintId: 9, printProviderId: 50, name: "womens-tee" }, // Women's Favorite Tee
        { blueprintId: 12, printProviderId: 50, name: "jersey-tee" }, // Unisex Jersey Short Sleeve Tee
      ];

      const generatedFiles: string[] = [];

      for (const combo of popularCombinations) {
        try {
          const filePath = await this.generateTemplate(combo.blueprintId, combo.printProviderId, `product-template-${combo.name}.json`);
          generatedFiles.push(filePath);
        } catch (error) {
          console.log(`⚠️  Could not generate template for ${combo.name}: ${error.message}`);
        }
      }

      console.log(`✅ Generated ${generatedFiles.length} popular templates`);
      return generatedFiles;
    } catch (error) {
      console.error("❌ Error generating popular templates:", error);
      throw error;
    }
  }

  /**
   * List available templates that can be generated
   */
  async listAvailableTemplates(): Promise<void> {
    try {
      console.log("📋 Available product templates:");
      console.log("");

      const blueprints = await this.apiClient.getBlueprints();

      // Show first 10 blueprints with their print providers
      for (let i = 0; i < Math.min(10, blueprints.length); i++) {
        const blueprint = blueprints[i];
        console.log(`${i + 1}. ${blueprint.title} (ID: ${blueprint.id})`);
        console.log(`   Brand: ${blueprint.brand}, Model: ${blueprint.model}`);

        try {
          const providers = await this.apiClient.getPrintProviders(blueprint.id);
          console.log(`   Print Providers: ${providers.length} available`);
          providers.slice(0, 3).forEach((provider) => {
            console.log(`     - ${provider.title} (ID: ${provider.id})`);
          });
          if (providers.length > 3) {
            console.log(`     ... and ${providers.length - 3} more`);
          }
        } catch (error) {
          console.log(`   Print Providers: Error fetching providers`);
        }

        console.log("");
      }

      if (blueprints.length > 10) {
        console.log(`... and ${blueprints.length - 10} more blueprints available`);
      }

      console.log("💡 To generate a template, use:");
      console.log("   yarn start generate-template <blueprint_id> <print_provider_id>");
    } catch (error) {
      console.error("❌ Error listing available templates:", error);
      throw error;
    }
  }
}
