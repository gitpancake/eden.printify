"""
Product Template Generator
Generates product JSON templates for Printify
"""

import json
import os
from typing import List, Dict, Any
from services.printify_api import PrintifyApiClient


class ProductTemplateGenerator:
    """Generates product JSON templates for Printify"""
    
    def __init__(self, api_client: PrintifyApiClient):
        self.api_client = api_client
        
        # Popular blueprint and print provider combinations
        self.popular_combinations = [
            (5, 50),   # Unisex Cotton Crew Tee - Underground Threads
            (15, 3),   # Men's Very Important Tee - Marco Fine Arts
            (1, 1),    # Classic T-Shirt - Generic
            (2, 2),    # Premium T-Shirt - Generic
            (3, 3),    # Hoodie - Generic
        ]
    
    def generate_template(self, blueprint_id: int, print_provider_id: int) -> str:
        """Generate a product template for a specific blueprint and print provider"""
        try:
            # Get blueprint and print provider details
            blueprints = self.api_client.get_blueprints()
            blueprint = next((bp for bp in blueprints if bp.id == blueprint_id), None)
            
            if not blueprint:
                raise ValueError(f"Blueprint {blueprint_id} not found")
            
            providers = self.api_client.get_print_providers(blueprint_id)
            provider = next((p for p in providers if p.id == print_provider_id), None)
            
            if not provider:
                raise ValueError(f"Print provider {print_provider_id} not found for blueprint {blueprint_id}")
            
            # Get variants
            variants_response = self.api_client.get_variants(blueprint_id, print_provider_id)
            variants = variants_response.get('variants', variants_response) if isinstance(variants_response, dict) else variants_response
            
            if not variants:
                raise ValueError(f"No variants found for blueprint {blueprint_id} and print provider {print_provider_id}")
            
            # Create template
            template = self._create_product_template(blueprint, provider, variants)
            
            # Save template to file
            filename = f"template-{blueprint_id}-{print_provider_id}.json"
            with open(filename, 'w') as f:
                json.dump(template, f, indent=2)
            
            return filename
            
        except Exception as e:
            print(f"Failed to generate template: {e}")
            raise
    
    def generate_popular_templates(self) -> List[str]:
        """Generate templates for popular product combinations"""
        generated_files = []
        
        for blueprint_id, print_provider_id in self.popular_combinations:
            try:
                filename = self.generate_template(blueprint_id, print_provider_id)
                generated_files.append(filename)
                print(f"✅ Generated template: {filename}")
            except Exception as e:
                print(f"❌ Failed to generate template for {blueprint_id}-{print_provider_id}: {e}")
        
        return generated_files
    
    def list_available_templates(self) -> List[Dict[str, Any]]:
        """List available templates that can be generated"""
        templates = []
        
        for blueprint_id, print_provider_id in self.popular_combinations:
            try:
                # Get blueprint and provider details
                blueprints = self.api_client.get_blueprints()
                blueprint = next((bp for bp in blueprints if bp.id == blueprint_id), None)
                
                providers = self.api_client.get_print_providers(blueprint_id)
                provider = next((p for p in providers if p.id == print_provider_id), None)
                
                if blueprint and provider:
                    templates.append({
                        'blueprint_id': blueprint_id,
                        'print_provider_id': print_provider_id,
                        'title': f"{blueprint.title} - {provider.title}"
                    })
            except Exception as e:
                print(f"⚠️  Could not get details for {blueprint_id}-{print_provider_id}: {e}")
        
        return templates
    
    def _create_product_template(self, blueprint, provider, variants: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create a product template from blueprint, provider, and variants"""
        # Get the first variant as default
        default_variant = variants[0] if variants else {}
        
        # Process options
        options = []
        if default_variant.get('options'):
            if isinstance(default_variant['options'], list):
                options = default_variant['options']
            elif isinstance(default_variant['options'], dict):
                # Convert object format to array format
                options = [
                    {'id': i + 1, 'value': str(value)}
                    for i, (key, value) in enumerate(default_variant['options'].items())
                ]
        
        # Create template
        template = {
            "title": f"{blueprint.title} - {provider.title}",
            "description": blueprint.description,
            "blueprint_id": blueprint.id,
            "print_provider_id": provider.id,
            "variants": [
                {
                    "id": default_variant.get('id', 1),
                    "price": 2500,  # $25.00 in cents
                    "is_enabled": True,
                    "is_default": True,
                    "grams": 180,  # Default weight
                    "options": options
                }
            ],
            "print_areas": [
                {
                    "variant_ids": [default_variant.get('id', 1)],
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
        
        return template 