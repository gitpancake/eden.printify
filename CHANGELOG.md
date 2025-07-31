# Changelog

All notable changes to the Eden Printify Product Creator will be documented in this file.

## [1.1.0] - 2024-01-XX

### Added

- **Product Template Generator**: New utility to generate product templates based on blueprint and print provider information
- **Setup Script**: Interactive setup script (`yarn setup`) to help users configure their environment
- **New CLI Commands**:
  - `generate-template <blueprint_id> <print_provider_id>`: Generate a product template for specific blueprint/print provider
  - `generate-popular-templates`: Generate templates for popular products (t-shirts, hoodies, mugs, posters)
  - `list-templates`: List available templates that can be generated
- **Enhanced Help System**: Updated help command with new commands and examples
- **Better Error Handling**: Improved error messages and validation

### Improved

- **Documentation**: Enhanced README with setup instructions and new features
- **Type Safety**: Better TypeScript type coverage for all new features
- **User Experience**: More intuitive CLI interface with better feedback

### Technical Improvements

- **Modular Architecture**: Better separation of concerns with dedicated utility classes
- **Code Organization**: Improved file structure and naming conventions
- **Build Process**: Cleaner build output and better error reporting

## [1.0.0] - 2024-01-XX

### Initial Release

- **Core Product Creation**: Create Printify products from JSON files
- **Shop Management**: List and manage Printify shops
- **Product Management**: List and manage existing products
- **Debug Tools**: Comprehensive debugging utilities for blueprints, print providers, and variants
- **Image Upload**: Upload images to Printify with automatic test image generation
- **Validation**: Comprehensive product validation with detailed error reporting
- **TypeScript Support**: Full TypeScript implementation with complete type definitions
- **CLI Interface**: Command-line interface with multiple commands and options

### Features

- Create products from JSON configuration files
- List available shops and products
- Debug blueprint and print provider information
- Upload images to Printify
- Validate product configurations
- Comprehensive error handling and logging
- TypeScript with full type safety
- Easy-to-use CLI interface

### Technical Stack

- TypeScript for type safety
- Axios for HTTP requests
- Canvas for image generation
- Form-data for file uploads
- Dotenv for environment management
