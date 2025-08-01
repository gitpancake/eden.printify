#!/usr/bin/env python3
"""
Eden Printify Product Creator - Python CLI
A powerful Python CLI tool for creating and managing products on Printify with automatic image processing
"""

import sys
import os
import json
import click
from typing import Optional, List, Dict, Any
from pathlib import Path

# Add src to path for imports
sys.path.append(str(Path(__file__).parent / "src"))

from services.printify_api import PrintifyApiClient
from services.product_service import ProductService
from utils.config import load_config, validate_config
from utils.debug_helper import DebugHelper
from utils.image_uploader import ImageUploader
from utils.product_template_generator import ProductTemplateGenerator
from utils.product_image_processor import ProductImageProcessor
from utils.template_generator import TemplateGenerator
from utils.ai_template_helper import AITemplateHelper
from utils.dynamic_template_helper import DynamicTemplateHelper


@click.group()
@click.version_option(version="1.2.0")
def cli():
    """Eden Printify Product Creator - Python CLI"""
    pass


@cli.command()
@click.option('--file-path', default=None, help='Path to product JSON file')
def create(file_path):
    """Create a product from JSON file"""
    try:
        config = load_config()
        validate_config(config)
        
        api_client = PrintifyApiClient(config['printify_api_token'], config['printify_shop_id'])
        product_service = ProductService(api_client)
        
        product_path = file_path or config.get('default_product_json_path', './product.json')
        handle_create_product(product_service, product_path)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
def list_shops():
    """List all available shops"""
    try:
        config = load_config()
        validate_config(config)
        
        api_client = PrintifyApiClient(config['printify_api_token'], config['printify_shop_id'])
        product_service = ProductService(api_client)
        
        handle_list_shops(product_service)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
def list_products():
    """List all products in current shop"""
    try:
        config = load_config()
        validate_config(config)
        
        api_client = PrintifyApiClient(config['printify_api_token'], config['printify_shop_id'])
        product_service = ProductService(api_client)
        
        handle_list_products(product_service)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
def debug_blueprints():
    """List all available blueprints"""
    try:
        config = load_config()
        validate_config(config)
        
        api_client = PrintifyApiClient(config['printify_api_token'], config['printify_shop_id'])
        debug_helper = DebugHelper(api_client)
        
        handle_debug_blueprints(debug_helper)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
@click.argument('blueprint_id', type=int)
def debug_blueprint(blueprint_id):
    """Debug a specific blueprint and its variants"""
    try:
        config = load_config()
        validate_config(config)
        
        api_client = PrintifyApiClient(config['printify_api_token'], config['printify_shop_id'])
        debug_helper = DebugHelper(api_client)
        
        handle_debug_blueprint(debug_helper, blueprint_id)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
@click.argument('blueprint_id', type=int)
@click.argument('print_provider_id', type=int)
def debug_structure(blueprint_id, print_provider_id):
    """Show recommended product structure for blueprint/print provider"""
    try:
        config = load_config()
        validate_config(config)
        
        api_client = PrintifyApiClient(config['printify_api_token'], config['printify_shop_id'])
        debug_helper = DebugHelper(api_client)
        
        handle_debug_structure(debug_helper, blueprint_id, print_provider_id)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
@click.argument('provider_id', type=int)
def debug_print_provider(provider_id):
    """Debug a specific print provider and its variants"""
    try:
        config = load_config()
        validate_config(config)
        
        api_client = PrintifyApiClient(config['printify_api_token'], config['printify_shop_id'])
        debug_helper = DebugHelper(api_client)
        
        handle_debug_print_provider(debug_helper, provider_id)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
@click.argument('image_path')
def upload_image(image_path):
    """Upload an image to Printify"""
    try:
        config = load_config()
        validate_config(config)
        
        image_uploader = ImageUploader(config['printify_api_token'])
        
        handle_upload_image(image_uploader, image_path)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
@click.option('--file-path', default=None, help='Path to product JSON file')
def create_with_image(file_path):
    """Create product with uploaded image"""
    try:
        config = load_config()
        validate_config(config)
        
        api_client = PrintifyApiClient(config['printify_api_token'], config['printify_shop_id'])
        product_service = ProductService(api_client)
        image_uploader = ImageUploader(config['printify_api_token'])
        
        product_path = file_path or config.get('default_product_json_path', './product.json')
        handle_create_with_image(product_service, image_uploader, product_path)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
