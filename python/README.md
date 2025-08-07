# Printify Product Creation Workflow

A comprehensive toolkit for creating products on Printify with template management, automatic image upload, and product creation workflows.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [Template System](#template-system)
- [Template Discovery](#template-discovery)
- [Integration Guide](#integration-guide)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)

## 🎯 Overview

This tool provides a simple, automated way to create products on Printify. It handles the complex process of:

- Template management and selection
- Image upload to Printify's servers
- Product creation with proper formatting
- Error handling and validation

### Key Features

- ✅ **Template Discovery** - Browse and fetch templates from Printify API
- ✅ **Two-step workflow** - Simple and intuitive product creation
- ✅ **Automatic image upload** - No manual image management
- ✅ **Template system** - Reusable product templates with metadata
- ✅ **Error handling** - Clear error messages and recovery
- ✅ **Production ready** - Handles real Printify API integration
- ✅ **Popular templates** - Curated list of common product combinations

## 🔧 Prerequisites

Before using this tool, you need:

1. **Printify Account**

   - Sign up at [printify.com](https://printify.com)
   - Create a shop
   - Get your API token

2. **Python Environment**

   - Python 3.8 or higher
   - pip package manager

3. **API Credentials**
   - Printify API token
   - Shop ID

## 📦 Installation

### 1. Clone or Download

```bash
# If using git
git clone <repository-url>
cd python

# Or download and extract the files
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Verify Installation

```bash
# Test the template fetcher
python fetch_templates.py --help

# Test the main workflow
python step1_download_template.py --help
```

## ⚙️ Configuration

### 1. Create Environment File

Create a `.env` file in the project directory:

```env
PRINTIFY_API_TOKEN=your_api_token_here
```

### 2. Get Your Credentials

#### API Token

1. Log into your Printify account
2. Go to **Settings** → **API Keys**
3. Click **Generate API Key**
4. Copy the generated token

#### Shop ID

The shop ID will be automatically fetched from your Printify account. If you have multiple shops, the first one will be used.

### 3. Test Configuration

```bash
# This will verify your credentials work
python fetch_templates.py --list
```

## 🚀 Usage Guide

### Step 0: Discover Templates (Optional)

Before creating products, you can explore available templates:

```bash
# Show popular template combinations
python fetch_templates.py --popular

# List all available blueprints
python fetch_templates.py --list

# Fetch a specific template
python fetch_templates.py --blueprint 15 --provider 3
```

### Step 1: Download a Template

```bash
python step1_download_template.py
```

**What happens:**

1. Connects to Printify API using your credentials
2. Fetches a real product template (t-shirt by default)
3. Saves the template to `templates/template.json`
4. Creates an empty `product.json` for you to fill in
5. Shows template details and next steps

**Alternative: Use the template fetcher for more control:**

```bash
# Fetch a specific template with custom name
python fetch_templates.py --blueprint 15 --provider 3 --name "My Custom T-Shirt"

# Fetch with custom output filename
python fetch_templates.py --blueprint 15 --provider 3 --output my_template.json
```

**Output example:**

```
📥 Step 1: Fetching Template from Printify
==================================================
✅ Configuration loaded successfully
   API Token: eyJ0eXAiOi...
   Shop ID: Will be fetched automatically

1️⃣ Fetching template from Printify API...
📡 Fetching blueprint 15 from Printify...
✅ Blueprint fetched: Men's Very Important Tee
📡 Fetching print provider 3 from Printify...
✅ Print provider fetched: Marco Fine Arts
📡 Fetching variants from Printify...
✅ Variants fetched: 3 variants available
📋 Using variant: Classic Red / L (ID: 13629)
🎨 Found print area: front
🎨 Found print area: back
✅ Template fetched successfully
   Title: Custom Men's Very Important Tee
   Blueprint ID: 15
   Provider ID: 3
   Variants: 1
   Print Areas: 1

2️⃣ Saving template to templates/template.json...
✅ Template saved to: templates/template.json
   File size: 1431 bytes

3️⃣ Creating empty product.json...
✅ Empty product.json created
   File size: 2 bytes

📝 Next Steps:
   1. Copy the template data from templates/template.json to product.json
   2. Edit the product.json file with your customizations
   3. Update the title, description, and other fields as needed
   4. Add your own images or modify the existing ones
   5. Save the file when you're done
   6. Run: python step2_upload_product.py
```

### Step 2: Edit the Product

Copy the template data from `templates/template.json` to `product.json` and customize:

```json
{
  "title": "My Custom T-Shirt",
  "description": "A beautiful custom t-shirt with amazing design",
  "blueprint_id": 15,
  "print_provider_id": 3,
  "variants": [
    {
      "id": 13629,
      "price": 2500,
      "is_enabled": true,
      "is_default": true,
      "grams": 180,
      "options": []
    }
  ],
  "print_areas": [
    {
      "variant_ids": [13629],
      "placeholders": [
        {
          "position": "front",
          "images": [
            {
              "id": "placeholder_front",
              "name": "Front Design",
              "url": "https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Design+Placeholder",
              "preview_url": "https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Design+Placeholder",
              "x": 0.5,
              "y": 0.5,
              "scale": 1.0,
              "angle": 0
            }
          ]
        }
      ]
    }
  ]
}
```

**Key fields to customize:**

- `title`: Product name
- `description`: Product description
- `price`: Price in cents (e.g., 2500 = $25.00)
- `options`: Color, size, etc.
- `images`: Design images (will be replaced automatically)

### Step 3: Upload to Printify

```bash
python step2_upload_product.py
```

**What happens:**

1. Creates test images for front and back designs
2. Uploads images to Printify
3. Updates product with real image IDs
4. Creates the product on Printify
5. Shows the product URL

**Output example:**

```
📤 Step 2: Uploading Product to Printify
==================================================
✅ Configuration loaded successfully
   API Token: eyJ0eXAiOi...
   Shop ID: 23645042

🖼️  Step 1: Creating and uploading images...
📸 Creating front image...
✅ Created test image: front_test_image.jpg
📸 Creating back image...
✅ Created test image: back_test_image.jpg
📤 Uploading front image to Printify...
✅ Front image uploaded with ID: 688d00da250b5e5ee44f0bd1
📤 Uploading back image to Printify...
✅ Back image uploaded with ID: 688d00dbcf96d3844f15c847

📄 Step 2: Reading and updating product.json...
✅ Product data loaded
🔄 Updating product images with real Printify image IDs...
✅ Updated 1 print areas with real image IDs
🔧 Fixing variant options format...
✅ Fixed 1 variants

🚀 Step 4: Creating product on Printify...
✅ Product created successfully!
   Product ID: 688d0277afda47c9cb05a0ea
   Title: My Custom T-Shirt
   Description: A beautiful custom t-shirt with amazing design
   Blueprint ID: 15
   Print Provider ID: 3
   Variants: 1
   Print Areas: 1

🎉 Product uploaded successfully!

🔗 You can view your product in your Printify dashboard
   Product URL: https://printify.com/app/shops/23645042/products/688d0277afda47c9cb05a0ea
```

## 📁 Template System

### Understanding Templates

Templates are fetched directly from the Printify API and contain real product data:

- Product metadata (title, description)
- Blueprint and provider IDs from Printify
- Real variant configurations with actual IDs
- Print area definitions with correct dimensions
- Comprehensive metadata (brand, model, location, fetch timestamp)

## 🔍 Template Discovery

The `fetch_templates.py` script provides powerful template discovery capabilities:

### Basic Discovery Commands

```bash
# Browse popular combinations
python fetch_templates.py --popular

# Discover all available blueprints
python fetch_templates.py --list

# Fetch specific templates
python fetch_templates.py --blueprint 15 --provider 3

# Fetch with custom name
python fetch_templates.py --blueprint 15 --provider 3 --name "My Custom T-Shirt"

# Fetch with custom output filename
python fetch_templates.py --blueprint 15 --provider 3 --output my_template.json
```

### Popular Template Combinations

| Product Type        | Blueprint ID | Provider ID | Description             |
| ------------------- | ------------ | ----------- | ----------------------- |
| Classic T-Shirt     | 15           | 3           | Standard cotton t-shirt |
| Premium T-Shirt     | 15           | 1           | High-quality t-shirt    |
| Long Sleeve T-Shirt | 16           | 3           | Long sleeve variant     |
| Hoodie              | 17           | 3           | Pullover hoodie         |
| Sweatshirt          | 18           | 3           | Crew neck sweatshirt    |
| Tank Top            | 19           | 3           | Sleeveless tank         |
| V-Neck T-Shirt      | 20           | 3           | V-neck style            |
| Polo Shirt          | 21           | 3           | Collared polo           |
| Baseball Jersey     | 22           | 3           | Baseball style jersey   |
| Raglan T-Shirt      | 23           | 3           | Raglan sleeve style     |
| Baby Bodysuit       | 24           | 3           | Infant bodysuit         |
| Kids T-Shirt        | 25           | 3           | Children's t-shirt      |
| Kids Hoodie         | 26           | 3           | Children's hoodie       |
| Kids Sweatshirt     | 27           | 3           | Children's sweatshirt   |
| Kids Tank Top       | 28           | 3           | Children's tank top     |

### Advanced Discovery Features

#### 1. **Blueprint Exploration**

```bash
# List all available blueprints with IDs and titles
python fetch_templates.py --list
```

#### 2. **Provider Discovery**

```bash
# After finding a blueprint ID, discover its providers
python fetch_templates.py --blueprint 15 --provider 3
```

#### 3. **Template Customization**

```bash
# Fetch with custom naming
python fetch_templates.py --blueprint 15 --provider 3 --name "Premium Cotton T-Shirt"

# Save with custom filename
python fetch_templates.py --blueprint 15 --provider 3 --output premium_tshirt_template.json
```

### Template Discovery Workflow

1. **Start with popular templates:**

   ```bash
   python fetch_templates.py --popular
   ```

2. **Choose a combination and fetch it:**

   ```bash
   python fetch_templates.py --blueprint 15 --provider 3
   ```

3. **Explore different product types:**

   ```bash
   python fetch_templates.py --list
   ```

4. **Customize and save:**
   ```bash
   python fetch_templates.py --blueprint 15 --provider 3 --name "My Brand T-Shirt" --output my_brand_template.json
   ```

### Integration with Main Workflow

The template discovery seamlessly integrates with the main product creation workflow:

```bash
# 1. Discover and fetch a template
python fetch_templates.py --blueprint 15 --provider 3 --output my_template.json

# 2. Edit the template file
# (manually edit my_template.json)

# 3. Use the template for product creation
cp my_template.json product.json
python step2_upload_product.py
```

### How Templates Work

1. **API Fetching**: The script connects to Printify's API to get real product data
2. **Blueprint Selection**: Currently uses blueprint ID 15 (t-shirt) by default
3. **Provider Selection**: Uses print provider ID 3 (Marco Fine Arts) by default
4. **Variant Selection**: Automatically selects the first available variant
5. **Template Storage**: Saves the fetched template to `templates/template.json`

### Customizing Template Sources

#### Method 1: Using the Template Fetcher (Recommended)

Use the `fetch_templates.py` script for easy template selection:

```bash
# Fetch different product types
python fetch_templates.py --blueprint 15 --provider 3  # T-shirt
python fetch_templates.py --blueprint 5 --provider 1   # Mug
python fetch_templates.py --blueprint 1 --provider 2   # Poster
```

#### Method 2: Modifying step1_download_template.py

To use different product types, modify the blueprint and provider IDs in `step1_download_template.py`:

```python
template_data = fetch_printify_template(
    config['printify_api_token'],
    blueprint_id=15,  # Change this for different products
    print_provider_id=3  # Change this for different providers
)
```

**Common Blueprint IDs:**

- `15` - Men's T-Shirt
- `5` - Mug
- `1` - Poster
- `2` - Canvas
- `3` - Framed Poster

### Template Structure

The fetched template follows Printify's exact format with enhanced metadata:

```json
{
  "title": "Custom Men's Very Important Tee",
  "description": "A beautiful custom men's very important tee",
  "blueprint_id": 15, // Product type from Printify
  "print_provider_id": 3, // Print provider from Printify
  "blueprint_title": "Men's Very Important Tee", // Human-readable blueprint name
  "print_provider_title": "Marco Fine Arts", // Human-readable provider name
  "variants": [
    // Real variant data from Printify
    {
      "id": 13629, // Actual variant ID from Printify
      "title": "Classic Red / L", // Variant title
      "price": 2500,
      "is_enabled": true,
      "is_default": true,
      "grams": 180,
      "options": []
    }
  ],
  "print_areas": [
    // Real print areas from Printify
    {
      "variant_ids": [13629],
      "placeholders": [
        {
          "position": "front",
          "images": [
            {
              "id": "placeholder_front",
              "name": "Front Design",
              "url": "https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Design+Placeholder",
              "preview_url": "https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Design+Placeholder",
              "x": 0.5,
              "y": 0.5,
              "scale": 1.0,
              "angle": 0
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "fetched_at": 1234567890.123, // Timestamp when template was fetched
    "blueprint_brand": "Gildan", // Brand information
    "blueprint_model": "5000", // Model information
    "provider_location": "United States" // Provider location
  }
}
```

### Finding Blueprint and Provider IDs

#### Method 1: Using the Template Fetcher (Easiest)

```bash
# List all available blueprints
python fetch_templates.py --list

# Show popular combinations with IDs
python fetch_templates.py --popular
```

#### Method 2: Using Printify's API

Use Printify's API or dashboard to find:

- **Blueprint ID**: Product type (t-shirt = 15, mug = 5, etc.)
- **Provider ID**: Print provider (varies by location)

You can also use the Printify API to discover available options:

```bash
# List all blueprints
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.printify.com/v1/catalog/blueprints.json

# List providers for a blueprint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.printify.com/v1/catalog/blueprints/15/print_providers.json
```

## 🔗 Integration Guide

### Integrating with Your Application

#### 1. Direct Script Execution

```python
import subprocess
import json

# Fetch a specific template
result = subprocess.run(['python', 'fetch_templates.py', '--blueprint', '15', '--provider', '3'],
                       capture_output=True, text=True)

# Run step 1 (or use the fetched template directly)
result = subprocess.run(['python', 'step1_download_template.py'],
                       capture_output=True, text=True)

# Edit product.json programmatically
with open('product.json', 'r') as f:
    product_data = json.load(f)

product_data['title'] = 'My Custom Product'
product_data['price'] = 3000

with open('product.json', 'w') as f:
    json.dump(product_data, f, indent=2)

# Run step 2
result = subprocess.run(['python', 'step2_upload_product.py'],
                       capture_output=True, text=True)
```

#### 2. Import as Modules

```python
import asyncio
from fetch_templates import TemplateFetcher
from step1_download_template import download_template
from step2_upload_product import upload_product

# Initialize template fetcher
fetcher = TemplateFetcher(api_token, shop_id)

# Fetch a specific template
template = fetcher.fetch_template(15, 3, "My Custom T-Shirt")
fetcher.save_template(template, "my_template.json")

# Or use the original workflow
template_result = await download_template()

# Edit product.json manually or programmatically

# Upload product
upload_result = await upload_product()
```

#### 3. API Integration

```python
import requests
import json

# Upload image
def upload_image(image_path, api_token):
    with open(image_path, 'rb') as f:
        image_data = f.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')

    upload_data = {"contents": image_base64}
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        "https://api.printify.com/v1/uploads/images.json",
        headers=headers,
        json=upload_data
    )
    return response.json()

# Create product
def create_product(product_data, shop_id, api_token):
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        f"https://api.printify.com/v1/shops/{shop_id}/products.json",
        headers=headers,
        json=product_data
    )
    return response.json()
```

### Webhook Integration

Set up webhooks to receive notifications when products are created:

```python
from flask import Flask, request

app = Flask(__name__)

@app.route('/webhook/printify', methods=['POST'])
def printify_webhook():
    data = request.json

    if data['event'] == 'product.created':
        product_id = data['data']['id']
        # Handle product creation
        print(f"Product created: {product_id}")

    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(port=5000)
```

### Batch Processing

For creating multiple products:

```python
import asyncio
import json
from fetch_templates import TemplateFetcher

async def create_multiple_products(product_configs):
    results = []
    fetcher = TemplateFetcher(api_token, shop_id)

    for config in product_configs:
        # Fetch specific template for each product
        template = fetcher.fetch_template(
            config['blueprint_id'],
            config['provider_id'],
            config['title']
        )

        # Save template
        filename = f"template_{config['title'].replace(' ', '_').lower()}.json"
        fetcher.save_template(template, filename)

        # Customize product
        template['title'] = config['title']
        template['price'] = config['price']

        # Save as product.json for upload
        with open('product.json', 'w') as f:
            json.dump(template, f, indent=2)

        # Upload product
        result = await upload_product()
        results.append(result)

    return results

# Usage
configs = [
    {'title': 'Product 1', 'price': 2500, 'blueprint_id': 15, 'provider_id': 3},
    {'title': 'Product 2', 'price': 3000, 'blueprint_id': 16, 'provider_id': 3},
    {'title': 'Product 3', 'price': 3500, 'blueprint_id': 17, 'provider_id': 3}
]

results = asyncio.run(create_multiple_products(configs))
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. "No template files found"

**Problem:** No templates in the `templates/` directory
**Solution:** Add template files to the `templates/` directory

#### 2. "API token not found"

**Problem:** Missing or incorrect API token
**Solution:** Check your `.env` file and API token

#### 3. "Image upload failed"

**Problem:** Image format or size issues
**Solution:** Use JPEG/PNG images under 10MB

#### 4. "Product creation failed"

**Problem:** Invalid product data
**Solution:** Check the product.json format and required fields

### Debug Mode

Enable debug logging by setting environment variables:

```bash
export DEBUG=1
python step2_upload_product.py
```

### Error Logs

Check error logs in:

- `upload_results.json` - Upload errors
- `template_info.json` - Template selection info

### Getting Help

1. **Check the logs** - Look at error messages
2. **Verify credentials** - Test API token and shop ID
3. **Validate JSON** - Check product.json format
4. **Test connectivity** - Ensure internet connection

## 📚 API Reference

### Environment Variables

| Variable             | Description             | Required                   |
| -------------------- | ----------------------- | -------------------------- |
| `PRINTIFY_API_TOKEN` | Your Printify API token | Yes                        |
| `PRINTIFY_SHOP_ID`   | Your Printify shop ID   | No (fetched automatically) |

### File Structure

| File                  | Purpose                 | Generated |
| --------------------- | ----------------------- | --------- |
| `product.json`        | Product configuration   | Yes       |
| `template_info.json`  | Template selection info | Yes       |
| `upload_results.json` | Upload results/errors   | Yes       |
| `templates/*.json`    | Template files          | Yes       |

### Return Values

#### fetch_templates.py

```python
{
    "template_source": "printify_api",
    "template_data": {
        "title": "Custom T-Shirt",
        "blueprint_id": 15,
        "print_provider_id": 3,
        "blueprint_title": "T-Shirt",
        "print_provider_title": "Printful",
        "variants": [...],
        "print_areas": [...],
        "metadata": {...}
    }
}
```

#### step1_download_template.py

```python
{
    "template_file": "templates/default-template.json",
    "template_data": {...}
}
```

#### step2_upload_product.py

```python
{
    "upload_timestamp": 1234567890.123,
    "product_id": "688d0277afda47c9cb05a0ea",
    "product_title": "My Product",
    "images_uploaded": {
        "front_image_id": "688d00da250b5e5ee44f0bd1",
        "back_image_id": "688d00dbcf96d3844f15c847"
    },
    "product_data": {...},
    "status": "success"
}
```

## 🎉 Success!

You now have a complete, production-ready Printify product creation workflow with template discovery capabilities!

**Next steps:**

1. **Explore templates** - Use `python fetch_templates.py --popular` to see available options
2. **Create your own templates** - Fetch and customize templates for your products
3. **Integrate with your application** - Use the provided integration examples
4. **Set up automated workflows** - Implement batch processing for multiple products
5. **Scale to multiple products** - Leverage the template system for consistent product creation

**Available Scripts:**

- `fetch_templates.py` - Discover and fetch templates from Printify API
- `step1_download_template.py` - Download default template for quick start
- `step2_upload_product.py` - Upload customized products to Printify

**Need help?** Check the troubleshooting section or review the API reference above.
