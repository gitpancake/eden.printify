# 🤖 AI Integration Guide for Eden Printify

## 🎯 Overview

This guide explains how to integrate the Eden Printify system with AI applications to automatically generate and create products using comprehensive template knowledge.

## 🚀 Quick Start for AI Integration

### 1. Generate All Templates

```bash
# Generate all possible templates for every blueprint/print provider combination
yarn start generate-all-templates
```

### 2. Generate AI-Friendly Summary

```bash
# Create AI-friendly template summary and categorization
yarn start generate-ai-summary
```

### 3. View AI Context

```bash
# See available templates and categories for AI
yarn start show-ai-context
```

## 📁 Template Structure

### Directory Organization

```
templates/
├── templates-summary.json          # Complete template summary
├── ai-template-summary.md          # AI-friendly markdown summary
└── blueprint-{id}/
    └── provider-{id}/
        └── {product_name}.json     # Individual template files
```

### Template File Format

Each template file contains:

```json
{
  "metadata": {
    "generated_at": "2025-07-31T...",
    "blueprint": {
      "id": 5,
      "title": "Unisex Crew T-Shirt",
      "description": "Premium cotton crew neck t-shirt",
      "brand": "Gildan",
      "model": "5000"
    },
    "print_provider": {
      "id": 50,
      "title": "Printful",
      "location": "United States"
    },
    "variants_count": 54,
    "template_type": "complete_product_template"
  },
  "template": {
    "title": "Unisex Crew T-Shirt - Printful",
    "description": "A unisex crew t-shirt product from Printful...",
    "blueprint_id": 5,
    "print_provider_id": 50,
    "variants": [...],
    "print_areas": [...]
  }
}
```

## 🔧 AI Integration Methods

### 1. Using AITemplateHelper Class

```typescript
import { AITemplateHelper } from "./src/utils/aiTemplateHelper";

const aiHelper = new AITemplateHelper();

// Get comprehensive template context
const context = await aiHelper.getAITemplateContext();

// Find templates by category
const tshirtTemplates = await aiHelper.findTemplatesByCategory("t-shirts");

// Find templates by keywords
const cottonTemplates = await aiHelper.findTemplatesByKeywords(["cotton", "premium"]);

// Get specific template by IDs
const template = await aiHelper.getTemplateByIds(5, 50);

// Get popular categories
const categories = await aiHelper.getPopularCategories();
```

### 2. Direct File Access

```typescript
import * as fs from "fs";
import * as path from "path";

// Load template summary
const summaryPath = path.join(process.cwd(), "templates", "templates-summary.json");
const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));

// Load specific template
const templatePath = "templates/blueprint-5/provider-50/Unisex_Crew_T_Shirt_Printful.json";
const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));
```

## 📊 Available Categories

The system automatically categorizes templates into:

- **t-shirts**: T-shirts, tees, crew necks
- **hoodies**: Hooded sweatshirts
- **mugs**: Coffee mugs, drinkware
- **posters**: Wall art, prints
- **stickers**: Decals, labels
- **phone-cases**: Phone covers
- **hats**: Baseball caps, beanies
- **bags**: Tote bags, backpacks
- **pillows**: Throw pillows, cushions
- **towels**: Bath towels, hand towels
- **socks**: Ankle socks, crew socks
- **underwear**: Briefs, boxers
- **dresses**: Dresses, gowns
- **pants**: Trousers, jeans
- **shirts**: Button-up shirts
- **sweatshirts**: Sweatshirts, pullovers
- **jackets**: Jackets, coats
- **sweaters**: Sweaters, cardigans
- **tank-tops**: Tank tops, sleeveless
- **long-sleeve**: Long sleeve shirts
- **short-sleeve**: Short sleeve shirts
- **other**: Miscellaneous products

## 🎯 AI Workflow Examples

### Example 1: Create a T-Shirt Product

```typescript
// 1. Find t-shirt templates
const tshirtTemplates = await aiHelper.findTemplatesByCategory("t-shirts");

// 2. Select appropriate template (e.g., premium cotton)
const selectedTemplate = tshirtTemplates.find((t) => t.blueprint_title.includes("Premium") || t.blueprint_title.includes("Gildan"));

// 3. Customize template
const productConfig = {
  ...selectedTemplate.sample_template,
  title: "My Custom T-Shirt Design",
  description: "A unique t-shirt with my custom design",
  variants: selectedTemplate.sample_template.variants.map((variant) => ({
    ...variant,
    price: 3000, // $30.00
  })),
};

// 4. Replace placeholder images with actual designs
productConfig.print_areas = productConfig.print_areas.map((area) => ({
  ...area,
  placeholders: area.placeholders.map((placeholder) => ({
    ...placeholder,
    images: [
      {
        ...placeholder.images[0],
        url: "https://my-design-url.com/design.png",
        preview_url: "https://my-design-url.com/design.png",
      },
    ],
  })),
}));

// 5. Save product configuration
fs.writeFileSync("my-product.json", JSON.stringify(productConfig, null, 2));

// 6. Create product with automatic image processing
// yarn start process-with-images my-product.json
```

### Example 2: Batch Product Creation

