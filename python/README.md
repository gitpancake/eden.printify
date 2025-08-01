# Printify Product Creation Workflow

A streamlined, two-step workflow for creating products on Printify with automatic image upload and product management.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [Template System](#template-system)
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

- ✅ **Two-step workflow** - Simple and intuitive
- ✅ **Automatic image upload** - No manual image management
- ✅ **Template system** - Reusable product templates
- ✅ **Error handling** - Clear error messages and recovery
- ✅ **Production ready** - Handles real Printify API integration

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
python step1_download_template.py --help
```

## ⚙️ Configuration

### 1. Create Environment File

Create a `.env` file in the project directory:

```env
PRINTIFY_API_TOKEN=your_api_token_here
PRINTIFY_SHOP_ID=your_shop_id_here
```

### 2. Get Your Credentials

#### API Token

1. Log into your Printify account
2. Go to **Settings** → **API Keys**
3. Click **Generate API Key**
4. Copy the generated token

#### Shop ID

1. In your Printify dashboard, note the shop ID from the URL
2. Or use the API to list your shops

### 3. Test Configuration

```bash
# This will verify your credentials work
python step1_download_template.py
```

## 🚀 Usage Guide

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

**Output example:**

```
📥 Step 1: Fetching Template from Printify
==================================================
✅ Configuration loaded successfully
   API Token: eyJ0eXAiOi...
   Shop ID: 23645042

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

### How Templates Work

1. **API Fetching**: The script connects to Printify's API to get real product data
2. **Blueprint Selection**: Currently uses blueprint ID 15 (t-shirt) by default
3. **Provider Selection**: Uses print provider ID 3 (Marco Fine Arts) by default
4. **Variant Selection**: Automatically selects the first available variant
5. **Template Storage**: Saves the fetched template to `templates/template.json`

### Customizing Template Sources

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

The fetched template follows Printify's exact format:

```json
{
  "title": "Custom Men's Very Important Tee",
  "description": "A beautiful custom men's very important tee",
  "blueprint_id": 15, // Product type from Printify
  "print_provider_id": 3, // Print provider from Printify
  "variants": [
    // Real variant data from Printify
    {
      "id": 13629, // Actual variant ID from Printify
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
  ]
}
```

### Finding Blueprint and Provider IDs

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

# Run step 1
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
from step1_download_template import download_template
from step2_upload_product import upload_product

# Download template
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

async def create_multiple_products(product_configs):
    results = []

    for config in product_configs:
        # Download template
        await download_template()

        # Customize product
        with open('product.json', 'r') as f:
            product_data = json.load(f)

        product_data['title'] = config['title']
        product_data['price'] = config['price']

        with open('product.json', 'w') as f:
            json.dump(product_data, f, indent=2)

        # Upload product
        result = await upload_product()
        results.append(result)

    return results

# Usage
configs = [
    {'title': 'Product 1', 'price': 2500},
    {'title': 'Product 2', 'price': 3000},
    {'title': 'Product 3', 'price': 3500}
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

| Variable             | Description             | Required |
| -------------------- | ----------------------- | -------- |
| `PRINTIFY_API_TOKEN` | Your Printify API token | Yes      |
| `PRINTIFY_SHOP_ID`   | Your Printify shop ID   | Yes      |

### File Structure

| File                  | Purpose                 | Generated |
| --------------------- | ----------------------- | --------- |
| `product.json`        | Product configuration   | Yes       |
| `template_info.json`  | Template selection info | Yes       |
| `upload_results.json` | Upload results/errors   | Yes       |

### Return Values

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

You now have a complete, production-ready Printify product creation workflow!

**Next steps:**

1. Create your own templates
2. Integrate with your application
3. Set up automated workflows
4. Scale to multiple products

**Need help?** Check the troubleshooting section or review the API reference above.
