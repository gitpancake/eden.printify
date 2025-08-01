import * as fs from "fs";
import * as path from "path";
import { TemplateGenerator } from "./templateGenerator";

export interface TemplateInfo {
  blueprint_id: number;
  print_provider_id: number;
  blueprint_title: string;
  print_provider_title: string;
  blueprint_description: string;
  print_provider_location: string;
  variants_count: number;
  template_path: string;
  sample_template: any;
}

export interface AITemplateContext {
  total_blueprints: number;
  total_templates: number;
  blueprints: Array<{
    id: number;
    title: string;
    description: string;
    brand: string;
    model: string;
  }>;
  templates: TemplateInfo[];
  categories: {
    [category: string]: TemplateInfo[];
  };
}

export class AITemplateHelper {
  private templateGenerator: TemplateGenerator;
  private templatesDir: string;

  constructor() {
    this.templateGenerator = new TemplateGenerator();
    this.templatesDir = path.join(process.cwd(), "templates");
  }

  /**
   * Get comprehensive template context for AI
   */
  async getAITemplateContext(): Promise<AITemplateContext> {
    try {
      const templateInfo = await this.templateGenerator.getTemplateInfo();

      // Organize templates by category
      const categories = this.categorizeTemplates(templateInfo.templates);

      return {
        total_blueprints: templateInfo.summary.total_blueprints,
        total_templates: templateInfo.total_templates,
        blueprints: templateInfo.summary.blueprints,
        templates: templateInfo.templates.map((t: any) => ({
          blueprint_id: t.blueprint_id,
          print_provider_id: t.print_provider_id,
          blueprint_title: t.metadata.blueprint.title,
          print_provider_title: t.metadata.print_provider.title,
          blueprint_description: t.metadata.blueprint.description,
          print_provider_location: t.metadata.print_provider.location,
          variants_count: t.metadata.variants_count,
          template_path: t.template_path,
          sample_template: t.sample_template,
        })),
        categories,
      };
    } catch (error) {
      throw new Error(`Failed to get AI template context: ${error.message}`);
    }
  }

  /**
   * Find templates by category or keywords
   */
  async findTemplatesByCategory(category: string): Promise<TemplateInfo[]> {
    const context = await this.getAITemplateContext();
    return context.categories[category.toLowerCase()] || [];
  }

  /**
   * Find templates by blueprint title keywords
   */
  async findTemplatesByKeywords(keywords: string[]): Promise<TemplateInfo[]> {
    const context = await this.getAITemplateContext();
    const lowerKeywords = keywords.map((k) => k.toLowerCase());

    return context.templates.filter((template) => {
      const searchText = `${template.blueprint_title} ${template.blueprint_description} ${template.print_provider_title}`.toLowerCase();
      return lowerKeywords.some((keyword) => searchText.includes(keyword));
    });
  }

  /**
   * Get template by blueprint and print provider IDs
   */
  async getTemplateByIds(blueprintId: number, printProviderId: number): Promise<TemplateInfo | null> {
    const context = await this.getAITemplateContext();

    return context.templates.find((template) => template.blueprint_id === blueprintId && template.print_provider_id === printProviderId) || null;
  }

  /**
   * Get popular product categories
   */
  async getPopularCategories(): Promise<string[]> {
    const context = await this.getAITemplateContext();
    return Object.keys(context.categories).sort((a, b) => context.categories[b].length - context.categories[a].length);
  }

  /**
   * Generate AI-friendly template summary
   */
  async generateAISummary(): Promise<string> {
    const context = await this.getAITemplateContext();

    let summary = `# Printify Product Templates Summary\n\n`;
    summary += `Total Blueprints: ${context.total_blueprints}\n`;
    summary += `Total Templates: ${context.total_templates}\n\n`;

    summary += `## Available Categories:\n\n`;

    for (const [category, templates] of Object.entries(context.categories)) {
      summary += `### ${category.charAt(0).toUpperCase() + category.slice(1)} (${templates.length} templates)\n`;

      // Group by blueprint
      const blueprintGroups = this.groupByBlueprint(templates);
      for (const [blueprintTitle, blueprintTemplates] of Object.entries(blueprintGroups)) {
        summary += `- **${blueprintTitle}**: ${blueprintTemplates.length} print providers\n`;
      }
      summary += `\n`;
    }

    summary += `## Usage Instructions for AI:\n\n`;
    summary += `1. **Template Selection**: Choose appropriate blueprint and print provider based on product requirements\n`;
    summary += `2. **Customization**: Modify template fields (title, description, price, images) as needed\n`;
    summary += `3. **Validation**: Ensure all required fields are present before creating products\n`;
    summary += `4. **Image Requirements**: Replace placeholder images with actual design URLs\n\n`;

    summary += `## Template Structure:\n\n`;
    summary += `Each template includes:\n`;
    summary += `- Complete product configuration\n`;
    summary += `- All available variants and options\n`;
    summary += `- Print area specifications\n`;
    summary += `- Placeholder image configurations\n`;

    return summary;
  }