@click.argument('blueprint_id', type=int)
@click.argument('print_provider_id', type=int)
def generate_template(blueprint_id, print_provider_id):
    """Generate product template for blueprint/print provider"""
    try:
        config = load_config()
        validate_config(config)
        
        api_client = PrintifyApiClient(config['printify_api_token'], config['printify_shop_id'])
        template_generator = ProductTemplateGenerator(api_client)
        
        handle_generate_template(template_generator, blueprint_id, print_provider_id)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
def generate_popular_templates():
    """Generate templates for popular products"""
    try:
        config = load_config()
        validate_config(config)
        
        api_client = PrintifyApiClient(config['printify_api_token'], config['printify_shop_id'])
        template_generator = ProductTemplateGenerator(api_client)
        
        handle_generate_popular_templates(template_generator)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
def list_templates():
    """List available templates that can be generated"""
    try:
        config = load_config()
        validate_config(config)
        
        api_client = PrintifyApiClient(config['printify_api_token'], config['printify_shop_id'])
        template_generator = ProductTemplateGenerator(api_client)
        
        handle_list_templates(template_generator)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
def generate_all_templates():
    """Generate ALL templates for every blueprint/print provider combination"""
    try:
        config = load_config()
        validate_config(config)
        
        template_gen = TemplateGenerator()
        
        handle_generate_all_templates(template_gen)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
def list_all_templates():
    """List all generated templates with summary information"""
    try:
        config = load_config()
        validate_config(config)
        
        template_gen = TemplateGenerator()
        
        handle_list_all_templates(template_gen)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
@click.option('--file-path', default=None, help='Path to product JSON file')
def process_with_images(file_path):
    """Extract images from JSON, upload to Printify, and create product"""
    try:
        config = load_config()
        validate_config(config)
        
        api_client = PrintifyApiClient(config['printify_api_token'], config['printify_shop_id'])
        product_service = ProductService(api_client)
        image_processor = ProductImageProcessor(config['printify_api_token'])
        
        product_path = file_path or config.get('default_product_json_path', './product.json')
        handle_process_with_images(image_processor, product_service, product_path)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
def generate_ai_summary():
    """Generate AI-friendly template summary and categorization"""
    try:
        config = load_config()
        validate_config(config)
        
        ai_helper = AITemplateHelper()
        
        handle_generate_ai_summary(ai_helper)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
def show_ai_context():
    """Show AI template context and usage information"""
    try:
        config = load_config()
        validate_config(config)
        
        ai_helper = AITemplateHelper()
        
        handle_show_ai_context(ai_helper)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


# AI Dynamic Discovery Commands
@cli.command()
@click.argument('category', required=False)
@click.argument('max_price', type=int, required=False)
@click.argument('location', required=False)
def discover_products(category, max_price, location):
    """Discover products dynamically"""
    try:
        config = load_config()
        validate_config(config)
        
        dynamic_helper = DynamicTemplateHelper()
        
        handle_discover_products(dynamic_helper, category, max_price, location)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
@click.argument('keywords', nargs=-1, required=True)
def search_products(keywords):
    """Search products by keywords"""
    try:
        config = load_config()
        validate_config(config)
        
        dynamic_helper = DynamicTemplateHelper()
        
        handle_search_products(dynamic_helper, list(keywords))
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
@click.argument('blueprint_id')
@click.argument('provider_id')
@click.argument('customizations', required=False)
def generate_dynamic_template(blueprint_id, provider_id, customizations):
    """Generate template on-demand"""
    try:
        config = load_config()
        validate_config(config)
        
        dynamic_helper = DynamicTemplateHelper()
        
        handle_generate_dynamic_template(dynamic_helper, blueprint_id, provider_id, customizations)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


@cli.command()
def show_categories():
    """Show available product categories"""
    try:
        config = load_config()
        validate_config(config)
        
        dynamic_helper = DynamicTemplateHelper()
        
        handle_show_categories(dynamic_helper)
    except Exception as e:
        click.echo(f"❌ Error: {e}")
        sys.exit(1)


# Handler functions
def handle_create_product(product_service: ProductService, product_json_path: str):
    """Handle product creation"""
    click.echo(f"🎯 Creating product from: {product_json_path}")
    
    try:
        created_product = product_service.create_product_from_file(product_json_path)
        
        click.echo("\n🎉 Product creation completed successfully!")
        click.echo("📊 Product Details:")
        click.echo(f"   ID: {created_product['id']}")
        click.echo(f"   Title: {created_product['title']}")
        click.echo(f"   Description: {created_product['description']}")
        click.echo(f"   Blueprint ID: {created_product['blueprint_id']}")
        click.echo(f"   Print Provider ID: {created_product['print_provider_id']}")
        click.echo(f"   Variants: {len(created_product['variants'])}")
        click.echo(f"   Print Areas: {len(created_product['print_areas'])}")
    except Exception as e:
        click.echo(f"❌ Failed to create product: {e}")
        raise


