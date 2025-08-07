"""
Dynamic Template Helper
Provides dynamic product discovery and template generation
"""

import json
import time
import random
from typing import List, Dict, Any, Optional
from services.printify_api import PrintifyApiClient


class DynamicTemplateHelper:
    """Provides dynamic product discovery and template generation"""
    
    def __init__(self):
        self.api_token = None
        self.api_client = None
    
    def _init_api_client(self):
        """Initialize API client if not already done"""
        if not self.api_client:
            from ..utils.config import load_config
            config = load_config()
            self.api_token = config['printify_api_token']
            self.api_client = PrintifyApiClient.create_with_dynamic_shop_id(self.api_token)
    
    def get_product_suggestions(self, category: Optional[str] = None, max_price: Optional[int] = None, location: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get product suggestions based on criteria"""
        self._init_api_client()
        
        try:
            suggestions = []
            
            # Get all blueprints
            blueprints = self.api_client.get_blueprints()
            
            # Filter by category if specified
            if category:
                blueprints = self._filter_blueprints_by_category(blueprints, category)
            
            # Sample blueprints to avoid API overload
            sampled_blueprints = self._sample_array(blueprints, min(10, len(blueprints)))
            
            for blueprint in sampled_blueprints:
                try:
                    # Get print providers for this blueprint
                    providers = self.api_client.get_print_providers(blueprint.id)
                    
                    # Take top 3 providers per blueprint for efficiency
                    top_providers = providers[:3]
                    
                    for provider in top_providers:
                        blueprint_category = self._categorize_blueprint(blueprint)
                        estimated_price = self._estimate_price(blueprint_category)
                        popularity_score = self._calculate_popularity_score(blueprint, provider)
                        
                        # Filter by price if specified
                        if max_price and estimated_price > max_price:
                            continue
                        
                        suggestions.append({
                            'blueprint_id': blueprint.id,
                            'print_provider_id': provider.id,
                            'blueprint_title': blueprint.title,
                            'print_provider_title': provider.title,
                            'category': blueprint_category,
                            'description': blueprint.description,
                            'estimated_price': estimated_price,
                            'popularity_score': popularity_score,
                        })
                    
                    # Add small delay to respect API limits
                    time.sleep(0.05)
                    
                except Exception as e:
                    print(f"⚠️  Skipping blueprint {blueprint.id}: {e}")
            
            # Sort by popularity and return top suggestions
            suggestions.sort(key=lambda x: x['popularity_score'], reverse=True)
            return suggestions[:20]
            
        except Exception as e:
            print(f"Failed to get product suggestions: {e}")
            raise
    
    def generate_product_template(self, blueprint_id: int, print_provider_id: int, customizations: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generate a complete product template for a specific blueprint/provider combination"""
        self._init_api_client()
        
        try:
            # Get blueprint and provider details
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
                raise ValueError("No variants found for this combination")
            
            # Generate template
            template = {
                'title': customizations.get('title', f"{blueprint.title} - {provider.title}") if customizations else f"{blueprint.title} - {provider.title}",
                'description': customizations.get('description', blueprint.description) if customizations else blueprint.description,
                'blueprint_id': blueprint_id,
                'print_provider_id': print_provider_id,
                'variants': [
                    {
                        'id': variant.get('id'),
                        'price': customizations.get('price', self._estimate_price(self._categorize_blueprint(blueprint))) if customizations else self._estimate_price(self._categorize_blueprint(blueprint)),
                        'is_enabled': True,
                        'is_default': variant.get('id') == variants[0].get('id'),
                        'grams': self._estimate_weight(self._categorize_blueprint(blueprint)),
                        'options': self._process_variant_options(variant.get('options', []))
                    }
                    for variant in variants
                ],
                'print_areas': [
                    {
                        'variant_ids': [variant.get('id')],
                        'placeholders': self._generate_placeholders(variant, blueprint)
                    }
                    for variant in variants
                ]
            }
            
            return template
            
        except Exception as e:
            print(f"Failed to generate template: {e}")
            raise
    
    def get_available_categories(self) -> Dict[str, int]:
        """Get available categories with product counts"""
        self._init_api_client()
        
        try:
            blueprints = self.api_client.get_blueprints()
            categories = {}
            
            for blueprint in blueprints:
                category = self._categorize_blueprint(blueprint)
                categories[category] = categories.get(category, 0) + 1
            
            return categories
            
        except Exception as e:
            print(f"Failed to get categories: {e}")
            raise
    
    def search_products(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Search products by keywords"""
        self._init_api_client()
        
        try:
            suggestions = []
            keywords_lower = [k.lower() for k in keywords]
            
            # Get all blueprints
            blueprints = self.api_client.get_blueprints()
            
            # Sample blueprints to avoid API overload
            sampled_blueprints = self._sample_array(blueprints, min(20, len(blueprints)))
            
            for blueprint in sampled_blueprints:
                # Check if blueprint matches keywords
                title_lower = blueprint.title.lower()
                description_lower = blueprint.description.lower()
                brand_lower = blueprint.brand.lower()
                
                matches = any(
                    keyword in title_lower or 
                    keyword in description_lower or 
                    keyword in brand_lower
                    for keyword in keywords_lower
                )
                
                if matches:
                    try:
                        # Get print providers for this blueprint
                        providers = self.api_client.get_print_providers(blueprint.id)
                        
                        # Take top 2 providers per blueprint
                        top_providers = providers[:2]
                        
                        for provider in top_providers:
                            blueprint_category = self._categorize_blueprint(blueprint)
                            estimated_price = self._estimate_price(blueprint_category)
                            popularity_score = self._calculate_popularity_score(blueprint, provider)
                            
                            suggestions.append({
                                'blueprint_id': blueprint.id,
                                'print_provider_id': provider.id,
                                'blueprint_title': blueprint.title,
                                'print_provider_title': provider.title,
                                'category': blueprint_category,
                                'description': blueprint.description,
                                'estimated_price': estimated_price,
                                'popularity_score': popularity_score,
                            })
                        
                        # Add small delay to respect API limits
                        time.sleep(0.05)
                        
                    except Exception as e:
                        print(f"⚠️  Skipping blueprint {blueprint.id}: {e}")
            
            # Sort by popularity and return top suggestions
            suggestions.sort(key=lambda x: x['popularity_score'], reverse=True)
            return suggestions[:15]
            
        except Exception as e:
            print(f"Failed to search products: {e}")
            raise
    
    def _categorize_blueprint(self, blueprint) -> str:
        """Categorize a blueprint by product type"""
        title = blueprint.title.lower()
        description = blueprint.description.lower()
        
        if 't-shirt' in title or 'tee' in title or 't-shirt' in description:
            return 't-shirts'
        elif 'hoodie' in title or 'sweatshirt' in title:
            return 'hoodies'
        elif 'mug' in title or 'cup' in title:
            return 'mugs'
        elif 'poster' in title or 'print' in title:
            return 'posters'
        elif 'phone' in title or 'case' in title:
            return 'phone-cases'
        elif 'bag' in title or 'tote' in title:
            return 'bags'
        elif 'hat' in title or 'cap' in title:
            return 'hats'
        elif 'tank' in title or 'sleeveless' in title:
            return 'tank-tops'
        elif 'sticker' in title:
            return 'stickers'
        elif 'pillow' in title:
            return 'pillows'
        elif 'towel' in title:
            return 'towels'
        elif 'sock' in title:
            return 'socks'
        elif 'jacket' in title:
            return 'jackets'
        elif 'dress' in title:
            return 'dresses'
        elif 'pant' in title or 'legging' in title:
            return 'pants'
        else:
            return 'other'
    
    def _estimate_price(self, category: str) -> int:
        """Estimate price for a category (in cents)"""
        price_map = {
            't-shirts': 2500,  # $25.00
            'hoodies': 4500,   # $45.00
            'mugs': 1500,      # $15.00
            'posters': 2000,   # $20.00
            'phone-cases': 1800,  # $18.00
            'bags': 3000,      # $30.00
            'hats': 2200,      # $22.00
            'tank-tops': 2000, # $20.00
            'stickers': 500,   # $5.00
            'pillows': 3500,   # $35.00
            'towels': 2500,    # $25.00
            'socks': 1200,     # $12.00
            'jackets': 5500,   # $55.00
            'dresses': 4000,   # $40.00
            'pants': 3500,     # $35.00
            'other': 2000      # $20.00
        }
        
        return price_map.get(category, 2000)
    
    def _estimate_weight(self, category: str) -> int:
        """Estimate weight for a category (in grams)"""
        weight_map = {
            't-shirts': 180,
            'hoodies': 400,
            'mugs': 350,
            'posters': 50,
            'phone-cases': 30,
            'bags': 200,
            'hats': 100,
            'tank-tops': 150,
            'stickers': 5,
            'pillows': 500,
            'towels': 300,
            'socks': 50,
            'jackets': 600,
            'dresses': 250,
            'pants': 300,
            'other': 200
        }
        
        return weight_map.get(category, 200)
    
    def _calculate_popularity_score(self, blueprint, provider) -> float:
        """Calculate popularity score for a blueprint/provider combination"""
        score = 50.0  # Base score
        
        # Boost popular brands
        popular_brands = ['gildan', 'champion', 'bella+canvas', 'next level']
        if any(brand in blueprint.brand.lower() for brand in popular_brands):
            score += 20
        
        # Boost popular categories
        popular_categories = ['t-shirts', 'hoodies', 'mugs']
        category = self._categorize_blueprint(blueprint)
        if category in popular_categories:
            score += 15
        
        # Boost US-based providers
        if hasattr(provider, 'location') and provider.location:
            if isinstance(provider.location, str) and 'united states' in provider.location.lower():
                score += 10
            elif isinstance(provider.location, dict) and provider.location.get('country') == 'US':
                score += 10
        
        return score
    
    def _filter_blueprints_by_category(self, blueprints: List, category: str) -> List:
        """Filter blueprints by category"""
        return [bp for bp in blueprints if self._categorize_blueprint(bp) == category]
    
    def _generate_placeholders(self, variant: Dict[str, Any], blueprint) -> List[Dict[str, Any]]:
        """Generate placeholders for a variant"""
        if variant.get('placeholders'):
            return [
                {
                    'position': placeholder.get('position', 'front'),
                    'images': [
                        {
                            'id': f"placeholder_{placeholder.get('position', 'front')}",
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
                for placeholder in variant['placeholders']
            ]
        
        # Default placeholder
        return [
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
    
    def _process_variant_options(self, options: Any) -> List[Dict[str, Any]]:
        """Process variant options"""
        if not options:
            return []
        
        if isinstance(options, list):
            return options
        
        if isinstance(options, dict):
            # Convert object format { color: 'Red', size: 'L' } to array format
            return [
                {'id': i + 1, 'value': str(value)}
                for i, (key, value) in enumerate(options.items())
            ]
        
        return []
    
    def _sample_array(self, array: List, size: int) -> List:
        """Sample an array to a specified size"""
        if len(array) <= size:
            return array
        
        # Shuffle and take first n elements
        shuffled = array.copy()
        random.shuffle(shuffled)
        return shuffled[:size]
    
    def _delay(self, ms: float):
        """Delay execution for specified milliseconds"""
        time.sleep(ms / 1000.0) 