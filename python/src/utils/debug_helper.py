"""
Debug Helper
Provides debugging utilities for Printify API interactions
"""

from typing import List, Dict, Any
from services.printify_api import PrintifyApiClient


class DebugHelper:
    """Helper class for debugging Printify API interactions"""
    
    def __init__(self, api_client: PrintifyApiClient):
        self.api_client = api_client
    
    def debug_blueprints(self) -> None:
        """Debug blueprint information"""
        try:
            print("🔍 Fetching blueprints...")
            blueprints = self.api_client.get_blueprints()
            
            print(f"✅ Found {len(blueprints)} blueprints:")
            for i, blueprint in enumerate(blueprints[:10], 1):
                print(f"  {i}. ID: {blueprint.id} - {blueprint.title}")
                print(f"     Brand: {blueprint.brand}, Model: {blueprint.model}")
                print(f"     Description: {blueprint.description[:100]}...")
                print()
            
            if len(blueprints) > 10:
                print(f"... and {len(blueprints) - 10} more blueprints")
        except Exception as e:
            print(f"❌ Error fetching blueprints: {e}")
    
    def debug_print_providers(self, blueprint_id: int) -> None:
        """Debug print providers for a specific blueprint"""
        try:
            print(f"🔍 Fetching print providers for blueprint {blueprint_id}...")
            providers = self.api_client.get_print_providers(blueprint_id)
            
            print(f"✅ Found {len(providers)} print providers:")
            for i, provider in enumerate(providers, 1):
                print(f"  {i}. ID: {provider.id} - {provider.title}")
                print(f"     Location: {provider.location}")
                print()
        except Exception as e:
            print(f"❌ Error fetching print providers for blueprint {blueprint_id}: {e}")
    
    def debug_variants(self, blueprint_id: int, print_provider_id: int) -> None:
        """Debug variants for a specific blueprint and print provider"""
        try:
            print(f"🔍 Fetching variants for blueprint {blueprint_id}, print provider {print_provider_id}...")
            response = self.api_client.get_variants(blueprint_id, print_provider_id)
            
            # Handle the actual response structure
            variants = response.get('variants', response) if isinstance(response, dict) else response
            
            print(f"✅ Found {len(variants) if variants else 0} variants:")
            
            if variants and len(variants) > 0:
                for i, variant in enumerate(variants[:5], 1):
                    print(f"  {i}. ID: {variant.get('id')} - {variant.get('title', 'Untitled')}")
                    print(f"     Options: {variant.get('options', 'No options')}")
                    print(f"     Placeholders: {len(variant.get('placeholders', []))} positions available")
                    print(f"     Decoration Methods: {', '.join(variant.get('decoration_methods', []))}")
                    print()
                
                if len(variants) > 5:
                    print(f"... and {len(variants) - 5} more variants")
            else:
                print("No variants found or invalid response format")
                print(f"Raw response: {response}")
        except Exception as e:
            print(f"❌ Error fetching variants for blueprint {blueprint_id}, print provider {print_provider_id}: {e}")
    
    def debug_blueprint_complete(self, blueprint_id: int) -> None:
        """Debug all information for a specific blueprint"""
        print(f"🔍 Complete debug for blueprint {blueprint_id}")
        print("=" * 50)
        
        self.debug_print_providers(blueprint_id)
        
        # Get print providers first
        try:
            providers = self.api_client.get_print_providers(blueprint_id)
            if providers:
                first_provider = providers[0]
                print(f"\n🔍 Using first print provider: {first_provider.title} (ID: {first_provider.id})")
                self.debug_variants(blueprint_id, first_provider.id)
        except Exception as e:
            print(f"❌ Error in complete debug: {e}")
    
    def debug_print_provider(self, provider_id: int) -> None:
        """Debug a specific print provider by ID"""
        try:
            print(f"🔍 Fetching print provider with ID: {provider_id}...")
            provider = self.api_client.get_print_provider(provider_id)
            
            print(f"✅ Print Provider Details:")
            print(f"  ID: {provider.id}")
            print(f"  Title: {provider.title}")
            print(f"  Location: {provider.location}")
            
            # Note: Print provider API doesn't return variants directly
            # To get variants, we need to know which blueprint this provider works with
            print(f"  Note: To see variants for this provider, use:")
            print(f"    python main.py debug-structure <blueprint_id> {provider.id}")
        except Exception as e:
            print(f"❌ Error fetching print provider {provider_id}: {e}")
    
    def show_recommended_product_structure(self, blueprint_id: int, print_provider_id: int) -> None:
        """Show recommended product structure based on actual data"""
        try:
            print("🔍 Generating recommended product structure...")
            
            response = self.api_client.get_variants(blueprint_id, print_provider_id)
            variants = response.get('variants', response) if isinstance(response, dict) else response
            
            if not variants or len(variants) == 0:
                print("❌ No variants found for this blueprint/print provider combination")
                print(f"Raw response: {response}")
                return
            
            first_variant = variants[0]
            print("\n📋 Recommended product.json structure:")
            
            # Get blueprint info
            blueprints = self.api_client.get_blueprints()
            blueprint = next((bp for bp in blueprints if bp.id == blueprint_id), None)
            blueprint_title = blueprint.title if blueprint else "Your Product"
            
            # Get provider info
            providers = self.api_client.get_print_providers(blueprint_id)
            provider = next((p for p in providers if p.id == print_provider_id), None)
            provider_title = provider.title if provider else "Your Provider"
            
            recommended_structure = {
                "title": "Your Product Title",
                "description": "Your product description",
                "blueprint_id": blueprint_id,
                "print_provider_id": print_provider_id,
                "variants": [
                    {
                        "id": first_variant.get('id'),
                        "price": 2500,  # $25.00 in cents
                        "is_enabled": True,
                        "is_default": True,
                        "grams": 180,  # Default weight
                        "options": first_variant.get('options', [])
                    }
                ],
                "print_areas": [
                    {
                        "variant_ids": [first_variant.get('id')],
                        "placeholders": [
                            {
                                "position": "front",
                                "images": [
                                    {
                                        "id": "your_image_id",
                                        "name": "Your Design Name",
                                        "url": "https://your-image-url.com/image.png",
                                        "preview_url": "https://your-image-url.com/image.png",
                                        "x": 0,
                                        "y": 0,
                                        "scale": 1,
                                        "angle": 0
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
            
            import json
            print(json.dumps(recommended_structure, indent=2))
            
            print("\n📏 Available print positions for this variant:")
            if first_variant.get('placeholders'):
                for i, placeholder in enumerate(first_variant['placeholders'], 1):
                    print(f"  {i}. {placeholder.get('position')} ({placeholder.get('width', 'N/A')}x{placeholder.get('height', 'N/A')})")
        except Exception as e:
            print(f"❌ Error generating recommended structure: {e}") 