def handle_list_shops(product_service: ProductService):
    """Handle listing shops"""
    click.echo("🏪 Fetching shops...")
    
    try:
        shops = product_service.list_shops()
        
        click.echo(f"\n✅ Found {len(shops)} shops:")
        for shop in shops:
            click.echo(f"   ID: {shop['id']} - {shop['title']} ({shop['sales_channel']})")
    except Exception as e:
        click.echo(f"❌ Failed to fetch shops: {e}")
        raise


def handle_list_products(product_service: ProductService):
    """Handle listing products"""
    click.echo("📦 Fetching products...")
    
    try:
        products = product_service.list_products()
        
        click.echo(f"\n✅ Found {len(products)} products:")
        for product in products:
            click.echo(f"   ID: {product['id']} - {product['title']}")
            click.echo(f"     Blueprint: {product['blueprint_id']}, Provider: {product['print_provider_id']}")
    except Exception as e:
        click.echo(f"❌ Failed to fetch products: {e}")
        raise


def handle_debug_blueprints(debug_helper: DebugHelper):
    """Handle debugging blueprints"""
    click.echo("🔍 Debugging blueprints...")
    debug_helper.debug_blueprints()


def handle_debug_blueprint(debug_helper: DebugHelper, blueprint_id: int):
    """Handle debugging a specific blueprint"""
    click.echo(f"🔍 Debugging blueprint {blueprint_id}...")
    debug_helper.debug_blueprint_complete(blueprint_id)


def handle_debug_structure(debug_helper: DebugHelper, blueprint_id: int, print_provider_id: int):
    """Handle debugging structure"""
    click.echo(f"🔍 Debugging structure for blueprint {blueprint_id}, print provider {print_provider_id}...")
    debug_helper.show_recommended_product_structure(blueprint_id, print_provider_id)


def handle_debug_print_provider(debug_helper: DebugHelper, provider_id: int):
    """Handle debugging print provider"""
    click.echo(f"🔍 Debugging print provider with ID: {provider_id}...")
    debug_helper.debug_print_provider(provider_id)


def handle_upload_image(image_uploader: ImageUploader, image_path: str):
    """Handle image upload"""
    click.echo(f"📤 Uploading image: {image_path}")
    
    try:
        result = image_uploader.upload_image(image_path)
        click.echo("✅ Image uploaded successfully!")
        click.echo(f"   ID: {result['id']}")
        click.echo(f"   URL: {result['url']}")
        click.echo(f"   Preview URL: {result['preview_url']}")
    except Exception as e:
        click.echo(f"❌ Failed to upload image: {e}")
        raise


def handle_create_with_image(product_service: ProductService, image_uploader: ImageUploader, product_json_path: str):
    """Handle creating product with image"""
    click.echo(f"🎯 Creating product with uploaded image from: {product_json_path}")
    
    try:
        # First, create a test image and upload it
        click.echo("📤 Preparing and uploading test image...")
        test_image_path = image_uploader.create_test_image()
        uploaded_image = image_uploader.upload_image(test_image_path)
        
        # Update the product.json with the uploaded image URLs
        click.echo("📝 Updating product.json with uploaded image URLs...")
        updated_product_path = update_product_with_image(product_json_path, uploaded_image)
        
        # Create the product
        click.echo("🚀 Creating product with uploaded image...")
        created_product = product_service.create_product_from_file(updated_product_path)
        
        click.echo("\n🎉 Product creation completed successfully!")
        click.echo("📊 Product Details:")
        click.echo(f"   ID: {created_product['id']}")
        click.echo(f"   Title: {created_product['title']}")
        click.echo(f"   Description: {created_product['description']}")
        click.echo(f"   Blueprint ID: {created_product['blueprint_id']}")
        click.echo(f"   Print Provider ID: {created_product['print_provider_id']}")
        click.echo(f"   Variants: {len(created_product['variants'])}")
        click.echo(f"   Print Areas: {len(created_product['print_areas'])}")
    except Exception as e:
        click.echo(f"❌ Failed to create product with image: {e}")
        raise


def update_product_with_image(product_json_path: str, uploaded_image: Dict[str, str]) -> str:
    """Update product JSON with uploaded image"""
    with open(product_json_path, 'r') as f:
        product_data = json.load(f)
    
    # Update all image URLs in the product data
    for print_area in product_data['print_areas']:
        for placeholder in print_area['placeholders']:
            for image in placeholder['images']:
                image['id'] = uploaded_image['id']
                image['url'] = uploaded_image['url']
                image['preview_url'] = uploaded_image['preview_url']
    
    # Write the updated product data to a temporary file
    updated_path = product_json_path.replace('.json', '-with-image.json')
    with open(updated_path, 'w') as f:
        json.dump(product_data, f, indent=2)
    
    return updated_path


