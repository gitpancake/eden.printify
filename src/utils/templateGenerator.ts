import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { loadConfig } from "./config";

interface Blueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: string[];
}

interface PrintProvider {
  id: number;
  title: string;
  location: string;
}

interface Variant {
  id: number;
  title: string;
  options: Array<{
    id: number;
    value: string;
  }>;
  placeholders: Array<{
    position: string;
    height: number;
    width: number;
  }>;
}

interface TemplateData {
  blueprint: Blueprint;
  printProvider: PrintProvider;
  variants: Variant[];
  template: any;
}

export class TemplateGenerator {
  private apiToken: string;
  private templatesDir: string;

  constructor() {
    const config = loadConfig();
    this.apiToken = config.printifyApiToken;
    this.templatesDir = path.join(process.cwd(), "templates");
  }

  /**
   * Generate all possible templates for every blueprint and print provider combination
   */
  async generateAllTemplates(): Promise<void> {
    console.log("🚀 Starting comprehensive template generation...");

    try {
      // Create templates directory
      this.ensureTemplatesDirectory();

      // Get all blueprints
      console.log("📋 Fetching all blueprints...");
      const blueprints = await this.getAllBlueprints();
      console.log(`✅ Found ${blueprints.length} blueprints`);

      let totalTemplates = 0;
      let successfulTemplates = 0;

      // Process each blueprint
      for (const blueprint of blueprints) {
        console.log(`\n🔧 Processing blueprint: ${blueprint.title} (ID: ${blueprint.id})`);

        try {
          // Get print providers for this blueprint
          const printProviders = await this.getPrintProviders(blueprint.id);
          console.log(`  📦 Found ${printProviders.length} print providers`);

          // Process each print provider
          for (const printProvider of printProviders) {
            console.log(`    🏭 Processing print provider: ${printProvider.title} (ID: ${printProvider.id})`);

            try {
              // Generate template for this blueprint/print provider combination
              const templateData = await this.generateTemplateForCombination(blueprint, printProvider);

              if (templateData) {
                // Save template to file
                await this.saveTemplate(templateData);
                successfulTemplates++;
                console.log(`      ✅ Template generated and saved`);
              }

              totalTemplates++;

              // Add small delay to respect API rate limits
              await this.delay(100);
            } catch (error) {
              console.error(`      ❌ Error generating template for ${blueprint.title} + ${printProvider.title}:`, error.message);
            }
          }
        } catch (error) {
          console.error(`  ❌ Error processing blueprint ${blueprint.title}:`, error.message);
        }
      }

      // Generate summary
      await this.generateTemplateSummary(blueprints);

      console.log(`\n🎉 Template generation completed!`);
      console.log(`📊 Summary:`);
      console.log(`   Total combinations processed: ${totalTemplates}`);
      console.log(`   Successful templates generated: ${successfulTemplates}`);
      console.log(`   Templates saved to: ${this.templatesDir}`);
    } catch (error) {
      console.error("❌ Error during template generation:", error.message);
      throw error;
    }
  }

