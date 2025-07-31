# Team Handoff Documentation

## 🎯 Project Overview

**Eden Printify Integration** is a production-ready Node.js CLI tool for creating and managing products on Printify with automatic image processing capabilities.

### Key Features

- ✅ **Automatic Image Processing**: Extract images from JSON, upload to Printify, create products
- ✅ **Product Template Generation**: Generate templates from Printify catalog data
- ✅ **Comprehensive Debug Tools**: Explore blueprints, variants, and print providers
- ✅ **Robust Error Handling**: Graceful handling of all edge cases
- ✅ **TypeScript Support**: Full type safety throughout the application

## 🚀 Quick Start for New Team Members

### Prerequisites

- Node.js 16+ and Yarn
- Printify API token and shop ID

### Setup

```bash
# 1. Install dependencies
yarn install

# 2. Build the project
yarn build

# 3. Run interactive setup
yarn setup

# 4. Test the system
yarn example
```

### First Product Creation

```bash
# Process a product with automatic image upload
yarn start process-with-images product.json
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
│       ├── productTemplateGenerator.ts # Template generation
│       └── productImageProcessor.ts # NEW: Automatic image processing
├── product.json                    # Sample product configuration
├── setup.js                        # Interactive setup script
├── create-test-image.js            # Test image creation script
└── README.md                       # Comprehensive documentation
```

## 🔧 Core Components

### 1. ProductImageProcessor (`src/utils/productImageProcessor.ts`)

**Purpose**: Handles automatic image extraction, upload, and replacement

**Key Methods**:

- `processProductWithImages()`: Main entry point for image processing
- `uploadImageUrlToPrintify()`: Uploads images using Printify's URL-based API
- `replaceImageUrls()`: Replaces external URLs with Printify image IDs
- `cleanProductData()`: Removes incompatible data for better compatibility

**Usage**:

```bash
yarn start process-with-images product.json
```

### 2. ProductTemplateGenerator (`src/utils/productTemplateGenerator.ts`)

**Purpose**: Generates product templates from Printify catalog data

**Key Methods**:

- `generateTemplate()`: Generate template for specific blueprint/provider
- `generatePopularTemplates()`: Generate templates for common products
- `listAvailableTemplates()`: List available template options

**Usage**:

```bash
yarn start generate-template 5 50
yarn start generate-popular-templates
```

### 3. PrintifyApiClient (`src/services/printifyApi.ts`)

**Purpose**: Handles all Printify API interactions

**Key Methods**:

- `createProduct()`: Create products in Printify
- `getBlueprints()`: Fetch available blueprints
- `getPrintProviders()`: Fetch print providers for blueprints
- `getVariants()`: Fetch variants for blueprint/provider combinations

### 4. ProductService (`src/services/productService.ts`)

**Purpose**: High-level product management logic

**Key Methods**:

- `createProductFromFile()`: Create product from JSON file
- `readProductJson()`: Read and validate product JSON
- `validateProduct()`: Comprehensive product validation

## 🛠️ Development Workflow

### Adding New Features

1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Implement in TypeScript**: Add new functionality in `src/`
3. **Update CLI**: Add new commands in `src/index.ts`
4. **Add tests**: Create tests for new functionality
5. **Update documentation**: Update README and help system
6. **Build and test**: `yarn build && yarn test`

### Code Style Guidelines

- **TypeScript**: Use strict typing throughout
- **Error Handling**: Always handle errors gracefully with meaningful messages
- **Logging**: Use consistent emoji-based logging for user feedback
- **Documentation**: Document all public methods and complex logic

### Testing New Features

```bash
# Build the project
yarn build

# Test specific functionality
yarn start debug-blueprint 5
yarn start generate-template 5 50
yarn start process-with-images test-product.json
```

## 🔍 Troubleshooting Guide

### Common Issues

#### 1. "Provided images do not exist" Error

