# Dynamic AI Integration Guide

## Overview

The Dynamic AI Integration system provides a much more efficient way for AI agents to discover and work with Printify products. Instead of pre-generating all 778+ templates, the AI can now dynamically discover products based on requirements and generate templates on-demand.

## Key Benefits

- **Efficiency**: No need to download 778+ templates upfront
- **Flexibility**: AI can discover products based on specific requirements
- **Performance**: Faster startup and reduced storage requirements
- **Intelligence**: Smart filtering by category, price, location, and keywords
- **Real-time**: Always up-to-date with current Printify catalog

## Commands

### 1. Discover Available Categories

```bash
yarn start show-categories
```

Shows all available product categories with counts:

- t-shirts: 163 products
- hoodies: 91 products
- mugs: 50 products
- etc.

### 2. Discover Products by Category

```bash
yarn start discover-products <category> [max-price] [location]
```

**Examples:**

```bash
# Discover all t-shirts
yarn start discover-products t-shirts

# Discover hoodies under $30
yarn start discover-products hoodies 3000

# Discover US-based mugs under $15
yarn start discover-products mugs 1500 "United States"
```

### 3. Search Products by Keywords

```bash
yarn start search-products <keyword1> <keyword2> ...
```

**Examples:**

```bash
# Search for premium cotton products
yarn start search-products premium cotton

# Search for eco-friendly products
yarn start search-products eco organic sustainable

# Search for specific brands
yarn start search-products gildan champion
```

### 4. Generate Dynamic Template

```bash
yarn start generate-dynamic-template <blueprint_id> <provider_id> [customizations]
```

**Examples:**

```bash
# Generate basic template
yarn start generate-dynamic-template 5 50

# Generate with customizations
yarn start generate-dynamic-template 5 50 '{"title":"Custom Product","price":3000}'
```

## AI Integration Workflow

### Step 1: Understand Requirements

The AI should first understand what type of product is needed:

- Product category (t-shirts, hoodies, mugs, etc.)
- Price range
- Location preferences
- Specific features (premium, organic, etc.)

### Step 2: Discover Options

Use the discovery commands to find suitable products:

```typescript
// Example AI workflow
const category = "t-shirts";
const maxPrice = 3000; // $30.00
const location = "United States";

// Discover products matching criteria
const suggestions = await discoverProducts(category, maxPrice, location);
```

### Step 3: Select Best Option

From the suggestions, the AI can select the best option based on:

- Popularity score
- Price
- Provider location
- Product description

### Step 4: Generate Template

Once a product is selected, generate a complete template:

```typescript
const blueprintId = 5;
const providerId = 50;
const customizations = {
  title: "My Custom T-Shirt",
  price: 2500,
  description: "A unique t-shirt design",
};

const template = await generateDynamicTemplate(blueprintId, providerId, customizations);
```

## Available Categories

| Category    | Description                 | Typical Price Range |
| ----------- | --------------------------- | ------------------- |
| t-shirts    | T-shirts and tees           | $20-30              |
| hoodies     | Hoodies and sweatshirts     | $40-50              |
| mugs        | Coffee mugs and cups        | $15-20              |
| posters     | Posters and prints          | $15-25              |
| phone-cases | Phone cases and accessories | $15-25              |
| bags        | Tote bags and backpacks     | $25-35              |
| hats        | Caps and hats               | $20-25              |
| tank-tops   | Tank tops and sleeveless    | $20-25              |
| stickers    | Stickers and decals         | $5-10               |
| pillows     | Throw pillows               | $30-40              |
| towels      | Towels and bath items       | $20-30              |
| socks       | Socks and hosiery           | $10-15              |
| jackets     | Jackets and outerwear       | $50-60              |
| dresses     | Dresses and apparel         | $35-45              |
| pants       | Pants and leggings          | $30-40              |

## Smart Filtering

### Price Filtering

- Filter by maximum price in cents
- Example: `3000` = $30.00 maximum

### Location Filtering

- Filter by print provider location
- Examples: "United States", "Europe", "Canada"

### Popularity Scoring

Products are scored based on:

- Brand popularity (Gildan, Champion, etc.)
- Category popularity
- Provider location (US providers get bonus)
- Overall demand

## Template Generation

When generating a template, the system provides:

1. **Complete Product Structure**: All required fields for Printify API
2. **Variant Information**: Available sizes, colors, etc.
3. **Print Areas**: Where designs can be placed
4. **Placeholder Images**: Ready for replacement with actual designs
5. **Estimated Pricing**: Based on product category
6. **Weight Information**: For shipping calculations

## Error Handling

The system gracefully handles:

- Invalid blueprint/provider combinations
- Missing API data
- Network timeouts
- Rate limiting

## Performance Optimizations

- **Sampling**: Only samples 50 blueprints per discovery to avoid API overload
- **Caching**: Blueprint data is cached during discovery
- **Rate Limiting**: Built-in delays to respect API limits
- **Smart Filtering**: Filters early to reduce API calls

## Example AI Integration

```typescript
class PrintifyAI {
  async createProduct(requirements: ProductRequirements) {
    // 1. Discover suitable products
    const suggestions = await this.discoverProducts(requirements);

    // 2. Select best option
    const selected = this.selectBestOption(suggestions, requirements);

    // 3. Generate template
    const template = await this.generateTemplate(selected, requirements);

    // 4. Customize template
    const customized = this.customizeTemplate(template, requirements);

    // 5. Create product
    return await this.createProduct(customized);
  }

  private async discoverProducts(requirements: ProductRequirements) {
    const { category, maxPrice, location, keywords } = requirements;

    if (keywords) {
      return await this.searchProducts(keywords);
    } else {
      return await this.discoverProducts(category, maxPrice, location);
    }
  }
}
```

## Best Practices

1. **Start with Categories**: Use category-based discovery for broad product types
2. **Refine with Keywords**: Use keyword search for specific features
3. **Consider Popularity**: Higher popularity scores indicate better options
4. **Check Pricing**: Ensure products fit within budget constraints
5. **Validate Combinations**: Always test blueprint/provider combinations
6. **Handle Errors**: Implement fallback options for failed discoveries

## Migration from Static Templates

If you were using the static template system:

**Before (Static):**

```bash
# Generate all templates (slow, storage-heavy)
yarn start generate-all-templates

# Use pre-generated templates
yarn start show-ai-context
```

**After (Dynamic):**

```bash
# Discover products on-demand (fast, efficient)
yarn start discover-products t-shirts

# Generate template only when needed
yarn start generate-dynamic-template 5 50
```

## Conclusion

The Dynamic AI Integration system provides a much more efficient and intelligent way for AI agents to work with Printify products. It eliminates the need for massive template downloads while providing real-time access to the current product catalog with smart filtering and discovery capabilities.
