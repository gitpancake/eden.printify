import { PrintifyApiClient } from "./services/printifyApi";
import { ProductService } from "./services/productService";
import { loadConfig, validateConfig } from "./utils/config";
import { DebugHelper } from "./utils/debugHelper";
import { ImageUploader } from "./utils/imageUploader";
import { ProductImageProcessor } from "./utils/productImageProcessor";
import { ProductTemplateGenerator } from "./utils/productTemplateGenerator";

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

      case "process-with-images":
        const processImagePath = args[1] || config.defaultProductJsonPath;
        await handleProcessWithImages(imageProcessor, productService, processImagePath);
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

function showHelp() {
  console.log(`
📖 Eden Printify Product Creator - Usage Guide

Commands:
  create [file-path]     Create a product from JSON file (default: ./product.json)
  list-shops            List all available shops
  list-products         List all products in current shop
  debug-blueprints      List all available blueprints
  debug-blueprint <id>  Debug a specific blueprint and its variants
  debug-structure <bp> <pp>  Show recommended product structure for blueprint/print provider
  upload-image <path>   Upload an image to Printify
  create-with-image [file-path]  Create product with uploaded image (default: ./product.json)
        generate-template <bp> <pp>  Generate product template for blueprint/print provider
      generate-popular-templates   Generate templates for popular products
      list-templates       List available templates that can be generated
      process-with-images [file-path]  Extract images from JSON, upload to Printify, and create product
      help                  Show this help message

Examples:
  yarn start create                    # Create product from ./product.json
  yarn start create ./my-product.json  # Create product from specific file
  yarn start list-shops               # List available shops
  yarn start list-products            # List products in current shop
  yarn start debug-blueprints         # List all blueprints
  yarn start debug-blueprint 1        # Debug blueprint ID 1
  yarn start debug-structure 1 1      # Show structure for blueprint 1, print provider 1
  yarn start upload-image ./image.png # Upload an image to Printify
  yarn start create-with-image        # Create product with uploaded image
  yarn start generate-template 5 50   # Generate template for blueprint 5, print provider 50
  yarn start generate-popular-templates # Generate templates for popular products
  yarn start list-templates           # List available templates
  yarn start process-with-images      # Process product.json with image uploads

Environment Variables:
  PRINTIFY_API_TOKEN     Your Printify API token (required)
  PRINTIFY_SHOP_ID       Your Printify shop ID (required)
  DEFAULT_PRODUCT_JSON_PATH  Default path for product.json (optional, default: ./product.json)

Product JSON Format:
  {
    "title": "Product Title",
    "description": "Product Description",
    "blueprint_id": 123,
    "print_provider_id": 456,
    "variants": [...],
    "print_areas": [...]
  }

For more information about the Printify API, visit: https://developers.printify.com/
  `);
}

// Run the application
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  });
}
