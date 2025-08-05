# Printify Template Fetcher

A comprehensive Python script to fetch and explore templates from the Printify API.

## Features

- 🔍 **List all available blueprints** (product types)
- ⭐ **Show popular template combinations**
- 📥 **Fetch specific templates** by blueprint and provider IDs
- 💾 **Save templates** to JSON files for editing
- 🎨 **Auto-generate print areas** with placeholder images
- 📋 **Comprehensive metadata** including blueprint and provider details

## Prerequisites

1. **Python 3.7+** installed
2. **Printify API credentials** in a `.env` file:
   ```
   PRINTIFY_API_TOKEN=your_api_token_here
   PRINTIFY_SHOP_ID=your_shop_id_here
   ```
3. **Required Python packages** (install with `pip install -r requirements.txt`):
   - requests
   - pydantic
   - python-dotenv

## Usage

### Basic Commands

```bash
# Show help and usage examples
python fetch_templates.py

# List all available blueprints
python fetch_templates.py --list

# Show popular template combinations
python fetch_templates.py --popular

# Fetch a specific template
python fetch_templates.py --blueprint 15 --provider 3

# Fetch with custom name
python fetch_templates.py --blueprint 15 --provider 3 --name "My Custom T-Shirt"

# Fetch with custom output filename
python fetch_templates.py --blueprint 15 --provider 3 --output my_template.json
```

### Quick Start

1. **Explore available templates:**

   ```bash
   python fetch_templates.py --popular
   ```

2. **Choose a template and fetch it:**

   ```bash
   python fetch_templates.py --blueprint 15 --provider 3
   ```

3. **Edit the generated template file** in the `templates/` directory

4. **Upload your product:**
   ```bash
   python step2_upload_product.py
   ```

## Popular Template Combinations

The script includes a curated list of popular template combinations:

| #   | Name                | Blueprint ID | Provider ID | Category |
| --- | ------------------- | ------------ | ----------- | -------- |
| 1   | Classic T-Shirt     | 15           | 3           | Apparel  |
| 2   | Premium T-Shirt     | 15           | 1           | Apparel  |
| 3   | Long Sleeve T-Shirt | 16           | 3           | Apparel  |
| 4   | Hoodie              | 17           | 3           | Apparel  |
| 5   | Sweatshirt          | 18           | 3           | Apparel  |
| 6   | Tank Top            | 19           | 3           | Apparel  |
| 7   | V-Neck T-Shirt      | 20           | 3           | Apparel  |
| 8   | Polo Shirt          | 21           | 3           | Apparel  |
| 9   | Baseball Jersey     | 22           | 3           | Apparel  |
| 10  | Raglan T-Shirt      | 23           | 3           | Apparel  |
| 11  | Baby Bodysuit       | 24           | 3           | Apparel  |
| 12  | Kids T-Shirt        | 25           | 3           | Apparel  |
| 13  | Kids Hoodie         | 26           | 3           | Apparel  |
| 14  | Kids Sweatshirt     | 27           | 3           | Apparel  |
| 15  | Kids Tank Top       | 28           | 3           | Apparel  |

## Output

The script creates:

1. **Template files** in the `templates/` directory
2. **Auto-generated filenames** based on blueprint and provider names
3. **Complete template structure** with:
   - Title and description
   - Blueprint and provider details
   - Variants with pricing
   - Print areas with placeholder images
   - Metadata (fetch timestamp, brand, model, location)

## Template Structure

Each fetched template includes:

```json
{
  "title": "Custom T-Shirt",
  "description": "A beautiful custom t-shirt",
  "blueprint_id": 15,
  "print_provider_id": 3,
  "blueprint_title": "T-Shirt",
  "print_provider_title": "Printful",
  "variants": [
    {
      "id": 13629,
      "title": "Default Variant",
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
  ],
  "metadata": {
    "fetched_at": 1234567890.123,
    "blueprint_brand": "Gildan",
    "blueprint_model": "5000",
    "provider_location": "United States"
  }
}
```

## Next Steps

After fetching a template:

1. **Edit the template file** to customize:

   - Title and description
   - Pricing
   - Images (replace placeholder URLs)
   - Print area positions

2. **Use the template** with other scripts:
   - `step2_upload_product.py` - Upload to Printify
   - `product_template_generator.py` - Generate variations
   - `ai_template_helper.py` - AI-powered customization

## Error Handling

The script includes comprehensive error handling:

- ✅ **Configuration validation** - Checks for `.env` file and credentials
- ✅ **API error reporting** - Detailed error messages with status codes
- ✅ **Graceful fallbacks** - Creates basic templates when data is missing
- ✅ **File validation** - Ensures output directories exist

## Troubleshooting

**Common Issues:**

1. **Missing .env file:**

   ```
   ❌ Error: .env file not found!
   ```

   **Solution:** Create a `.env` file with your Printify credentials

2. **Invalid API token:**

   ```
   ❌ Failed to fetch blueprints: 401 Unauthorized
   ```

   **Solution:** Check your API token in the `.env` file

3. **Invalid blueprint/provider IDs:**
   ```
   ❌ Failed to fetch template: 404 Not Found
   ```
   **Solution:** Use `--list` to see valid blueprint IDs, then `--popular` for valid combinations

## Integration

This script integrates with the existing Eden Printify workflow:

- **Input:** Uses existing configuration and API client
- **Output:** Creates templates compatible with `step2_upload_product.py`
- **Format:** Follows the same JSON structure as other scripts
- **Directory:** Saves to `templates/` directory for organization