```typescript
// 1. Get all available templates
const context = await aiHelper.getAITemplateContext();

// 2. Create products for different categories
const productConfigs = [];

// T-shirt product
const tshirtTemplate = await aiHelper.findTemplatesByCategory("t-shirts");
if (tshirtTemplate.length > 0) {
  productConfigs.push({
    category: "t-shirt",
    template: tshirtTemplate[0],
    customizations: {
      title: "Custom T-Shirt",
      price: 2500,
    },
  });
}

// Mug product
const mugTemplate = await aiHelper.findTemplatesByCategory("mugs");
if (mugTemplate.length > 0) {
  productConfigs.push({
    category: "mug",
    template: mugTemplate[0],
    customizations: {
      title: "Custom Mug",
      price: 1500,
    },
  });
}

// 3. Generate product files
for (const config of productConfigs) {
  const productConfig = {
    ...config.template.sample_template,
    title: config.customizations.title,
    variants: config.template.sample_template.variants.map((v) => ({
      ...v,
      price: config.customizations.price,
    })),
  };

  fs.writeFileSync(`${config.category}-product.json`, JSON.stringify(productConfig, null, 2));
}
```

## 🔍 Template Selection Strategies

### 1. Category-Based Selection

```typescript
// For clothing products
const clothingCategories = ["t-shirts", "hoodies", "sweatshirts", "shirts"];
const clothingTemplates = [];
for (const category of clothingCategories) {
  const templates = await aiHelper.findTemplatesByCategory(category);
  clothingTemplates.push(...templates);
}
```

### 2. Keyword-Based Selection

```typescript
// For premium products
const premiumKeywords = ["premium", "organic", "cotton", "high-quality"];
const premiumTemplates = await aiHelper.findTemplatesByKeywords(premiumKeywords);
```

### 3. Location-Based Selection

```typescript
// For specific regions
const usTemplates = context.templates.filter((t) => t.print_provider_location === "United States");
```

### 4. Price-Based Selection

```typescript
// For budget-friendly products
const budgetTemplates = context.templates.filter(
  (t) => t.sample_template.variants.some((v) => v.price <= 2000) // $20 or less
);
```

## 🛠️ Advanced AI Integration

### 1. Template Caching

```typescript
class TemplateCache {
  private cache: Map<string, any> = new Map();

  async getTemplate(blueprintId: number, printProviderId: number) {
    const key = `${blueprintId}-${printProviderId}`;

    if (!this.cache.has(key)) {
      const aiHelper = new AITemplateHelper();
      const template = await aiHelper.getTemplateByIds(blueprintId, printProviderId);
      this.cache.set(key, template);
    }

    return this.cache.get(key);
  }
}
```

### 2. Template Validation

```typescript
function validateTemplate(template: any): boolean {
  const required = ["title", "blueprint_id", "print_provider_id", "variants", "print_areas"];

  for (const field of required) {
    if (!template[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  return true;
}
```

### 3. Template Optimization

```typescript
function optimizeTemplate(template: any, requirements: any) {
  // Filter variants based on requirements
  if (requirements.sizes) {
    template.variants = template.variants.filter((v) => v.options.some((opt) => requirements.sizes.includes(opt.value)));
  }

  // Adjust pricing based on requirements
  if (requirements.priceRange) {
    template.variants = template.variants.map((v) => ({
      ...v,
      price: Math.max(requirements.priceRange.min, Math.min(requirements.priceRange.max, v.price)),
    }));
  }

  return template;
}
```

## 📋 Best Practices for AI Integration

### 1. Template Selection

- **Use categories first**: Start with category-based selection for broad product types
- **Refine with keywords**: Use keywords to narrow down specific features
- **Consider location**: Choose print providers based on shipping requirements
- **Validate availability**: Check that variants are available and enabled

### 2. Customization

- **Preserve structure**: Keep the template structure intact while customizing content
- **Validate changes**: Ensure all required fields remain present
- **Test configurations**: Validate product configurations before creation
- **Handle errors**: Implement proper error handling for missing templates

### 3. Performance

- **Cache templates**: Cache frequently used templates to reduce API calls
- **Batch operations**: Process multiple products in batches
- **Rate limiting**: Respect Printify API rate limits
- **Error recovery**: Implement retry logic for failed operations

### 4. Quality Assurance

- **Template validation**: Validate templates before use
- **Product testing**: Test product creation with sample data
- **Image validation**: Ensure images meet Printify requirements
- **Price validation**: Verify pricing is within acceptable ranges

## 🚀 Production Deployment

### 1. Environment Setup

```bash
# Set up environment variables
PRINTIFY_API_TOKEN=your_api_token
PRINTIFY_SHOP_ID=your_shop_id

# Generate templates
yarn start generate-all-templates

# Generate AI summary
yarn start generate-ai-summary
```

### 2. Monitoring

- Monitor template generation success rates
- Track product creation performance
- Monitor API rate limit usage
- Log template selection decisions

### 3. Maintenance

- Update templates periodically (weekly/monthly)
- Monitor for new blueprints and print providers
- Validate template accuracy
- Update categorization logic as needed

## 📞 Support and Troubleshooting

### Common Issues

1. **Template not found**: Run `yarn start generate-all-templates` to regenerate
2. **API rate limits**: Implement delays between requests
3. **Invalid templates**: Validate templates before use
4. **Missing categories**: Check template categorization logic

### Getting Help

- Check `templates/ai-template-summary.md` for available options
- Use `yarn start show-ai-context` to explore templates
- Review template files directly for detailed information
- Check Printify API documentation for updates

---

## 🎉 Success Metrics

### Key Performance Indicators

- **Template Coverage**: 100% of available blueprints and print providers
- **Categorization Accuracy**: >95% correct category assignment
- **Template Generation Speed**: <5 minutes for complete generation
- **AI Integration Success**: >90% successful product creation rate

### Quality Metrics

- **Template Completeness**: All required fields present
- **Variant Coverage**: All available variants included
- **Metadata Accuracy**: Correct blueprint and print provider information
- **Categorization Relevance**: Meaningful product categories

**The AI integration system provides comprehensive template knowledge for automated product creation in Printify!** 🤖✨