def handle_generate_template(template_generator: ProductTemplateGenerator, blueprint_id: int, print_provider_id: int):
    """Handle template generation"""
    click.echo(f"🎨 Generating template for blueprint {blueprint_id}, print provider {print_provider_id}...")
    
    try:
        template_path = template_generator.generate_template(blueprint_id, print_provider_id)
        click.echo(f"✅ Template generated successfully: {template_path}")
        click.echo("💡 You can now edit this template and use it to create products!")
    except Exception as e:
        click.echo(f"❌ Failed to generate template: {e}")
        raise


def handle_generate_popular_templates(template_generator: ProductTemplateGenerator):
    """Handle popular template generation"""
    click.echo("🎨 Generating popular product templates...")
    
    try:
        generated_files = template_generator.generate_popular_templates()
        click.echo(f"✅ Generated {len(generated_files)} popular templates:")
        for file_path in generated_files:
            click.echo(f"   {file_path}")
    except Exception as e:
        click.echo(f"❌ Failed to generate popular templates: {e}")
        raise


def handle_list_templates(template_generator: ProductTemplateGenerator):
    """Handle listing templates"""
    click.echo("📋 Listing available templates...")
    
    try:
        templates = template_generator.list_available_templates()
        click.echo(f"✅ Found {len(templates)} available templates:")
        for template in templates:
            click.echo(f"   Blueprint {template['blueprint_id']}, Provider {template['print_provider_id']}: {template['title']}")
    except Exception as e:
        click.echo(f"❌ Failed to list templates: {e}")
        raise


def handle_generate_all_templates(template_gen: TemplateGenerator):
    """Handle generating all templates"""
    click.echo("🎨 Generating ALL templates for every blueprint/print provider combination...")
    
    try:
        result = template_gen.generate_all_templates()
        click.echo(f"✅ Generated {result['total_templates']} templates across {result['total_blueprints']} blueprints")
        click.echo(f"📁 Templates saved to: {result['templates_dir']}")
        click.echo(f"📄 Summary saved to: {result['summary_file']}")
    except Exception as e:
        click.echo(f"❌ Failed to generate all templates: {e}")
        raise


def handle_list_all_templates(template_gen: TemplateGenerator):
    """Handle listing all templates"""
    click.echo("📋 Listing all generated templates...")
    
    try:
        template_info = template_gen.get_template_info()
        click.echo(f"✅ Found {template_info['total_templates']} generated templates:")
        click.echo(f"📁 Templates directory: {template_info['templates_dir']}")
        click.echo(f"📄 Summary file: {template_info['summary_file']}")
        
        if template_info['categories']:
            click.echo("\n📂 Categories:")
            for category, count in template_info['categories'].items():
                click.echo(f"   {category}: {count} templates")
    except Exception as e:
        click.echo(f"❌ Failed to list all templates: {e}")
        raise


def handle_process_with_images(image_processor: ProductImageProcessor, product_service: ProductService, product_json_path: str):
    """Handle processing with images"""
    click.echo(f"🖼️  Processing product with images from: {product_json_path}")
    
    try:
        processed_path = image_processor.process_product_with_images(product_json_path)
        click.echo(f"✅ Product processed successfully: {processed_path}")
        
        # Create the product
        click.echo("🚀 Creating product with processed images...")
        created_product = product_service.create_product_from_file(processed_path)
        
        click.echo("\n🎉 Product creation completed successfully!")
        click.echo("📊 Product Details:")
        click.echo(f"   ID: {created_product['id']}")
        click.echo(f"   Title: {created_product['title']}")
        click.echo(f"   Description: {created_product['description']}")
        click.echo(f"   Blueprint ID: {created_product['blueprint_id']}")
        click.echo(f"   Print Provider ID: {created_product['print_provider_id']}")
        click.echo(f"   Variants: {len(created_product['variants'])}")
        click.echo(f"   Print Areas: {len(created_product['print_areas'])}")
    except Exception as e:
        click.echo(f"❌ Failed to process product with images: {e}")
        raise


def handle_generate_ai_summary(ai_helper: AITemplateHelper):
    """Handle AI summary generation"""
    click.echo("🤖 Generating AI-friendly template summary...")
    
    try:
        summary_path = ai_helper.generate_ai_summary()
        click.echo(f"✅ AI summary generated: {summary_path}")
    except Exception as e:
        click.echo(f"❌ Failed to generate AI summary: {e}")
        raise


