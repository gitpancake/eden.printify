# Eden Printify Integration

A simple, efficient system for AI to discover and create Printify products.

## Quick Setup

```bash
yarn install
echo "PRINTIFY_API_TOKEN=your_token" >> .env
echo "PRINTIFY_SHOP_ID=your_shop_id" >> .env
```

## Core Commands

```bash
# See available product types
yarn start show-categories

# Find products (e.g., t-shirts under $30)
yarn start discover-products t-shirts 3000

# Search by keywords
yarn start search-products premium cotton

# Generate product template
yarn start generate-dynamic-template 5 50

# Create product with images
yarn start process-with-images product.json
```

## AI Integration

The system provides 3 simple steps for AI:

1. **Discover**: Find suitable products by category/price/keywords
2. **Generate**: Create product template with customizations
3. **Create**: Build the actual product with images

## Product Categories

- **t-shirts**: $20-30
- **hoodies**: $40-50
- **mugs**: $15-20
- **posters**: $15-25
- **phone-cases**: $15-25
- **bags**: $25-35

## Key Benefits

✅ **Fast**: Discover products in seconds  
✅ **Smart**: AI can find best products automatically  
✅ **Simple**: Just 3 commands for full integration  
✅ **Reliable**: Handles errors gracefully

## For Gene

See [EDEN_INTEGRATION_GUIDE.md](EDEN_INTEGRATION_GUIDE.md) for detailed integration instructions.

The system is designed to be plug-and-play for Eden's AI platform.