  /**
   * Save AI summary to file
   */
  async saveAISummary(): Promise<void> {
    const summary = await this.generateAISummary();
    const summaryPath = path.join(this.templatesDir, "ai-template-summary.md");

    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }

    fs.writeFileSync(summaryPath, summary);
    console.log(`📋 AI template summary saved to: ${summaryPath}`);
  }

  /**
   * Categorize templates by product type
   */
  private categorizeTemplates(templates: any[]): { [category: string]: TemplateInfo[] } {
    const categories: { [category: string]: TemplateInfo[] } = {};

    for (const template of templates) {
      const blueprintTitle = template.metadata.blueprint.title.toLowerCase();
      const description = template.metadata.blueprint.description.toLowerCase();

      let category = "other";

      // Categorize based on keywords
      if (blueprintTitle.includes("t-shirt") || blueprintTitle.includes("tee") || description.includes("t-shirt")) {
        category = "t-shirts";
      } else if (blueprintTitle.includes("hoodie") || description.includes("hoodie")) {
        category = "hoodies";
      } else if (blueprintTitle.includes("mug") || description.includes("mug")) {
        category = "mugs";
      } else if (blueprintTitle.includes("poster") || description.includes("poster")) {
        category = "posters";
      } else if (blueprintTitle.includes("sticker") || description.includes("sticker")) {
        category = "stickers";
      } else if (blueprintTitle.includes("phone") || description.includes("phone")) {
        category = "phone-cases";
      } else if (blueprintTitle.includes("hat") || description.includes("hat")) {
        category = "hats";
      } else if (blueprintTitle.includes("bag") || description.includes("bag")) {
        category = "bags";
      } else if (blueprintTitle.includes("pillow") || description.includes("pillow")) {
        category = "pillows";
      } else if (blueprintTitle.includes("towel") || description.includes("towel")) {
        category = "towels";
      } else if (blueprintTitle.includes("socks") || description.includes("socks")) {
        category = "socks";
      } else if (blueprintTitle.includes("underwear") || description.includes("underwear")) {
        category = "underwear";
      } else if (blueprintTitle.includes("dress") || description.includes("dress")) {
        category = "dresses";
      } else if (blueprintTitle.includes("pants") || description.includes("pants") || blueprintTitle.includes("trousers")) {
        category = "pants";
      } else if (blueprintTitle.includes("shirt") || description.includes("shirt")) {
        category = "shirts";
      } else if (blueprintTitle.includes("sweatshirt") || description.includes("sweatshirt")) {
        category = "sweatshirts";
      } else if (blueprintTitle.includes("jacket") || description.includes("jacket")) {
        category = "jackets";
      } else if (blueprintTitle.includes("sweater") || description.includes("sweater")) {
        category = "sweaters";
      } else if (blueprintTitle.includes("cardigan") || description.includes("cardigan")) {
        category = "cardigans";
      } else if (blueprintTitle.includes("tank") || description.includes("tank")) {
        category = "tank-tops";
      } else if (blueprintTitle.includes("long") && (blueprintTitle.includes("sleeve") || description.includes("long sleeve"))) {
        category = "long-sleeve";
      } else if (blueprintTitle.includes("short") && (blueprintTitle.includes("sleeve") || description.includes("short sleeve"))) {
        category = "short-sleeve";
      }

      if (!categories[category]) {
        categories[category] = [];
      }

      categories[category].push({
        blueprint_id: template.blueprint_id,
        print_provider_id: template.print_provider_id,
        blueprint_title: template.metadata.blueprint.title,
        print_provider_title: template.metadata.print_provider.title,
        blueprint_description: template.metadata.blueprint.description,
        print_provider_location: template.metadata.print_provider.location,
        variants_count: template.metadata.variants_count,
        template_path: template.template_path,
        sample_template: template.sample_template,
      });
    }

    return categories;
  }

  /**
   * Group templates by blueprint
   */
  private groupByBlueprint(templates: TemplateInfo[]): { [blueprint: string]: TemplateInfo[] } {
    const groups: { [blueprint: string]: TemplateInfo[] } = {};

    for (const template of templates) {
      if (!groups[template.blueprint_title]) {
        groups[template.blueprint_title] = [];
      }
      groups[template.blueprint_title].push(template);
    }

    return groups;
  }
}