def handle_show_ai_context(ai_helper: AITemplateHelper):
    """Handle showing AI context"""
    click.echo("🤖 Showing AI template context...")
    
    try:
        context = ai_helper.get_ai_template_context()
        click.echo(f"✅ AI Context:")
        click.echo(f"   Total Templates: {context['total_templates']}")
        click.echo(f"   Total Blueprints: {context['total_blueprints']}")
        click.echo(f"   Categories: {len(context['categories'])}")
        
        for category, templates in context['categories'].items():
            click.echo(f"   {category}: {len(templates)} templates")
    except Exception as e:
        click.echo(f"❌ Failed to show AI context: {e}")
        raise


def handle_discover_products(dynamic_helper: DynamicTemplateHelper, category: Optional[str], max_price: Optional[int], location: Optional[str]):
    """Handle product discovery"""
    click.echo("🔍 Discovering products...")
    
    try:
        suggestions = dynamic_helper.get_product_suggestions(category, max_price, location)
        click.echo(f"✅ Found {len(suggestions)} product suggestions:")
        
        for i, suggestion in enumerate(suggestions[:10], 1):
            click.echo(f"   {i}. {suggestion['blueprint_title']} - {suggestion['print_provider_title']}")
            click.echo(f"      Category: {suggestion['category']}, Price: ${suggestion['estimated_price']/100:.2f}")
            click.echo(f"      Blueprint ID: {suggestion['blueprint_id']}, Provider ID: {suggestion['print_provider_id']}")
        
        if len(suggestions) > 10:
            click.echo(f"   ... and {len(suggestions) - 10} more suggestions")
    except Exception as e:
        click.echo(f"❌ Failed to discover products: {e}")
        raise


def handle_search_products(dynamic_helper: DynamicTemplateHelper, keywords: List[str]):
    """Handle product search"""
    click.echo(f"🔍 Searching products for: {' '.join(keywords)}")
    
    try:
        suggestions = dynamic_helper.search_products(keywords)
        click.echo(f"✅ Found {len(suggestions)} matching products:")
        
        for i, suggestion in enumerate(suggestions[:10], 1):
            click.echo(f"   {i}. {suggestion['blueprint_title']} - {suggestion['print_provider_title']}")
            click.echo(f"      Category: {suggestion['category']}, Price: ${suggestion['estimated_price']/100:.2f}")
            click.echo(f"      Blueprint ID: {suggestion['blueprint_id']}, Provider ID: {suggestion['print_provider_id']}")
        
        if len(suggestions) > 10:
            click.echo(f"   ... and {len(suggestions) - 10} more results")
    except Exception as e:
        click.echo(f"❌ Failed to search products: {e}")
        raise


def handle_generate_dynamic_template(dynamic_helper: DynamicTemplateHelper, blueprint_id: str, provider_id: str, customizations: Optional[str]):
    """Handle dynamic template generation"""
    click.echo(f"🔧 Generating dynamic template for blueprint {blueprint_id}, provider {provider_id}...")
    
    try:
        customizations_dict = None
        if customizations:
            customizations_dict = json.loads(customizations)
        
        template = dynamic_helper.generate_product_template(int(blueprint_id), int(provider_id), customizations_dict)
        
        # Save template to file
        filename = f"dynamic-template-{blueprint_id}-{provider_id}.json"
        with open(filename, 'w') as f:
            json.dump(template, f, indent=2)
        
        click.echo(f"✅ Template generated and saved to: {filename}")
        click.echo(f"📋 Template includes:")
        click.echo(f"   - Title: {template['title']}")
        click.echo(f"   - Blueprint ID: {template['blueprint_id']}")
        click.echo(f"   - Provider ID: {template['print_provider_id']}")
        click.echo(f"   - Variants: {len(template['variants'])}")
        click.echo(f"   - Print Areas: {len(template['print_areas'])}")
    except Exception as e:
        click.echo(f"❌ Failed to generate dynamic template: {e}")
        raise


def handle_show_categories(dynamic_helper: DynamicTemplateHelper):
    """Handle showing categories"""
    click.echo("📂 Discovering available categories...")
    
    try:
        categories = dynamic_helper.get_available_categories()
        
        click.echo("\n📋 Available Product Categories:")
        click.echo("=" * 50)
        
        sorted_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)
        for category, count in sorted_categories:
            click.echo(f"{category}: {count} products")
        
        click.echo(f"\n💡 Use 'discover-products <category>' to explore products in a category")
    except Exception as e:
        click.echo(f"❌ Failed to show categories: {e}")
        raise


if __name__ == '__main__':
    cli() 