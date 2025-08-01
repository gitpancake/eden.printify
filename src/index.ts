import { PrintifyApiClient } from "./services/printifyApi";
import { ProductService } from "./services/productService";
import { AITemplateHelper } from "./utils/aiTemplateHelper";
import { loadConfig, validateConfig } from "./utils/config";
import { DebugHelper } from "./utils/debugHelper";
import { DynamicTemplateHelper } from "./utils/dynamicTemplateHelper";
import { ImageUploader } from "./utils/imageUploader";
import { ProductImageProcessor } from "./utils/productImageProcessor";
import { ProductTemplateGenerator } from "./utils/productTemplateGenerator";
import { TemplateGenerator } from "./utils/templateGenerator";

async function main() {
  try {
    console.log("🚀 Starting Eden Printify Product Creator...\n");

    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || "create";

    // Handle help command without requiring configuration
    if (command === "help") {
      showHelp();
      return;
    }

    // Load and validate configuration for other commands
    console.log("📋 Loading configuration...");
    const config = loadConfig();
    validateConfig(config);
    console.log("✅ Configuration loaded successfully\n");

    // Initialize API client and services
    console.log("🔧 Initializing services...");
    const apiClient = new PrintifyApiClient(config.printifyApiToken, config.printifyShopId);
    const productService = new ProductService(apiClient);
    const debugHelper = new DebugHelper(apiClient);
    const imageUploader = new ImageUploader(config.printifyApiToken);
    const templateGenerator = new ProductTemplateGenerator(apiClient);
    const imageProcessor = new ProductImageProcessor(config.printifyApiToken);
    const templateGen = new TemplateGenerator();
    const aiHelper = new AITemplateHelper();
    const dynamicHelper = new DynamicTemplateHelper();
    console.log("✅ Services initialized successfully\n");

    switch (command) {
      case "create":
        const createProductPath = args[1] || config.defaultProductJsonPath;
        await handleCreateProduct(productService, createProductPath);
        break;

      case "list-shops":
        await handleListShops(productService);
        break;

      case "list-products":
        await handleListProducts(productService);
        break;

      case "debug-blueprints":
        await handleDebugBlueprints(debugHelper);
        break;

      case "debug-blueprint":
        const debugBlueprintId = parseInt(args[1]);
        if (isNaN(debugBlueprintId)) {
          console.log("❌ Please provide a valid blueprint ID");
          console.log("Usage: yarn start debug-blueprint <blueprint_id>");
          process.exit(1);
        }
        await handleDebugBlueprint(debugHelper, debugBlueprintId);
        break;

      case "debug-structure":
        const bpId = parseInt(args[1]);
        const ppId = parseInt(args[2]);
        if (isNaN(bpId) || isNaN(ppId)) {
          console.log("❌ Please provide valid blueprint ID and print provider ID");
          console.log("Usage: yarn start debug-structure <blueprint_id> <print_provider_id>");
          process.exit(1);
        }
        await handleDebugStructure(debugHelper, bpId, ppId);
        break;

      case "debug-print-provider":
        const providerId = parseInt(args[1]);
        if (isNaN(providerId)) {
          console.log("❌ Please provide a valid print provider ID");
          console.log("Usage: yarn start debug-print-provider <provider_id>");
          process.exit(1);
        }
        await handleDebugPrintProvider(debugHelper, providerId);
        break;

      case "upload-image":
        const imagePath = args[1];
        if (!imagePath) {
          console.log("❌ Please provide an image path");
          console.log("Usage: yarn start upload-image <image_path>");
          process.exit(1);
        }
        await handleUploadImage(imageUploader, imagePath);
        break;

      case "create-with-image":
        const createWithImagePath = args[1] || config.defaultProductJsonPath;
        await handleCreateWithImage(productService, imageUploader, createWithImagePath);
        break;

      case "generate-template":
        const blueprintId = parseInt(args[1]);
        const printProviderId = parseInt(args[2]);
        if (isNaN(blueprintId) || isNaN(printProviderId)) {
          console.log("❌ Please provide valid blueprint ID and print provider ID");
          console.log("Usage: yarn start generate-template <blueprint_id> <print_provider_id>");
          process.exit(1);
        }
        await handleGenerateTemplate(templateGenerator, blueprintId, printProviderId);
        break;

      case "generate-popular-templates":
        await handleGeneratePopularTemplates(templateGenerator);
        break;

      case "list-templates":
        await handleListTemplates(templateGenerator);
        break;

      case "generate-all-templates":
        await handleGenerateAllTemplates(templateGen);
        break;

      case "list-all-templates":
        await handleListAllTemplates(templateGen);
        break;

      case "process-with-images":
        const processImagePath = args[1] || config.defaultProductJsonPath;
        await handleProcessWithImages(imageProcessor, productService, processImagePath);
        break;

      case "generate-ai-summary":
        await handleGenerateAISummary(aiHelper);
        break;

      case "show-ai-context":
        await handleShowAIContext(aiHelper);
        break;

      // New dynamic template commands
      case "discover-products":
        await handleDiscoverProducts(dynamicHelper, args[1], args[2], args[3]);
        break;

      case "search-products":
        await handleSearchProducts(dynamicHelper, args.slice(1));
        break;

      case "generate-dynamic-template":
        await handleGenerateDynamicTemplate(dynamicHelper, args[1], args[2], args[3]);
        break;

      case "show-categories":
        await handleShowCategories(dynamicHelper);
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error("❌ Application error:", error);
    process.exit(1);
  }
}

async function handleCreateProduct(productService: ProductService, productJsonPath: string) {
  console.log(`🎯 Creating product from: ${productJsonPath}`);

  try {
    const createdProduct = await productService.createProductFromFile(productJsonPath);

    console.log("\n🎉 Product creation completed successfully!");
    console.log("📊 Product Details:");
    console.log(`   ID: ${createdProduct.id}`);
    console.log(`   Title: ${createdProduct.title}`);
    console.log(`   Description: ${createdProduct.description}`);
    console.log(`   Blueprint ID: ${createdProduct.blueprint_id}`);
    console.log(`   Print Provider ID: ${createdProduct.print_provider_id}`);
    console.log(`   Variants: ${createdProduct.variants.length}`);
    console.log(`   Print Areas: ${createdProduct.print_areas.length}`);
  } catch (error) {
    console.error("❌ Failed to create product:", error);
    throw error;
  }
}

async function handleListShops(productService: ProductService) {
  console.log("🏪 Listing available shops...\n");

  try {
    await productService.listShops();
  } catch (error) {
    console.error("❌ Failed to list shops:", error);
    throw error;
  }
}

async function handleListProducts(productService: ProductService) {
  console.log("📦 Listing products in current shop...\n");

  try {
    await productService.listProducts();
  } catch (error) {
    console.error("❌ Failed to list products:", error);
    throw error;
  }
}

async function handleDebugBlueprints(debugHelper: DebugHelper) {
  console.log("🔍 Debugging blueprints...\n");

  try {
    await debugHelper.debugBlueprints();
  } catch (error) {
    console.error("❌ Failed to debug blueprints:", error);
    throw error;
  }
}

async function handleDebugBlueprint(debugHelper: DebugHelper, blueprintId: number) {
  console.log(`🔍 Debugging blueprint ${blueprintId}...\n`);

  try {
    await debugHelper.debugBlueprintComplete(blueprintId);
  } catch (error) {
    console.error(`❌ Failed to debug blueprint ${blueprintId}:`, error);
    throw error;
  }
}

async function handleDebugStructure(debugHelper: DebugHelper, blueprintId: number, printProviderId: number) {
  console.log(`🔍 Debugging structure for blueprint ${blueprintId}, print provider ${printProviderId}...\n`);

  try {
    await debugHelper.showRecommendedProductStructure(blueprintId, printProviderId);
  } catch (error) {
    console.error(`❌ Failed to debug structure:`, error);
    throw error;
  }
}

async function handleDebugPrintProvider(debugHelper: DebugHelper, providerId: number) {
  console.log(`🔍 Debugging print provider with ID: ${providerId}...\n`);

  try {
    await debugHelper.debugPrintProvider(providerId);
  } catch (error) {
    console.error(`❌ Failed to debug print provider:`, error);
    throw error;
  }
}

async function handleUploadImage(imageUploader: ImageUploader, imagePath: string) {
  console.log(`📤 Uploading image: ${imagePath}\n`);

  try {
    const result = await imageUploader.uploadImage(imagePath);
    console.log("✅ Image uploaded successfully!");
    console.log(`   ID: ${result.id}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   Preview URL: ${result.preview_url}`);
  } catch (error) {
    console.error("❌ Failed to upload image:", error);
    throw error;
  }
}

async function handleCreateWithImage(productService: ProductService, imageUploader: ImageUploader, productJsonPath: string) {
  console.log(`🎯 Creating product with uploaded image from: ${productJsonPath}\n`);

  try {
    // First, create a test image and upload it
    console.log("📤 Preparing and uploading test image...");
    const testImagePath = await imageUploader.createTestImage();
    const uploadedImage = await imageUploader.uploadImage(testImagePath);

    // Update the product.json with the uploaded image URLs
    console.log("📝 Updating product.json with uploaded image URLs...");
    const updatedProductPath = await updateProductWithImage(productJsonPath, uploadedImage);

    // Create the product
    console.log("🚀 Creating product with uploaded image...");
    const createdProduct = await productService.createProductFromFile(updatedProductPath);

    console.log("\n🎉 Product creation completed successfully!");
    console.log("📊 Product Details:");
    console.log(`   ID: ${createdProduct.id}`);
    console.log(`   Title: ${createdProduct.title}`);
    console.log(`   Description: ${createdProduct.description}`);
    console.log(`   Blueprint ID: ${createdProduct.blueprint_id}`);
    console.log(`   Print Provider ID: ${createdProduct.print_provider_id}`);
    console.log(`   Variants: ${createdProduct.variants.length}`);
    console.log(`   Print Areas: ${createdProduct.print_areas.length}`);
  } catch (error) {
    console.error("❌ Failed to create product with image:", error);
    throw error;
  }
}

async function updateProductWithImage(productJsonPath: string, uploadedImage: { id: string; url: string; preview_url: string }): Promise<string> {
  const fs = require("fs");
  const productData = JSON.parse(fs.readFileSync(productJsonPath, "utf8"));

  // Update all image URLs in the product data
  productData.print_areas.forEach((printArea: any) => {
    printArea.placeholders.forEach((placeholder: any) => {
      placeholder.images.forEach((image: any) => {
        image.id = uploadedImage.id;
        image.url = uploadedImage.url;
        image.preview_url = uploadedImage.preview_url;
      });
    });
  });

  // Write the updated product data to a temporary file
  const updatedPath = productJsonPath.replace(".json", "-with-image.json");
  fs.writeFileSync(updatedPath, JSON.stringify(productData, null, 2));

  return updatedPath;
}

async function handleGenerateTemplate(templateGenerator: ProductTemplateGenerator, blueprintId: number, printProviderId: number) {
  console.log(`🎨 Generating template for blueprint ${blueprintId}, print provider ${printProviderId}...\n`);

  try {
    const templatePath = await templateGenerator.generateTemplate(blueprintId, printProviderId);
    console.log(`✅ Template generated successfully: ${templatePath}`);
    console.log("💡 You can now edit this template and use it to create products!");
  } catch (error) {
    console.error("❌ Failed to generate template:", error);
    throw error;
  }
}

async function handleGeneratePopularTemplates(templateGenerator: ProductTemplateGenerator) {
  console.log("🎨 Generating popular product templates...\n");

  try {
    const generatedFiles = await templateGenerator.generatePopularTemplates();
    console.log(`✅ Generated ${generatedFiles.length} popular templates`);
    console.log("💡 You can now edit these templates and use them to create products!");
  } catch (error) {
    console.error("❌ Failed to generate popular templates:", error);
    throw error;
  }
}

async function handleListTemplates(templateGenerator: ProductTemplateGenerator) {
  console.log("📋 Listing available templates...\n");

  try {
    await templateGenerator.listAvailableTemplates();
  } catch (error) {
    console.error("❌ Failed to list templates:", error);
    throw error;
  }
}

async function handleGenerateAllTemplates(templateGen: TemplateGenerator) {
  try {
    console.log("🚀 Starting comprehensive template generation...");

    await templateGen.generateAllTemplates();

    console.log("\n🎉 All templates generated successfully!");
    console.log("📁 Templates saved to: templates/ directory");
    console.log("📋 Summary available at: templates/templates-summary.json");
  } catch (error) {
    console.error("❌ Error generating all templates:", error.message);
    process.exit(1);
  }
}

async function handleListAllTemplates(templateGen: TemplateGenerator) {
  try {
    console.log("📋 Loading template information...");

    const templateInfo = await templateGen.getTemplateInfo();

    console.log("\n📊 Template Summary:");
    console.log(`   Total blueprints: ${templateInfo.summary.total_blueprints}`);
    console.log(`   Total templates: ${templateInfo.total_templates}`);
    console.log(`   Generated at: ${templateInfo.summary.generated_at}`);

    console.log("\n📁 Available Blueprints:");
    templateInfo.summary.blueprints.forEach((bp: any) => {
      console.log(`   ${bp.id}: ${bp.title} (${bp.brand})`);
    });

    console.log("\n📋 Template Structure:");
    console.log(`   Directory: ${templateInfo.summary.template_structure.directory}`);
    console.log(`   Format: ${templateInfo.summary.template_structure.format}`);

    console.log("\n🤖 AI Usage Instructions:");
    console.log(`   ${templateInfo.summary.usage_instructions.for_ai}`);
    console.log(`   ${templateInfo.summary.usage_instructions.template_selection}`);
    console.log(`   ${templateInfo.summary.usage_instructions.customization}`);
  } catch (error) {
    console.error("❌ Error loading template information:", error.message);
    console.log("💡 Run 'yarn start generate-all-templates' first to generate templates");
    process.exit(1);
  }
}

async function handleProcessWithImages(imageProcessor: ProductImageProcessor, productService: ProductService, productJsonPath: string) {
  console.log(`🔄 Processing product with images: ${productJsonPath}\n`);

  try {
    // Process the product: extract images, upload them, and replace with real IDs
    const processedProductPath = await imageProcessor.processProductWithImages(productJsonPath);

    // Create the product with the processed file
    console.log(`🚀 Creating product with uploaded images...`);
    const createdProduct = await productService.createProductFromFile(processedProductPath);

    console.log("\n🎉 Product creation completed successfully!");
    console.log("📊 Product Details:");
    console.log(`   ID: ${createdProduct.id}`);
    console.log(`   Title: ${createdProduct.title}`);
    console.log(`   Description: ${createdProduct.description}`);
    console.log(`   Blueprint ID: ${createdProduct.blueprint_id}`);
    console.log(`   Print Provider ID: ${createdProduct.print_provider_id}`);
    console.log(`   Variants: ${createdProduct.variants.length}`);
    console.log(`   Print Areas: ${createdProduct.print_areas.length}`);
  } catch (error) {
    console.error("❌ Failed to process product with images:", error);
    throw error;
  }
}

async function handleGenerateAISummary(aiHelper: AITemplateHelper) {
  try {
    console.log("🤖 Generating AI-friendly template summary...");

    await aiHelper.saveAISummary();

    console.log("✅ AI summary generated successfully!");
    console.log("📁 Summary saved to: templates/ai-template-summary.md");
  } catch (error) {
    console.error("❌ Error generating AI summary:", error.message);
    console.log("💡 Run 'yarn start generate-all-templates' first to generate templates");
    process.exit(1);
  }
}

async function handleShowAIContext(aiHelper: AITemplateHelper) {
  try {
    console.log("🤖 Loading AI template context...");

    const context = await aiHelper.getAITemplateContext();

    console.log("\n📊 AI Template Context:");
    console.log(`   Total Blueprints: ${context.total_blueprints}`);
    console.log(`   Total Templates: ${context.total_templates}`);

    console.log("\n📁 Available Categories:");
    const categories = await aiHelper.getPopularCategories();
    for (const category of categories.slice(0, 10)) {
      // Show top 10
      const templates = context.categories[category];
      console.log(`   ${category}: ${templates.length} templates`);
    }

    console.log("\n🔍 Sample Templates by Category:");
    for (const [category, templates] of Object.entries(context.categories)) {
      if (templates.length > 0) {
        const sample = templates[0];
        console.log(`   ${category}: ${sample.blueprint_title} (${sample.print_provider_title})`);
      }
    }

    console.log("\n💡 AI Usage Tips:");
    console.log("   - Use 'findTemplatesByCategory()' to get templates by product type");
    console.log("   - Use 'findTemplatesByKeywords()' to search by keywords");
    console.log("   - Use 'getTemplateByIds()' to get specific template by IDs");
    console.log("   - All templates include complete product configurations");
  } catch (error) {
    console.error("❌ Error loading AI context:", error.message);
    console.log("💡 Run 'yarn start generate-all-templates' first to generate templates");
    process.exit(1);
  }
}

async function handleDiscoverProducts(dynamicHelper: DynamicTemplateHelper, category?: string, maxPrice?: string, location?: string) {
  console.log("🔍 Discovering products...");

  const maxPriceNum = maxPrice ? parseInt(maxPrice) : undefined;
  const suggestions = await dynamicHelper.getProductSuggestions(category, maxPriceNum, location);

  console.log(`\n📋 Found ${suggestions.length} product suggestions:`);
  console.log("=".repeat(80));

  suggestions.forEach((suggestion, index) => {
    console.log(`${index + 1}. ${suggestion.blueprint_title}`);
    console.log(`   Provider: ${suggestion.print_provider_title}`);
    console.log(`   Category: ${suggestion.category}`);
    console.log(`   Price: $${(suggestion.estimated_price / 100).toFixed(2)}`);
    console.log(`   Popularity: ${suggestion.popularity_score}/100`);
    console.log(`   IDs: Blueprint ${suggestion.blueprint_id}, Provider ${suggestion.print_provider_id}`);
    console.log(`   Description: ${suggestion.description.substring(0, 100)}...`);
    console.log("");
  });

  console.log("💡 Use 'generate-dynamic-template <blueprint_id> <provider_id> [customizations]' to create a template");
}

async function handleSearchProducts(dynamicHelper: DynamicTemplateHelper, keywords: string[]) {
  if (keywords.length === 0) {
    console.log("❌ Please provide search keywords");
    return;
  }

  console.log(`🔍 Searching for products with keywords: ${keywords.join(", ")}`);

  const suggestions = await dynamicHelper.searchProducts(keywords);

  console.log(`\n📋 Found ${suggestions.length} matching products:`);
  console.log("=".repeat(80));

  suggestions.forEach((suggestion, index) => {
    console.log(`${index + 1}. ${suggestion.blueprint_title}`);
    console.log(`   Provider: ${suggestion.print_provider_title}`);
    console.log(`   Category: ${suggestion.category}`);
    console.log(`   Price: $${(suggestion.estimated_price / 100).toFixed(2)}`);
    console.log(`   IDs: Blueprint ${suggestion.blueprint_id}, Provider ${suggestion.print_provider_id}`);
    console.log("");
  });
}

async function handleGenerateDynamicTemplate(dynamicHelper: DynamicTemplateHelper, blueprintId: string, providerId: string, customizations?: string) {
  if (!blueprintId || !providerId) {
    console.log("❌ Please provide blueprint_id and provider_id");
    return;
  }

  console.log("🔧 Generating dynamic template...");

  let customizationsObj = {};
  if (customizations) {
    try {
      customizationsObj = JSON.parse(customizations);
    } catch (error) {
      console.log("⚠️  Invalid customizations JSON, using defaults");
    }
  }

  const template = await dynamicHelper.generateProductTemplate(parseInt(blueprintId), parseInt(providerId), customizationsObj);

  // Save template to file
  const filename = `dynamic-template-${blueprintId}-${providerId}.json`;
  const fs = require("fs");
  fs.writeFileSync(filename, JSON.stringify(template, null, 2));

  console.log(`✅ Template generated and saved to: ${filename}`);
  console.log(`📋 Template includes:`);
  console.log(`   - Title: ${template.title}`);
  console.log(`   - Blueprint ID: ${template.blueprint_id}`);
  console.log(`   - Provider ID: ${template.print_provider_id}`);
  console.log(`   - Variants: ${template.variants.length}`);
  console.log(`   - Print Areas: ${template.print_areas.length}`);
}

async function handleShowCategories(dynamicHelper: DynamicTemplateHelper) {
  console.log("📂 Discovering available categories...");

  const categories = await dynamicHelper.getAvailableCategories();

  console.log("\n📋 Available Product Categories:");
  console.log("=".repeat(50));

  const sortedCategories = Object.entries(categories).sort(([, a], [, b]) => b - a);

  sortedCategories.forEach(([category, count]) => {
    console.log(`${category}: ${count} products`);
  });

  console.log(`\n💡 Use 'discover-products <category>' to explore products in a category`);
}

function showHelp() {
  console.log("📖 Eden Printify Product Creator - Usage Guide");
  console.log("\nCommands:");
  console.log("  create [file-path]     Create a product from JSON file (default: ./product.json)");
  console.log("  list-shops            List all available shops");
  console.log("  list-products         List all products in current shop");
  console.log("  debug-blueprints      List all available blueprints");
  console.log("  debug-blueprint <id>  Debug a specific blueprint and its variants");
  console.log("  debug-structure <bp> <pp>  Show recommended product structure for blueprint/print provider");
  console.log("  debug-print-provider <id>  Debug a specific print provider and its variants");
  console.log("  upload-image <path>   Upload an image to Printify");
  console.log("  create-with-image [file-path]  Create product with uploaded image (default: ./product.json)");
  console.log("  generate-template <bp> <pp>  Generate product template for blueprint/print provider");
  console.log("  generate-popular-templates   Generate templates for popular products");
  console.log("  generate-all-templates      Generate ALL templates for every blueprint/print provider combination");
  console.log("  list-templates       List available templates that can be generated");
  console.log("  list-all-templates   List all generated templates with summary information");
  console.log("  generate-ai-summary  Generate AI-friendly template summary and categorization");
  console.log("  show-ai-context      Show AI template context and usage information");
  console.log("  process-with-images [file-path]  Extract images from JSON, upload to Printify, and create product");
  console.log("\n🤖 AI Dynamic Discovery Commands:");
  console.log("  discover-products [category] [max-price] [location]  Discover products dynamically");
  console.log("  search-products <keywords...>  Search products by keywords");
  console.log("  generate-dynamic-template <bp> <pp> [customizations]  Generate template on-demand");
  console.log("  show-categories      Show available product categories");
  console.log("  help                  Show this help message");

  console.log("\nExamples:");
  console.log("  yarn start create                    # Create product from ./product.json");
  console.log("  yarn start create ./my-product.json  # Create product from specific file");
  console.log("  yarn start list-shops               # List available shops");
  console.log("  yarn start list-products            # List products in current shop");
  console.log("  yarn start debug-blueprints         # List all blueprints");
  console.log("  yarn start debug-blueprint 1        # Debug blueprint ID 1");
  console.log("  yarn start debug-structure 1 1      # Show structure for blueprint 1, print provider 1");
  console.log("  yarn start debug-print-provider 3   # Debug print provider ID 3");
  console.log("  yarn start upload-image ./image.png # Upload an image to Printify");
  console.log("  yarn start create-with-image        # Create product with uploaded image");
  console.log("  yarn start generate-template 5 50   # Generate template for blueprint 5, print provider 50");
  console.log("  yarn start generate-popular-templates # Generate templates for popular products");
  console.log("  yarn start generate-all-templates   # Generate ALL possible templates (for AI use)");
  console.log("  yarn start list-all-templates       # List all generated templates with summary");
  console.log("  yarn start generate-ai-summary      # Generate AI-friendly template summary");
  console.log("  yarn start show-ai-context          # Show AI template context and usage");
  console.log("  yarn start list-templates           # List available templates");
  console.log("  yarn start process-with-images      # Process product.json with image uploads");
  console.log("\n🤖 AI Dynamic Examples:");
  console.log("  yarn start discover-products t-shirts  # Discover t-shirt products");
  console.log("  yarn start discover-products hoodies 3000  # Hoodies under $30");
  console.log('  yarn start discover-products mugs 1500 "United States"  # US mugs under $15');
  console.log("  yarn start search-products premium cotton  # Search for premium cotton products");
  console.log("  yarn start generate-dynamic-template 5 50  # Generate template for blueprint 5, provider 50");
  console.log('  yarn start generate-dynamic-template 5 50 \'{"title":"Custom Product","price":3000}\'  # With customizations');
  console.log("  yarn start show-categories           # Show all available categories");

  console.log("\nEnvironment Variables:");
  console.log("  PRINTIFY_API_TOKEN     Your Printify API token (required)");
  console.log("  PRINTIFY_SHOP_ID       Your Printify shop ID (required)");
  console.log("  DEFAULT_PRODUCT_JSON_PATH  Default path for product.json (optional, default: ./product.json)");

  console.log("\nProduct JSON Format:");
  console.log("  {");
  console.log('    "title": "Product Title",');
  console.log('    "description": "Product Description",');
  console.log('    "blueprint_id": 123,');
  console.log('    "print_provider_id": 456,');
  console.log('    "variants": [...],');
  console.log('    "print_areas": [...]');
  console.log("  }");

  console.log("\nFor more information about the Printify API, visit: https://developers.printify.com/");
}

// Run the application
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  });
}
