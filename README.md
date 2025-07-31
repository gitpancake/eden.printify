# Eden Printify Integration

A powerful Node.js CLI tool for creating and managing products on Printify. This tool provides a comprehensive interface to the Printify API with features for product creation, template generation, image management, and debugging.

## ✨ Features

- **Product creation** from JSON files with validation
- **Product template generation** based on blueprint and print provider data
- **Image upload with test image creation** for Printify integration
- **Debug tools** for exploring blueprints, variants, and print providers
- **Interactive setup script** for easy configuration
- **Automatic image processing** - extract images from JSON, upload to Printify, and replace with real IDs
- **Comprehensive validation** and error handling
- **TypeScript support** with full type safety

## 🚀 Quick Start Guide

### Prerequisites

- Node.js 16+ and Yarn
- Printify API token
- Printify shop ID

### Installation

```bash
git clone <repository-url>
cd eden.printify
yarn install
```

### Quick Setup (Recommended)

```bash
yarn setup
```

This interactive script will guide you through setting up your `.env` file with your Printify API token and shop ID.

### Manual Setup

1. **Copy the environment template**:

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`** with your credentials:

   ```bash
   PRINTIFY_API_TOKEN=your_api_token_here
   PRINTIFY_SHOP_ID=your_shop_id_here
   ```

3. **Build the project**:
   ```bash
   yarn build
   ```

## 📖 Usage

### Product Management

```bash
# Create a product from JSON file
yarn start create product.json

# Create a product with automatic image processing
yarn start process-with-images product.json

# Create a product with uploaded image
yarn start create-with-image [file-path]
```

### Template Generation

```bash
# Generate a template for specific blueprint/print provider
yarn start generate-template <blueprint-id> <print-provider-id>

# Generate templates for popular products
yarn start generate-popular-templates

# List available templates
yarn start list-templates
```

### Image Management

```bash
# Upload an image to Printify
yarn start upload-image ./your-design.png

# Create a test image for uploads
yarn create-test-image
```

### Debug and Explore

```bash
# Debug blueprint data
yarn start debug-blueprint <blueprint-id>

# Debug print provider data
yarn start debug-print-provider <print-provider-id>

# Debug variant data
yarn start debug-variant <blueprint-id> <print-provider-id>
```

### Examples

```bash
yarn start generate-template 5 50   # Generate template for blueprint 5, print provider 50
yarn start generate-popular-templates # Generate templates for popular products
yarn start list-templates           # List available templates
yarn start process-with-images      # Process product.json with image uploads
```

## 🔧 Finding Blueprint and Print Provider IDs

### Method 1: Use the CLI (Recommended)

```bash
# List all blueprints
yarn start debug-blueprint

# List all print providers for a blueprint
yarn start debug-print-provider

# List all variants for a blueprint/print provider combination
yarn start debug-variant <blueprint-id> <print-provider-id>
```

### Method 2: Use Printify API Directly

```bash
# Get all blueprints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.printify.com/v1/catalog/blueprints.json

# Get print providers for a blueprint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.printify.com/v1/catalog/blueprints/BLUEPRINT_ID/print_providers.json

# Get variants for a blueprint/print provider
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.printify.com/v1/catalog/blueprints/BLUEPRINT_ID/print_providers/PRINT_PROVIDER_ID/variants.json
```

## 🎨 Generating Product Templates

The template generation feature creates complete product JSON files based on Printify's catalog data:

```bash
# Generate a template for a specific product
yarn start generate-template 5 50

# This creates: product-template-5-50.json
```

The generated template includes:

- ✅ Correct blueprint and print provider IDs
- ✅ Valid variant data with proper options
- ✅ Print areas with placeholders
- ✅ Sample images (placeholder URLs)
- ✅ Sales channel properties
- ✅ All required fields with proper validation

## 🖼️ Image Requirements

Printify has specific requirements for image uploads:

### Image Specifications

- **Format**: PNG, JPG, JPEG
- **Size**: Minimum 100x100 pixels
- **File size**: Maximum 25MB
- **Transparency**: Supported for PNG files
- **Quality**: High resolution recommended for print quality

### Image Upload Workflow

#### Option 1: Manual Upload (Recommended for complex designs)

1. **Upload your own images**:

   ```bash
   yarn start upload-image ./your-design.png
   ```

2. **Use the uploaded image ID** in your product template:

   ```json
   {
     "id": "printify_image_id_here",
     "name": "Your Design Name",
     "url": "https://printify.com/uploaded/image/url",
     "preview_url": "https://printify.com/uploaded/image/preview",
     "x": 0,
     "y": 0,
     "scale": 1,
     "angle": 0
   }
   ```

#### Option 2: Automatic Processing (For compatible images)

1. **Generate a template**:

   ```bash
   yarn start generate-template 5 50
   ```

2. **Upload your design**:

   ```bash
   yarn start upload-image ./my-design.png
   ```

3. **Edit the template** to use the uploaded image ID:

   ```bash
   # Replace the placeholder image IDs with your uploaded image ID
   nano product-template-5-50.json
   ```

4. **Process with automatic image handling**:

   ```bash
   yarn start process-with-images product-template-5-50.json
   ```

## 🛠️ Development Scripts

```bash
yarn build          # Build TypeScript to JavaScript
yarn start          # Run the CLI application
yarn setup          # Interactive setup script
yarn example        # Run example product creation
yarn create-test-image # Create a test image for uploads
```

## 📁 Project Structure

```
eden.printify/
├── src/
│   ├── index.ts                    # Main CLI entry point
│   ├── services/
│   │   ├── printifyApi.ts          # Printify API client
│   │   └── productService.ts       # Product management logic
│   ├── types/
│   │   └── printify.ts             # TypeScript type definitions
│   └── utils/
│       ├── config.ts               # Configuration management
│       ├── debugHelper.ts          # Debug utilities
│       ├── imageUploader.ts        # Image upload functionality
│       ├── productValidator.ts     # Product validation
│       └── productTemplateGenerator.ts # Template generation
├── product.json                    # Sample product configuration
├── setup.js                        # Interactive setup script
├── create-test-image.js            # Test image creation script
└── README.md                       # This file
```

## 🔍 Troubleshooting

### Common Issues

1. **"Provided images do not exist" error**:

   - Images must be uploaded to Printify first
   - Use the manual upload workflow described above
   - Ensure image URLs are from Printify's domain

2. **Image upload validation failures**:

   - Check image format (PNG, JPG, JPEG)
   - Verify image size (minimum 100x100 pixels)
   - Ensure file size is under 25MB

3. **Product validation errors**:
   - Use the template generation feature to create valid templates
   - Check that all required fields are present
   - Verify blueprint and print provider IDs are correct

### Getting Help

- Check the `IMAGE_UPLOAD_GUIDE.md` for detailed image upload instructions
- Use the debug commands to explore available options
- Review the generated templates for proper structure

## 📄 License

This project is licensed under the MIT License.