  /**
   * Get all available blueprints from Printify
   */
  private async getAllBlueprints(): Promise<Blueprint[]> {
    try {
      const response = await axios.get("https://api.printify.com/v1/catalog/blueprints.json", {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "User-Agent": "EdenPrintify/1.0.0",
        },
        timeout: 30000,
      });

      const data = response.data;
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.blueprints)) {
        return data.blueprints;
      } else if (data && typeof data === 'object') {
        // If it's an object, try to extract blueprints from it
        const keys = Object.keys(data);
        if (keys.length > 0) {
          const firstKey = keys[0];
          const firstValue = data[firstKey];
          if (Array.isArray(firstValue)) {
            return firstValue;
          }
        }
      }
      
      // If we can't parse the response, return empty array
      console.log("⚠️  Unexpected blueprints response format");
      return [];
      
    } catch (error) {
      console.log(`⚠️  Error fetching blueprints: ${error.message}`);
      return [];
    }
  }

  /**
   * Get print providers for a specific blueprint
   */
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
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.print_providers)) {
        return data.print_providers;
      } else if (data && typeof data === 'object') {
        // If it's an object, try to extract print providers from it
        const keys = Object.keys(data);
        if (keys.length > 0) {
          const firstKey = keys[0];
          const firstValue = data[firstKey];
          if (Array.isArray(firstValue)) {
            return firstValue;
          }
        }
      }
      
      // If we can't parse the response, return empty array
      console.log(`  ⚠️  Unexpected print providers response format for blueprint ${blueprintId}`);
      return [];
      
    } catch (error) {
      console.log(`  ⚠️  Error fetching print providers for blueprint ${blueprintId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get variants for a specific blueprint and print provider combination
   */
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
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.variants)) {
        return data.variants;
      } else if (data && typeof data === 'object') {
        // If it's an object, try to extract variants from it
        const keys = Object.keys(data);
        if (keys.length > 0) {
          const firstKey = keys[0];
          const firstValue = data[firstKey];
          if (Array.isArray(firstValue)) {
            return firstValue;
          }
        }
      }
      
      // If we can't parse the response, return empty array
      console.log(`      ⚠️  Unexpected variants response format for blueprint ${blueprintId}, provider ${printProviderId}`);
      return [];
      
    } catch (error) {
      console.log(`      ⚠️  Error fetching variants for blueprint ${blueprintId}, provider ${printProviderId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate template for a specific blueprint and print provider combination
   */
  private async generateTemplateForCombination(blueprint: Blueprint, printProvider: PrintProvider): Promise<TemplateData | null> {
    try {
      // Get variants for this combination
      const variants = await this.getVariants(blueprint.id, printProvider.id);

      if (!variants || variants.length === 0) {
        console.log(`      ⚠️  No variants found for ${blueprint.title} + ${printProvider.title}`);
        return null;
      }

      // Find default variant (usually the first one)
      const defaultVariant = variants[0];

      // Generate template structure
      const template = {
        title: `${blueprint.title} - ${printProvider.title}`,
        description: `A ${blueprint.title.toLowerCase()} product from ${printProvider.title}. ${blueprint.description}`,
        blueprint_id: blueprint.id,
        print_provider_id: printProvider.id,
        variants: variants.map((variant) => ({
          id: variant.id,
          price: 2500, // Default price in cents ($25.00)
          is_enabled: true,
          is_default: variant.id === defaultVariant.id,
          grams: 180, // Default weight
          options: variant.options || [],
        })),
        print_areas: variants.map((variant) => ({
          variant_ids: [variant.id],
          placeholders:
            variant.placeholders?.map((placeholder) => ({
              position: placeholder.position,
              images: [
                {
                  id: `placeholder_${placeholder.position}`,
                  name: `${blueprint.title} ${placeholder.position} design`,
                  url: "https://example.com/placeholder-image.png",
                  preview_url: "https://example.com/placeholder-image.png",
                  x: 0,
                  y: 0,
                  scale: 1,
                  angle: 0,
                },
              ],
            })) || [],
        })),
      };

      return {
        blueprint,
        printProvider,
        variants,
        template,
      };
    } catch (error) {
      console.error(`      ❌ Error generating template for ${blueprint.title} + ${printProvider.title}:`, error.message);
      return null;
    }
  }

  /**
   * Save template to file
   */
  private async saveTemplate(templateData: TemplateData): Promise<void> {
    const { blueprint, printProvider, template } = templateData;

    // Create directory structure: templates/blueprint-id/print-provider-id/
    const blueprintDir = path.join(this.templatesDir, `blueprint-${blueprint.id}`);
    const providerDir = path.join(blueprintDir, `provider-${printProvider.id}`);

    if (!fs.existsSync(blueprintDir)) {
      fs.mkdirSync(blueprintDir, { recursive: true });
    }
    if (!fs.existsSync(providerDir)) {
      fs.mkdirSync(providerDir, { recursive: true });
    }

    // Create filename
    const filename = `${blueprint.title.replace(/[^a-zA-Z0-9]/g, "_")}_${printProvider.title.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
    const filepath = path.join(providerDir, filename);

    // Save template with metadata
    const templateWithMetadata = {
      metadata: {
        generated_at: new Date().toISOString(),
        blueprint: {
          id: blueprint.id,
          title: blueprint.title,
          description: blueprint.description,
          brand: blueprint.brand,
          model: blueprint.model,
        },
        print_provider: {
          id: printProvider.id,
          title: printProvider.title,
          location: printProvider.location,
        },
        variants_count: templateData.variants.length,
        template_type: "complete_product_template",
      },
      template: template,
    };

    fs.writeFileSync(filepath, JSON.stringify(templateWithMetadata, null, 2));
  }

  /**
   * Generate a summary of all templates
   */
  private async generateTemplateSummary(blueprints: Blueprint[]): Promise<void> {
    const summary = {
      generated_at: new Date().toISOString(),
      total_blueprints: blueprints.length,
      blueprints: blueprints.map((bp) => ({
        id: bp.id,
        title: bp.title,
        description: bp.description,
        brand: bp.brand,
        model: bp.model,
      })),
      template_structure: {
        directory: "templates/",
        format: "templates/blueprint-{id}/provider-{id}/{product_name}.json",
        metadata_included: true,
      },
      usage_instructions: {
        for_ai: "Use these templates to understand all available product options and generate product configurations",
        template_selection: "Choose appropriate blueprint and print provider based on product requirements",
        customization: "Modify template fields (title, description, price, images) as needed",
      },
    };

    const summaryPath = path.join(this.templatesDir, "templates-summary.json");
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`📋 Template summary saved to: ${summaryPath}`);
  }

  /**
   * Ensure templates directory exists
   */
  private ensureTemplatesDirectory(): void {
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
      console.log(`📁 Created templates directory: ${this.templatesDir}`);
    }
  }

  /**
   * Add delay to respect API rate limits
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get template information for AI context
   */
  async getTemplateInfo(): Promise<any> {
    const summaryPath = path.join(this.templatesDir, "templates-summary.json");

    if (!fs.existsSync(summaryPath)) {
      throw new Error("Template summary not found. Run generateAllTemplates() first.");
    }

    const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));

    // Get detailed template information
    const templates = [];
    const blueprintDirs = fs.readdirSync(this.templatesDir).filter((dir) => dir.startsWith("blueprint-"));

    for (const blueprintDir of blueprintDirs) {
      const blueprintPath = path.join(this.templatesDir, blueprintDir);
      const blueprintId = blueprintDir.replace("blueprint-", "");

      const providerDirs = fs.readdirSync(blueprintPath).filter((dir) => dir.startsWith("provider-"));

      for (const providerDir of providerDirs) {
        const providerPath = path.join(blueprintPath, providerDir);
        const providerId = providerDir.replace("provider-", "");

        const templateFiles = fs.readdirSync(providerPath).filter((file) => file.endsWith(".json"));

        for (const templateFile of templateFiles) {
          const templatePath = path.join(providerPath, templateFile);
          const templateData = JSON.parse(fs.readFileSync(templatePath, "utf8"));

          templates.push({
            blueprint_id: parseInt(blueprintId),
            print_provider_id: parseInt(providerId),
            template_file: templateFile,
            template_path: templatePath,
            metadata: templateData.metadata,
            sample_template: templateData.template,
          });
        }
      }
    }

    return {
      summary,
      templates,
      total_templates: templates.length,
    };
  }
}
