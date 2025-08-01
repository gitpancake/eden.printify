import { PrintifyApiClient } from "../services/printifyApi";

export class DebugHelper {
  private apiClient: PrintifyApiClient;

  constructor(apiClient: PrintifyApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Debug blueprint information
   */
  async debugBlueprints(): Promise<void> {
    try {
      console.log("🔍 Fetching blueprints...");
      const blueprints = await this.apiClient.getBlueprints();

      console.log(`✅ Found ${blueprints.length} blueprints:`);
      blueprints.slice(0, 10).forEach((blueprint, index) => {
        console.log(`  ${index + 1}. ID: ${blueprint.id} - ${blueprint.title}`);
        console.log(`     Brand: ${blueprint.brand}, Model: ${blueprint.model}`);
        console.log(`     Description: ${blueprint.description.substring(0, 100)}...`);
        console.log("");
      });

      if (blueprints.length > 10) {
        console.log(`... and ${blueprints.length - 10} more blueprints`);
      }
    } catch (error) {
      console.error("❌ Error fetching blueprints:", error);
    }
  }

  /**
   * Debug print providers for a specific blueprint
   */
  async debugPrintProviders(blueprintId: number): Promise<void> {
    try {
      console.log(`🔍 Fetching print providers for blueprint ${blueprintId}...`);
      const providers = await this.apiClient.getPrintProviders(blueprintId);

      console.log(`✅ Found ${providers.length} print providers:`);
      providers.forEach((provider, index) => {
        console.log(`  ${index + 1}. ID: ${provider.id} - ${provider.title}`);
        console.log(`     Location: ${provider.location}`);
        console.log("");
      });
    } catch (error) {
      console.error(`❌ Error fetching print providers for blueprint ${blueprintId}:`, error);
    }
  }

  /**
   * Debug a specific print provider by ID
   */
  async debugPrintProvider(providerId: number): Promise<void> {
    try {
      console.log(`🔍 Fetching print provider with ID: ${providerId}...`);
      const provider = await this.apiClient.getPrintProvider(providerId);

      console.log(`✅ Print Provider Details:`);
      console.log(`  ID: ${provider.id}`);
      console.log(`  Title: ${provider.title}`);
      console.log(`  Location: ${typeof provider.location === "object" ? JSON.stringify(provider.location) : provider.location}`);

      // Note: Print provider API doesn't return variants directly
      // To get variants, we need to know which blueprint this provider works with
      console.log(`  Note: To see variants for this provider, use:`);
      console.log(`    yarn start debug-structure <blueprint_id> ${provider.id}`);
    } catch (error) {
      console.error(`❌ Error fetching print provider ${providerId}:`, error);
    }
  }

  /**
   * Debug variants for a specific blueprint and print provider
   */
  async debugVariants(blueprintId: number, printProviderId: number): Promise<void> {
    try {
      console.log(`🔍 Fetching variants for blueprint ${blueprintId}, print provider ${printProviderId}...`);
      const response = await this.apiClient.getVariants(blueprintId, printProviderId);

      // Handle the actual response structure
      const variants = (response as any)?.variants || response;

      console.log(`✅ Found ${variants?.length || 0} variants:`);

      if (Array.isArray(variants) && variants.length > 0) {
        variants.slice(0, 5).forEach((variant, index) => {
          console.log(`  ${index + 1}. ID: ${variant.id} - ${variant.title}`);
          console.log(`     Options:`, variant.options || "No options");
          console.log(`     Placeholders: ${variant.placeholders?.length || 0} positions available`);
          console.log(`     Decoration Methods: ${variant.decoration_methods?.join(", ") || "None"}`);
          console.log("");
        });

        if (variants.length > 5) {
          console.log(`... and ${variants.length - 5} more variants`);
        }
      } else {
        console.log("No variants found or invalid response format");
        console.log("Raw response:", JSON.stringify(response, null, 2));
      }
    } catch (error) {
      console.error(`❌ Error fetching variants for blueprint ${blueprintId}, print provider ${printProviderId}:`, error);
    }
  }

  /**
   * Debug all information for a specific blueprint
   */
  async debugBlueprintComplete(blueprintId: number): Promise<void> {
    console.log(`🔍 Complete debug for blueprint ${blueprintId}`);
    console.log("=".repeat(50));

    await this.debugPrintProviders(blueprintId);

    // Get print providers first
    try {
      const providers = await this.apiClient.getPrintProviders(blueprintId);
      if (providers.length > 0) {
        const firstProvider = providers[0];
        console.log(`\n🔍 Using first print provider: ${firstProvider.title} (ID: ${firstProvider.id})`);
        await this.debugVariants(blueprintId, firstProvider.id);
      }
    } catch (error) {
      console.error("❌ Error in complete debug:", error);
    }
  }

  /**
   * Show recommended product structure based on actual data
   */
  async showRecommendedProductStructure(blueprintId: number, printProviderId: number): Promise<void> {
    try {
      console.log("🔍 Generating recommended product structure...");

      const response = await this.apiClient.getVariants(blueprintId, printProviderId);
      const variants = (response as any)?.variants || response;

      if (!Array.isArray(variants) || variants.length === 0) {
        console.log("❌ No variants found for this blueprint/print provider combination");
        console.log("Raw response:", JSON.stringify(response, null, 2));
        return;
      }

      const firstVariant = variants[0];
      console.log("\n📋 Recommended product.json structure:");
      console.log(
        JSON.stringify(
          {
            title: "Your Product Title",
            description: "Your product description",
            blueprint_id: blueprintId,
            print_provider_id: printProviderId,
            variants: [
              {
                id: firstVariant.id,
                price: 2500, // $25.00 in cents
                is_enabled: true,
                is_default: true,
                grams: 180, // Default weight
                options: firstVariant.options || [],
              },
            ],
            print_areas: [
              {
                variant_ids: [firstVariant.id],
                placeholders: [
                  {
                    position: "front",
                    images: [
                      {
                        id: "your_image_id",
                        name: "Your Design Name",
                        url: "https://your-image-url.com/image.png",
                        preview_url: "https://your-image-url.com/image.png",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          null,
          2
        )
      );

      console.log("\n📏 Available print positions for this variant:");
      if (firstVariant.placeholders) {
        (firstVariant.placeholders as any[]).forEach((placeholder: any, index: number) => {
          console.log(`  ${index + 1}. ${placeholder.position} (${placeholder.width}x${placeholder.height})`);
        });
      }
    } catch (error) {
      console.error("❌ Error generating recommended structure:", error);
    }
  }
}