**Cause**: Images not uploaded to Printify
**Solution**: Use `process-with-images` command or upload manually via Printify web interface

#### 2. Image Upload Validation Failures

**Cause**: Images don't meet Printify requirements
**Solution**:

- Check image format (PNG, JPG, JPEG)
- Verify size (minimum 100x100 pixels)
- Ensure file size under 25MB

#### 3. Sales Channel Properties Errors

**Cause**: Shop doesn't have required sales channels connected
**Solution**: The system automatically removes incompatible sales channel properties

#### 4. API Rate Limiting

**Cause**: Too many requests to Printify API
**Solution**: Implement request throttling or wait between requests

### Debug Commands

```bash
# Debug blueprint data
yarn start debug-blueprint 5

# Debug print provider data
yarn start debug-print-provider 50

# Debug variant data
yarn start debug-variant 5 50

# List available blueprints
yarn start debug-blueprint
```

## 📚 API Reference

### Printify API Endpoints Used

- `GET /v1/catalog/blueprints.json` - Get available blueprints
- `GET /v1/catalog/blueprints/{id}/print_providers.json` - Get print providers
- `GET /v1/catalog/blueprints/{id}/print_providers/{id}/variants.json` - Get variants
- `POST /v1/uploads/images.json` - Upload images
- `POST /v1/shops/{id}/products.json` - Create products

### Rate Limits

- 600 requests per minute (global)
- 200 product publishing requests per 30 minutes
- Error rate must not exceed 5% of total requests

## 🚀 Deployment & Production

### Environment Variables

```bash
PRINTIFY_API_TOKEN=your_api_token_here
PRINTIFY_SHOP_ID=your_shop_id_here
```

### Production Checklist

- [ ] Environment variables configured
- [ ] API token has required permissions
- [ ] Shop ID is correct and accessible
- [ ] Rate limiting implemented
- [ ] Error monitoring configured
- [ ] Logging configured for production

### Monitoring

- Monitor API rate limits
- Track product creation success rates
- Monitor image upload success rates
- Watch for validation errors

## 🔮 Future Enhancements

### Planned Features

1. **Batch Processing**: Process multiple products simultaneously
2. **Webhook Integration**: Real-time product updates
3. **Advanced Image Processing**: Image optimization and validation
4. **Sales Channel Integration**: Direct integration with Shopify, WooCommerce, etc.
5. **Product Analytics**: Track product performance and sales

### Technical Improvements

1. **Caching**: Cache blueprint and variant data
2. **Retry Logic**: Implement exponential backoff for failed requests
3. **Parallel Processing**: Process images in parallel for better performance
4. **Configuration Management**: Support for multiple environments

## 📞 Support & Maintenance

### Getting Help

1. **Check Documentation**: Start with README.md and this handoff guide
2. **Use Debug Commands**: Use built-in debug tools to explore issues
3. **Check Logs**: Review error messages and API responses
4. **Printify Support**: For API-specific issues, contact Printify support

### Maintenance Tasks

- **Weekly**: Check for API changes and updates
- **Monthly**: Review error logs and performance metrics
- **Quarterly**: Update dependencies and security patches
- **Annually**: Review and update documentation

### Emergency Procedures

1. **API Changes**: Monitor Printify API changelog
2. **Rate Limiting**: Implement request throttling if needed
3. **Authentication Issues**: Verify API token validity
4. **Data Loss**: Implement backup and recovery procedures

---

## 🎉 Success Metrics

### Key Performance Indicators

- **Product Creation Success Rate**: >95%
- **Image Upload Success Rate**: >90%
- **API Response Time**: <2 seconds average
- **Error Rate**: <5% of total requests

### Quality Assurance

- All new features must include error handling
- All API interactions must be logged
- All user-facing errors must be user-friendly
- All TypeScript code must compile without errors

---

**This project is production-ready and successfully handles the complete workflow from image extraction to product creation in Printify!** 🚀
