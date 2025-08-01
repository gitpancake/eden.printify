# Eden Printify Integration Guide

## Quick Start for Gene

### 1. Setup (One-time)

```bash
# Clone and setup
git clone <repository>
cd eden.printify
yarn install

# Add your Printify credentials to .env
echo "PRINTIFY_API_TOKEN=your_token_here" >> .env
echo "PRINTIFY_SHOP_ID=your_shop_id_here" >> .env
```

### 2. Core Commands for AI Integration

```bash
# Discover what products are available
yarn start show-categories

# Find specific products (e.g., t-shirts under $30)
yarn start discover-products t-shirts 3000

# Search by keywords
yarn start search-products premium cotton

# Generate a product template
yarn start generate-dynamic-template 5 50
```

## AI Integration Flow

### Step 1: Discover Products

```typescript
// When user wants to create a product, first discover options
const suggestions = await discoverProducts("t-shirts", 3000); // category, maxPrice
// Returns: [{ blueprint_id: 5, print_provider_id: 50, title: "Unisex Cotton Tee", price: 2500, popularity_score: 85 }]
```

### Step 2: Generate Template

```typescript
// Once user selects a product, generate template
const template = await generateTemplate(5, 50, {
  title: "My Custom T-Shirt",
  price: 2500,
  description: "A unique design",
});
```

### Step 3: Create Product

```typescript
// Use the template to create the actual product
const product = await createProduct(template);
```

## Available Product Categories

| Category    | Examples                  | Price Range |
| ----------- | ------------------------- | ----------- |
| t-shirts    | Cotton tees, fashion tees | $20-30      |
| hoodies     | Sweatshirts, pullovers    | $40-50      |
| mugs        | Coffee mugs, travel cups  | $15-20      |
| posters     | Wall art, prints          | $15-25      |
| phone-cases | Phone covers              | $15-25      |
| bags        | Tote bags, backpacks      | $25-35      |

## Simple API for Eden

### Discover Products

```typescript
// Find products by category
const tshirts = await discoverProducts("t-shirts", 3000); // max $30

// Search by keywords
const premium = await searchProducts(["premium", "cotton"]);

// Get all categories
const categories = await showCategories();
```

### Generate Product Template

```typescript
// Create template for specific product
const template = await generateTemplate(blueprintId, providerId, {
  title: "Custom Product",
  price: 2500, // in cents
  description: "Product description",
});
```

### Create Product with Images

```typescript
// Process product with automatic image upload
const product = await processWithImages(template, imageUrls);
```

## Key Benefits for Eden

✅ **Fast**: Discover products in seconds  
✅ **Smart**: AI can find the best products automatically  
✅ **Flexible**: Works with any product type  
✅ **Reliable**: Handles errors gracefully  
✅ **Real-time**: Always up-to-date catalog

## Error Handling

The system handles:

- Invalid product combinations
- Network timeouts
- Missing data
- Rate limiting

## Example Eden Integration

```typescript
class EdenPrintifyService {
  async createProduct(userRequest: string) {
    // 1. Parse user request (e.g., "I want a t-shirt under $30")
    const requirements = this.parseRequest(userRequest);

    // 2. Discover suitable products
    const suggestions = await this.discoverProducts(requirements);

    // 3. Let AI select best option
    const selected = this.selectBestProduct(suggestions);

    // 4. Generate template
    const template = await this.generateTemplate(selected);

    // 5. Create product
    return await this.createProduct(template);
  }
}
```

## Commands Reference

| Command                     | Purpose                 | Example                                       |
| --------------------------- | ----------------------- | --------------------------------------------- |
| `show-categories`           | See all product types   | `yarn start show-categories`                  |
| `discover-products`         | Find products by type   | `yarn start discover-products t-shirts 3000`  |
| `search-products`           | Search by keywords      | `yarn start search-products premium cotton`   |
| `generate-dynamic-template` | Create product template | `yarn start generate-dynamic-template 5 50`   |
| `process-with-images`       | Create with images      | `yarn start process-with-images product.json` |

That's it! The system is designed to be simple and reliable for AI integration.
