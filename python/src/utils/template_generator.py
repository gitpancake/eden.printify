"""
Template Generator
Generates ALL templates for every blueprint/print provider combination
"""

import json
import os
import time
from typing import List, Dict, Any
from services.printify_api import PrintifyApiClient


class TemplateGenerator:
    """Generates ALL templates for every blueprint/print provider combination"""
    
    def __init__(self):
        self.api_token = None
        self.api_client = None
        self.templates_dir = "templates"
        self.summary_file = "templates/templates-summary.json"
    
    def _init_api_client(self):
        """Initialize API client if not already done"""
        if not self.api_client:
            from ..utils.config import load_config
            config = load_config()
            self.api_token = config['printify_api_token']
            self.api_client = PrintifyApiClient.create_with_dynamic_shop_id(self.api_token)
    
    def generate_all_templates(self) -> Dict[str, Any]:
        """Generate ALL templates for every blueprint/print provider combination"""
        self._init_api_client()
        
        try:
            # Create templates directory
            os.makedirs(self.templates_dir, exist_ok=True)
            
            # Get all blueprints
            print("🔍 Fetching all blueprints...")
            blueprints = self.api_client.get_blueprints()
            print(f"✅ Found {len(blueprints)} blueprints")
            
            total_templates = 0
            total_blueprints = 0
            
            for blueprint in blueprints:
                try:
                    print(f"\n🔍 Processing blueprint {blueprint.id}: {blueprint.title}")
                    
                    # Get print providers for this blueprint
                    providers = self.api_client.get_print_providers(blueprint.id)
                    print(f"  Found {len(providers)} print providers")
                    
                    if providers:
                        total_blueprints += 1
                        
                        for provider in providers:
                            try:
                                # Generate template for this combination
                                template = self._generate_template_for_combination(blueprint, provider)
                                
                                if template:
                                    # Save template to file
                                    filename = f"blueprint-{blueprint.id}/provider-{provider.id}/template.json"
                                    filepath = os.path.join(self.templates_dir, filename)
                                    
                                    # Create directory structure
                                    os.makedirs(os.path.dirname(filepath), exist_ok=True)
                                    
                                    with open(filepath, 'w') as f:
                                        json.dump(template, f, indent=2)
                                    
                                    total_templates += 1
                                    print(f"    ✅ Generated template for provider {provider.id}")
                                
                                # Add small delay to respect API limits
                                time.sleep(0.1)
                                
                            except Exception as e:
                                print(f"    ❌ Failed to generate template for provider {provider.id}: {e}")
                    
                    # Add delay between blueprints
                    time.sleep(0.5)
                    
                except Exception as e:
                    print(f"❌ Failed to process blueprint {blueprint.id}: {e}")
            
            # Generate summary
            self._generate_template_summary(blueprints, total_templates, total_blueprints)
            
            return {
                'total_templates': total_templates,
                'total_blueprints': total_blueprints,
                'templates_dir': self.templates_dir,
                'summary_file': self.summary_file
            }
            
        except Exception as e:
            print(f"Failed to generate all templates: {e}")
            raise
    
    def get_template_info(self) -> Dict[str, Any]:
        """Get information about generated templates"""
        try:
            if not os.path.exists(self.summary_file):
                return {
                    'total_templates': 0,
                    'total_blueprints': 0,
                    'templates_dir': self.templates_dir,
                    'summary_file': self.summary_file,
                    'categories': {}
                }
            
            with open(self.summary_file, 'r') as f:
                summary = json.load(f)
            
            return summary
            
        except Exception as e:
            print(f"Failed to get template info: {e}")
            raise
    
    def _generate_template_for_combination(self, blueprint, provider) -> Dict[str, Any]:
        """Generate a template for a specific blueprint/provider combination"""
        try:
            # Get variants
            variants_response = self.api_client.get_variants(blueprint.id, provider.id)
            variants = variants_response.get('variants', variants_response) if isinstance(variants_response, dict) else variants_response
            
            if not variants:
                return None
            
            # Filter for valid variants
            valid_variants = [v for v in variants if v.get('id')]
            
            if not valid_variants:
                return None
            
            # Get first variant as default
            default_variant = valid_variants[0]
            
            # Process options
            options = []
            if default_variant.get('options'):
                if isinstance(default_variant['options'], list):
                    options = default_variant['options']
                elif isinstance(default_variant['options'], dict):
                    options = [
                        {'id': i + 1, 'value': str(value)}
                        for i, (key, value) in enumerate(default_variant['options'].items())
                    ]
            
            # Generate placeholders
            placeholders = []
            if default_variant.get('placeholders'):
                placeholders = [
                    {
                        'position': placeholder.get('position', 'front'),
                        'images': [
                            {
                                'id': 'placeholder_image',
                                'name': f"{blueprint.title} {placeholder.get('position', 'front')} design",
                                'url': 'https://example.com/placeholder-image.png',
                                'preview_url': 'https://example.com/placeholder-image.png',
                                'x': 0,
                                'y': 0,
                                'scale': 1,
                                'angle': 0
                            }
                        ]
                    }
                    for placeholder in default_variant['placeholders']
                ]
            else:
                # Default placeholder
                placeholders = [
                    {
                        'position': 'front',
                        'images': [
                            {
                                'id': 'placeholder_front',
                                'name': f"{blueprint.title} front design",
                                'url': 'https://example.com/placeholder-image.png',
                                'preview_url': 'https://example.com/placeholder-image.png',
                                'x': 0,
                                'y': 0,
                                'scale': 1,
                                'angle': 0
                            }
                        ]
                    }
                ]
            
            # Create template
            template = {
                'title': f"{blueprint.title} - {provider.title}",
                'description': blueprint.description,
                'blueprint_id': blueprint.id,
                'print_provider_id': provider.id,
                'blueprint_title': blueprint.title,
                'print_provider_title': provider.title,
                'brand': blueprint.brand,
                'model': blueprint.model,
                'variants': [
                    {
                        'id': default_variant.get('id'),
                        'price': 2500,  # $25.00 in cents
                        'is_enabled': True,
                        'is_default': True,
                        'grams': 180,  # Default weight
                        'options': options
                    }
                ],
                'print_areas': [
                    {
                        'variant_ids': [default_variant.get('id')],
                        'placeholders': placeholders
                    }
                ]
            }
            
            return template
            
        except Exception as e:
            print(f"Failed to generate template for combination: {e}")
            return None
    
    def _generate_template_summary(self, blueprints: List, total_templates: int, total_blueprints: int):
        """Generate a summary of all templates"""
        try:
            summary = {
                'total_templates': total_templates,
                'total_blueprints': total_blueprints,
                'generated_at': time.strftime('%Y-%m-%d %H:%M:%S'),
                'blueprints': [
                    {
                        'id': bp.id,
                        'title': bp.title,
                        'brand': bp.brand,
                        'model': bp.model
                    }
                    for bp in blueprints
                ]
            }
            
            with open(self.summary_file, 'w') as f:
                json.dump(summary, f, indent=2)
            
            print(f"\n📄 Template summary saved to: {self.summary_file}")
            
        except Exception as e:
            print(f"Failed to generate template summary: {e}")
            raise 