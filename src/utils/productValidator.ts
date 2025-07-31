import { ProductJsonFile } from "../types/printify";

export class ProductValidator {
  /**
   * Validate product data and provide detailed feedback
   */
  static validateProduct(productData: ProductJsonFile): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!productData.title || productData.title.trim().length === 0) {
      errors.push("Title is required and cannot be empty");
    }

    if (!productData.description || productData.description.trim().length === 0) {
      errors.push("Description is required and cannot be empty");
    }

    if (!productData.blueprint_id || productData.blueprint_id <= 0) {
      errors.push("Blueprint ID is required and must be a positive number");
    }

    if (!productData.print_provider_id || productData.print_provider_id <= 0) {
      errors.push("Print Provider ID is required and must be a positive number");
    }

    // Variants validation
    if (!Array.isArray(productData.variants) || productData.variants.length === 0) {
      errors.push("At least one variant is required");
    } else {
      productData.variants.forEach((variant, index) => {
        if (!variant.id || variant.id <= 0) {
          errors.push(`Variant ${index + 1}: ID is required and must be a positive number`);
        }

        if (!variant.price || variant.price <= 0) {
          errors.push(`Variant ${index + 1}: Price is required and must be greater than 0`);
        }

        if (variant.price && variant.price < 100) {
          warnings.push(`Variant ${index + 1}: Price seems very low (${variant.price} cents = $${(variant.price / 100).toFixed(2)})`);
        }

        if (!variant.options || (Array.isArray(variant.options) && variant.options.length === 0) || (typeof variant.options === "object" && Object.keys(variant.options).length === 0)) {
          errors.push(`Variant ${index + 1}: At least one option is required`);
        } else if (Array.isArray(variant.options)) {
          // Handle array format with id/value pairs
          variant.options.forEach((option, optionIndex) => {
            if (!option.id || option.id <= 0) {
              errors.push(`Variant ${index + 1}, Option ${optionIndex + 1}: ID is required and must be a positive number`);
            }
            if (!option.value || option.value.trim().length === 0) {
              errors.push(`Variant ${index + 1}, Option ${optionIndex + 1}: Value is required and cannot be empty`);
            }
          });
        } else if (typeof variant.options === "object") {
          // Handle object format with color/size properties
          const optionKeys = Object.keys(variant.options);
          if (optionKeys.length === 0) {
            errors.push(`Variant ${index + 1}: Options object cannot be empty`);
          } else {
            optionKeys.forEach((key) => {
              const value = (variant.options as any)[key];
              if (!value || (typeof value === "string" && value.trim().length === 0)) {
                errors.push(`Variant ${index + 1}, Option ${key}: Value is required and cannot be empty`);
              }
            });
          }
        }
      });
    }

    // Print areas validation
    if (!Array.isArray(productData.print_areas) || productData.print_areas.length === 0) {
      errors.push("At least one print area is required");
    } else {
      productData.print_areas.forEach((printArea, index) => {
        if (!Array.isArray(printArea.variant_ids) || printArea.variant_ids.length === 0) {
          errors.push(`Print area ${index + 1}: At least one variant ID is required`);
        }

        if (!Array.isArray(printArea.placeholders) || printArea.placeholders.length === 0) {
          errors.push(`Print area ${index + 1}: At least one placeholder is required`);
        } else {
          printArea.placeholders.forEach((placeholder, placeholderIndex) => {
            if (!placeholder.position || placeholder.position.trim().length === 0) {
              errors.push(`Print area ${index + 1}, Placeholder ${placeholderIndex + 1}: Position is required`);
            }

            if (!Array.isArray(placeholder.images) || placeholder.images.length === 0) {
              errors.push(`Print area ${index + 1}, Placeholder ${placeholderIndex + 1}: At least one image is required`);
            } else {
              placeholder.images.forEach((image, imageIndex) => {
                if (!image.id || image.id.trim().length === 0) {
                  errors.push(`Print area ${index + 1}, Placeholder ${placeholderIndex + 1}, Image ${imageIndex + 1}: ID is required`);
                }

                if (!image.name || image.name.trim().length === 0) {
                  errors.push(`Print area ${index + 1}, Placeholder ${placeholderIndex + 1}, Image ${imageIndex + 1}: Name is required`);
                }

                if (!image.url || image.url.trim().length === 0) {
                  errors.push(`Print area ${index + 1}, Placeholder ${placeholderIndex + 1}, Image ${imageIndex + 1}: URL is required`);
                } else if (!this.isValidUrl(image.url)) {
                  warnings.push(`Print area ${index + 1}, Placeholder ${placeholderIndex + 1}, Image ${imageIndex + 1}: URL may not be valid: ${image.url}`);
                }

                if (!image.preview_url || image.preview_url.trim().length === 0) {
                  errors.push(`Print area ${index + 1}, Placeholder ${placeholderIndex + 1}, Image ${imageIndex + 1}: Preview URL is required`);
                } else if (!this.isValidUrl(image.preview_url)) {
                  warnings.push(`Print area ${index + 1}, Placeholder ${placeholderIndex + 1}, Image ${imageIndex + 1}: Preview URL may not be valid: ${image.preview_url}`);
                }
              });
            }
          });
        }
      });
    }

    // Sales channel properties validation (optional but recommended)
    if (!productData.sales_channel_properties || productData.sales_channel_properties.length === 0) {
      warnings.push("No sales channel properties defined. This may be required for publishing products.");
    } else {
      productData.sales_channel_properties.forEach((channel, index) => {
        if (!channel.sales_channel_id || channel.sales_channel_id.trim().length === 0) {
          errors.push(`Sales channel ${index + 1}: Sales channel ID is required`);
        }

        if (!channel.properties) {
          errors.push(`Sales channel ${index + 1}: Properties object is required`);
        } else {
          if (channel.properties.title && channel.properties.title.trim().length === 0) {
            errors.push(`Sales channel ${index + 1}: Title cannot be empty if provided`);
          }

          if (channel.properties.description && channel.properties.description.trim().length === 0) {
            errors.push(`Sales channel ${index + 1}: Description cannot be empty if provided`);
          }

          if (channel.properties.price && channel.properties.price <= 0) {
            errors.push(`Sales channel ${index + 1}: Price must be greater than 0 if provided`);
          }
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if a URL is valid
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Print validation results
   */
  static printValidationResults(validation: { isValid: boolean; errors: string[]; warnings: string[] }): void {
    if (validation.isValid) {
      console.log("✅ Product validation passed!");
    } else {
      console.log("❌ Product validation failed!");
    }

    if (validation.errors.length > 0) {
      console.log("\n🚨 Errors:");
      validation.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    if (validation.warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      validation.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    console.log(""); // Empty line for spacing
  }
}
