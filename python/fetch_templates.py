#!/usr/bin/env python3
"""
Fetch Templates from Printify API
A comprehensive script to fetch and explore templates from Printify
"""

import asyncio
import json
import os
import sys
import argparse
import requests
from typing import List, Dict, Any, Optional

# Add src to path for imports
sys.path.append(str(os.path.join(os.path.dirname(__file__), "src")))

from utils.config import load_config, validate_config
from services.printify_api import PrintifyApiClient
from printify_types.printify import PrintifyBlueprint, PrintifyPrintProvider


class TemplateFetcher:
    """Fetches and manages templates from Printify API"""
    
    def __init__(self, api_token: str, shop_id: Optional[str] = None):
        if shop_id:
            self.api_client = PrintifyApiClient(api_token, shop_id)
        else:
            self.api_client = PrintifyApiClient.create_with_dynamic_shop_id(api_token)
        self.templates_dir = "templates"
        
        # Ensure templates directory exists
        if not os.path.exists(self.templates_dir):
            os.makedirs(self.templates_dir)
    
    def fetch_blueprints(self) -> List[PrintifyBlueprint]:
        """Fetch all available blueprints (product types)"""
        print("📋 Fetching available blueprints...")
        try:
            blueprints = self.api_client.get_blueprints()
            print(f"✅ Found {len(blueprints)} blueprints")
            return blueprints
        except Exception as e:
            print(f"❌ Failed to fetch blueprints: {e}")
            return []
    
    def fetch_print_providers(self, blueprint_id: int) -> List[PrintifyPrintProvider]:
        """Fetch print providers for a specific blueprint"""
        print(f"🏭 Fetching print providers for blueprint {blueprint_id}...")
        try:
            providers = self.api_client.get_print_providers(blueprint_id)
            print(f"✅ Found {len(providers)} print providers")
            return providers
        except Exception as e:
            print(f"❌ Failed to fetch print providers: {e}")
            return []
    
    def fetch_template(self, blueprint_id: int, print_provider_id: int, 
                      template_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Fetch a complete template for a specific blueprint and print provider"""
        try:
            print(f"📡 Fetching template for blueprint {blueprint_id}, provider {print_provider_id}...")
            
            # Get blueprint details
            blueprint_url = f"https://api.printify.com/v1/catalog/blueprints/{blueprint_id}.json"
            headers = {
                "Authorization": f"Bearer {self.api_client.api_token}",
                "User-Agent": "EdenPrintify/1.0.0"
            }
            
            blueprint_response = requests.get(blueprint_url, headers=headers, timeout=30)
            blueprint_response.raise_for_status()
            blueprint_data = blueprint_response.json()
            
            print(f"✅ Blueprint: {blueprint_data.get('title', 'Unknown')}")
            
            # Get print provider details
            provider_url = f"https://api.printify.com/v1/catalog/print_providers/{print_provider_id}.json"
            provider_response = requests.get(provider_url, headers=headers, timeout=30)
            provider_response.raise_for_status()
            provider_data = provider_response.json()
            
            print(f"✅ Provider: {provider_data.get('title', 'Unknown')}")
            
            # Get variants
            variants_url = f"https://api.printify.com/v1/catalog/blueprints/{blueprint_id}/print_providers/{print_provider_id}/variants.json"
            variants_response = requests.get(variants_url, headers=headers, timeout=30)
            variants_response.raise_for_status()
            variants_data = variants_response.json()
            
            print(f"✅ Variants: {len(variants_data.get('variants', []))} available")
            
            # Create template structure
            template = {
                "title": template_name or f"Custom {blueprint_data.get('title', 'Product')}",
                "description": f"A beautiful custom {blueprint_data.get('title', 'product').lower()}",
                "blueprint_id": blueprint_id,
                "print_provider_id": print_provider_id,
                "blueprint_title": blueprint_data.get('title', 'Unknown'),
                "print_provider_title": provider_data.get('title', 'Unknown'),
                "variants": [],
                "print_areas": [],
                "metadata": {
                    "fetched_at": asyncio.get_event_loop().time(),
                    "blueprint_brand": blueprint_data.get('brand', 'Unknown'),
                    "blueprint_model": blueprint_data.get('model', 'Unknown'),
                    "provider_location": provider_data.get('location', 'Unknown')
                }
            }
            
            # Process variants
            actual_variants = variants_data.get("variants", [])
            if actual_variants:
                # Add first variant as default
                first_variant = actual_variants[0]
                print(f"📋 Using variant: {first_variant.get('title', 'Unknown')} (ID: {first_variant.get('id')})")
                
                template["variants"] = [{
                    "id": first_variant["id"],
                    "title": first_variant.get("title", "Default Variant"),
                    "price": 2500,  # $25.00 in cents
                    "is_enabled": True,
                    "is_default": True,
                    "grams": first_variant.get("grams", 180),
                    "options": []
                }]
                
                # Process print areas
                if "placeholders" in first_variant and first_variant["placeholders"]:
                    template["print_areas"] = [{
                        "variant_ids": [first_variant["id"]],
                        "placeholders": []
                    }]
                    
                    for placeholder in first_variant["placeholders"]:
                        print(f"🎨 Found print area: {placeholder.get('position', 'Unknown')}")
                        placeholder_data = {
                            "position": placeholder.get("position", "front").lower(),
                            "images": [{
                                "id": f"placeholder_{placeholder.get('position', 'front').lower()}",
                                "name": f"{placeholder.get('position', 'Front').title()} Design",
                                "url": "https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Design+Placeholder",
                                "preview_url": "https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Design+Placeholder",
                                "x": 0.5,
                                "y": 0.5,
                                "scale": 1.0,
                                "angle": 0
                            }]
                        }
                        template["print_areas"][0]["placeholders"].append(placeholder_data)
                else:
                    # Create default print area
                    print(f"⚠️  No print areas found, creating default front print area")
                    template["print_areas"] = [{
                        "variant_ids": [first_variant["id"]],
                        "placeholders": [{
                            "position": "front",
                            "images": [{
                                "id": "placeholder_front",
                                "name": "Front Design",
                                "url": "https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Design+Placeholder",
                                "preview_url": "https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Design+Placeholder",
                                "x": 0.5,
                                "y": 0.5,
                                "scale": 1.0,
                                "angle": 0
                            }]
                        }]
                    }]
            else:
                print(f"⚠️  No variants found, creating basic template structure")
                template["variants"] = [{
                    "id": 13629,  # Default t-shirt variant ID
                    "title": "Default Variant",
                    "price": 2500,
                    "is_enabled": True,
                    "is_default": True,
                    "grams": 180,
                    "options": []
                }]
                template["print_areas"] = [{
                    "variant_ids": [13629],
                    "placeholders": [{
                        "position": "front",
                        "images": [{
                            "id": "placeholder_front",
                            "name": "Front Design",
                            "url": "https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Design+Placeholder",
                            "preview_url": "https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Design+Placeholder",
                            "x": 0.5,
                            "y": 0.5,
                            "scale": 1.0,
                            "angle": 0
                        }]
                    }]
                }]
            
            return template
            
        except Exception as e:
            print(f"❌ Failed to fetch template: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response status: {e.response.status_code}")
                print(f"Response text: {e.response.text}")
            return None
    
    def save_template(self, template: Dict[str, Any], filename: str) -> str:
        """Save template to file"""
        filepath = os.path.join(self.templates_dir, filename)
        
        with open(filepath, 'w') as f:
            json.dump(template, f, indent=2)
        
        print(f"✅ Template saved to: {filepath}")
        print(f"   File size: {os.path.getsize(filepath)} bytes")
        
        return filepath
    
    def list_popular_templates(self) -> List[Dict[str, Any]]:
        """Return a list of popular template combinations"""
        return [
            {"blueprint_id": 15, "print_provider_id": 3, "name": "Classic T-Shirt", "category": "Apparel"},
            {"blueprint_id": 15, "print_provider_id": 1, "name": "Premium T-Shirt", "category": "Apparel"},
            {"blueprint_id": 16, "print_provider_id": 3, "name": "Long Sleeve T-Shirt", "category": "Apparel"},
            {"blueprint_id": 17, "print_provider_id": 3, "name": "Hoodie", "category": "Apparel"},
            {"blueprint_id": 18, "print_provider_id": 3, "name": "Sweatshirt", "category": "Apparel"},
            {"blueprint_id": 19, "print_provider_id": 3, "name": "Tank Top", "category": "Apparel"},
            {"blueprint_id": 20, "print_provider_id": 3, "name": "V-Neck T-Shirt", "category": "Apparel"},
            {"blueprint_id": 21, "print_provider_id": 3, "name": "Polo Shirt", "category": "Apparel"},
            {"blueprint_id": 22, "print_provider_id": 3, "name": "Baseball Jersey", "category": "Apparel"},
            {"blueprint_id": 23, "print_provider_id": 3, "name": "Raglan T-Shirt", "category": "Apparel"},
            {"blueprint_id": 24, "print_provider_id": 3, "name": "Baby Bodysuit", "category": "Apparel"},
            {"blueprint_id": 25, "print_provider_id": 3, "name": "Kids T-Shirt", "category": "Apparel"},
            {"blueprint_id": 26, "print_provider_id": 3, "name": "Kids Hoodie", "category": "Apparel"},
            {"blueprint_id": 27, "print_provider_id": 3, "name": "Kids Sweatshirt", "category": "Apparel"},
            {"blueprint_id": 28, "print_provider_id": 3, "name": "Kids Tank Top", "category": "Apparel"},
        ]


async def main():
    """Main function to handle template fetching"""
    parser = argparse.ArgumentParser(description="Fetch templates from Printify API")
    parser.add_argument("--list", action="store_true", help="List available blueprints")
    parser.add_argument("--popular", action="store_true", help="Show popular template combinations")
    parser.add_argument("--blueprint", type=int, help="Blueprint ID to fetch")
    parser.add_argument("--provider", type=int, help="Print provider ID")
    parser.add_argument("--name", type=str, help="Custom template name")
    parser.add_argument("--output", type=str, help="Output filename (default: auto-generated)")
    
    args = parser.parse_args()
    
    print("🎨 Printify Template Fetcher")
    print("=" * 40)
    
    # Check for configuration
    if not os.path.exists('.env'):
        print("❌ Error: .env file not found!")
        print("Please create a .env file with your Printify credentials:")
        print("PRINTIFY_API_TOKEN=your_api_token_here")
        print("# Shop ID will be fetched automatically")
        return
    
    try:
        # Load configuration
        config = load_config()
        validate_config(config)
        
        print(f"✅ Configuration loaded successfully")
        print(f"   API Token: {config['printify_api_token'][:10]}...")
        print(f"   Shop ID: Will be fetched automatically")
        
        # Initialize template fetcher
        fetcher = TemplateFetcher(config['printify_api_token'])
        
        if args.list:
            # List available blueprints
            print(f"\n📋 Available Blueprints:")
            print("-" * 40)
            blueprints = fetcher.fetch_blueprints()
            
            for blueprint in blueprints[:20]:  # Show first 20
                print(f"   {blueprint.id:3d} | {blueprint.title}")
            
            if len(blueprints) > 20:
                print(f"   ... and {len(blueprints) - 20} more")
            
            print(f"\n💡 Use --blueprint <id> to fetch a specific blueprint")
            
        elif args.popular:
            # Show popular templates
            print(f"\n⭐ Popular Template Combinations:")
            print("-" * 50)
            popular_templates = fetcher.list_popular_templates()
            
            for i, template in enumerate(popular_templates, 1):
                print(f"   {i:2d}. {template['name']} (Blueprint: {template['blueprint_id']}, Provider: {template['print_provider_id']})")
            
            print(f"\n💡 Use --blueprint <id> --provider <id> to fetch a specific template")
            
        elif args.blueprint:
            # Fetch specific template
            if not args.provider:
                print(f"❌ Error: --provider is required when using --blueprint")
                print(f"💡 Try: python fetch_templates.py --blueprint {args.blueprint} --provider 3")
                return
            
            print(f"\n📥 Fetching template...")
            print(f"   Blueprint ID: {args.blueprint}")
            print(f"   Provider ID: {args.provider}")
            
            template = fetcher.fetch_template(args.blueprint, args.provider, args.name)
            
            if template:
                # Generate filename
                if args.output:
                    filename = args.output
                else:
                    blueprint_title = template.get('blueprint_title', 'unknown').replace(' ', '_').lower()
                    provider_title = template.get('print_provider_title', 'unknown').replace(' ', '_').lower()
                    filename = f"{blueprint_title}_{provider_title}_template.json"
                
                # Save template
                filepath = fetcher.save_template(template, filename)
                
                print(f"\n✅ Template fetched and saved successfully!")
                print(f"📁 File: {filepath}")
                print(f"📋 Title: {template.get('title', 'No title')}")
                print(f"🏷️  Blueprint: {template.get('blueprint_title', 'Unknown')}")
                print(f"🏭 Provider: {template.get('print_provider_title', 'Unknown')}")
                print(f"👕 Variants: {len(template.get('variants', []))}")
                print(f"🎨 Print Areas: {len(template.get('print_areas', []))}")
                
                print(f"\n📝 Next Steps:")
                print(f"   1. Edit the template file: {filepath}")
                print(f"   2. Customize title, description, and images")
                print(f"   3. Run: python step2_upload_product.py")
                
            else:
                print(f"❌ Failed to fetch template")
                
        else:
            # Show help
            print(f"\n💡 Usage Examples:")
            print(f"   python fetch_templates.py --list                    # List all blueprints")
            print(f"   python fetch_templates.py --popular                 # Show popular templates")
            print(f"   python fetch_templates.py --blueprint 15 --provider 3  # Fetch classic t-shirt")
            print(f"   python fetch_templates.py --blueprint 15 --provider 3 --name 'My Custom Shirt'")
            print(f"   python fetch_templates.py --blueprint 15 --provider 3 --output my_template.json")
            
            print(f"\n🎯 Quick Start:")
            print(f"   1. Run: python fetch_templates.py --popular")
            print(f"   2. Choose a template combination")
            print(f"   3. Run: python fetch_templates.py --blueprint <id> --provider <id>")
            print(f"   4. Edit the generated template file")
            print(f"   5. Run: python step2_upload_product.py")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return


if __name__ == "__main__":
    asyncio.run(main()) 