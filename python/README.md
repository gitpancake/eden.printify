# Eden Printify Product Creator - Python Version

A powerful Python CLI tool for creating and managing products on Printify with automatic image processing.

## Quick Setup

1. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   Create a `.env` file in the python directory:

   ```bash
   PRINTIFY_API_TOKEN=your_api_token_here
   PRINTIFY_SHOP_ID=your_shop_id_here
   DEFAULT_PRODUCT_JSON_PATH=./product.json
   ```

3. **Test the installation:**
   ```bash
   python main.py --help
   ```

## Core Commands

### Product Management

- `python main.py create [--file-path PATH]` - Create product from JSON file
- `python main.py list-shops` - List all available shops
- `python main.py list-products` - List all products in current shop

### Debugging & Discovery

- `python main.py debug-blueprints` - List all available blueprints
- `python main.py debug-blueprint <id>` - Debug specific blueprint
- `python main.py debug-structure <bp> <pp>` - Show product structure
- `python main.py debug-print-provider <id>` - Debug print provider

### Image Processing

- `python main.py upload-image <path>` - Upload image to Printify
- `python main.py create-with-image [--file-path PATH]` - Create with uploaded image
- `python main.py process-with-images [--file-path PATH]` - Process JSON with image uploads

### Template Generation

- `python main.py generate-template <bp> <pp>` - Generate template for blueprint/provider
- `python main.py generate-popular-templates` - Generate popular templates
- `python main.py generate-all-templates` - Generate ALL templates (for AI use)
- `python main.py list-templates` - List available templates
- `python main.py list-all-templates` - List generated templates

## AI Integration

### Dynamic Discovery (Recommended)

- `python main.py show-categories` - Show available product categories
- `python main.py discover-products [category] [max-price] [location]` - Discover products
- `python main.py search-products <keywords...>` - Search by keywords
- `python main.py generate-dynamic-template <bp> <pp> [customizations]` - Generate on-demand

### Static Templates (Legacy)

- `python main.py generate-ai-summary` - Generate AI-friendly summary
- `python main.py show-ai-context` - Show AI context information

## Examples

### Basic Usage

```bash
# Create a product from JSON file
python main.py create

# List available blueprints
python main.py debug-blueprints

# Generate a template for blueprint 5, provider 50
python main.py generate-template 5 50

# Upload an image
python main.py upload-image ./my-image.png
```

### AI Integration Examples

```bash
# Discover t-shirt products
python main.py discover-products t-shirts

# Find hoodies under $30
python main.py discover-products hoodies 3000

# Search for premium cotton products
python main.py search-products premium cotton

# Generate dynamic template
python main.py generate-dynamic-template 15 3

# Generate with customizations
python main.py generate-dynamic-template 15 3 '{"title":"Custom Product","price":3000}'
```

## Product Categories

Available categories include:

- **t-shirts** - T-shirts and tees
- **hoodies** - Hoodies and sweatshirts
- **mugs** - Coffee mugs and cups
- **posters** - Posters and prints
- **phone-cases** - Phone cases
- **bags** - Tote bags and backpacks
- **hats** - Caps and hats
- **tank-tops** - Tank tops and sleeveless
- **stickers** - Stickers and decals
- **pillows** - Throw pillows
- **towels** - Towels and bath items
- **socks** - Socks and hosiery
- **jackets** - Jackets and outerwear
- **dresses** - Dresses and gowns
- **pants** - Pants and leggings

## Key Benefits

✅ **Full Feature Parity** - All TypeScript functionality available in Python  
✅ **Easy Installation** - Simple pip install with requirements.txt  
✅ **CLI Interface** - Clean Click-based command line interface  
✅ **Type Safety** - Pydantic models for data validation  
✅ **Error Handling** - Comprehensive error handling and logging  
✅ **AI Integration** - Dynamic discovery and template generation  
✅ **Image Processing** - Automatic image upload and processing  
✅ **Template System** - Generate and manage product templates

## Error Handling

The Python version includes robust error handling:

- API rate limiting with automatic delays
- Detailed error messages with context
- Graceful fallbacks for missing data
- Validation of all inputs and responses

## Development

### Project Structure

```
python/
├── main.py                 # Main CLI entry point
├── requirements.txt        # Python dependencies
├── README.md              # This file
└── src/
    ├── services/          # API and business logic
    ├── utils/             # Helper utilities
    └── types/             # Pydantic models
```

### Adding New Commands

1. Add the command function to `main.py`
2. Add the handler function
3. Update the help documentation

### Testing

```bash
# Test basic functionality
python main.py --help

# Test configuration loading
python main.py debug-blueprints

# Test template generation
python main.py generate-template 5 50
```

## Migration from TypeScript

If you're migrating from the TypeScript version:

1. Install Python dependencies: `pip install -r requirements.txt`
2. Copy your `.env` file to the python directory
3. Replace `yarn start` commands with `python main.py`
4. All functionality is preserved with the same API

## Support

For issues and questions:

1. Check the error messages for specific guidance
2. Verify your API token and shop ID are correct
3. Ensure all required dependencies are installed
4. Test with the debug commands to verify connectivity
