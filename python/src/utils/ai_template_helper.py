"""
AI Template Helper
Provides AI-friendly methods to access and categorize templates
"""

import json
import os
from typing import Dict, Any, List
from utils.template_generator import TemplateGenerator


class AITemplateHelper:
    """Provides AI-friendly methods to access and categorize templates"""
    
    def __init__(self):
        self.template_gen = TemplateGenerator()
        self.templates_dir = "templates"
        self.ai_summary_file = "ai-template-summary.md"
    
    def get_ai_template_context(self) -> Dict[str, Any]:
        """Get comprehensive context for AI"""
        try:
            template_info = self.template_gen.get_template_info()
            
            # Categorize templates
            categories = self._categorize_templates()
            
            context = {
                'total_templates': template_info.get('total_templates', 0),
                'total_blueprints': template_info.get('total_blueprints', 0),
                'templates_dir': template_info.get('templates_dir', self.templates_dir),
                'categories': categories,
                'blueprints': template_info.get('blueprints', [])
            }
            
            return context
            
        except Exception as e:
            print(f"Failed to get AI template context: {e}")
            raise
    
    def generate_ai_summary(self) -> str:
        """Generate a markdown summary for AI consumption"""
        try:
            context = self.get_ai_template_context()
            
            summary = f"""# Printify Template Summary for AI

## Overview
- **Total Templates**: {context['total_templates']}
- **Total Blueprints**: {context['total_blueprints']}
- **Templates Directory**: {context['templates_dir']}

## Categories

"""
            
            for category, templates in context['categories'].items():
                summary += f"### {category.title()}\n"
                summary += f"- **Count**: {len(templates)} templates\n"
                summary += "- **Examples**:\n"
                
                for template in templates[:5]:  # Show first 5 examples
                    summary += f"  - {template['title']} (Blueprint {template['blueprint_id']}, Provider {template['print_provider_id']})\n"
                
                if len(templates) > 5:
                    summary += f"  - ... and {len(templates) - 5} more\n"
                
                summary += "\n"
            
            summary += """## Usage for AI

### Template Structure
Each template contains:
- `title`: Product title
- `description`: Product description
- `blueprint_id`: Printify blueprint ID
- `print_provider_id`: Printify print provider ID
- `variants`: Product variants with pricing and options
- `print_areas`: Print areas with placeholder images

### Available Commands
- `python main.py list-all-templates` - List all generated templates
- `python main.py show-ai-context` - Show AI context information
- `python main.py generate-dynamic-template <bp> <pp>` - Generate template on-demand

### Integration Notes
- Templates are stored in JSON format
- Each template is ready for product creation
- Images need to be uploaded separately or replaced with real image IDs
- Pricing and options can be customized per template
"""
            
            # Write summary to file
            with open(self.ai_summary_file, 'w') as f:
                f.write(summary)
            
            return self.ai_summary_file
            
        except Exception as e:
            print(f"Failed to generate AI summary: {e}")
            raise
    
    def _categorize_templates(self) -> Dict[str, List[Dict[str, Any]]]:
        """Categorize templates by product type"""
        try:
            categories = {
                't-shirts': [],
                'hoodies': [],
                'mugs': [],
                'posters': [],
                'phone-cases': [],
                'bags': [],
                'hats': [],
                'tank-tops': [],
                'stickers': [],
                'pillows': [],
                'towels': [],
                'socks': [],
                'jackets': [],
                'dresses': [],
                'pants': [],
                'other': []
            }
            
            # Read templates from directory
            if not os.path.exists(self.templates_dir):
                return categories
            
            for root, dirs, files in os.walk(self.templates_dir):
                for file in files:
                    if file == 'template.json':
                        try:
                            filepath = os.path.join(root, file)
                            with open(filepath, 'r') as f:
                                template = json.load(f)
                            
                            # Categorize based on title and description
                            category = self._categorize_template(template)
                            
                            if category in categories:
                                categories[category].append(template)
                            else:
                                categories['other'].append(template)
                                
                        except Exception as e:
                            print(f"Failed to read template {filepath}: {e}")
            
            # Remove empty categories
            categories = {k: v for k, v in categories.items() if v}
            
            return categories
            
        except Exception as e:
            print(f"Failed to categorize templates: {e}")
            return {}
    
    def _categorize_template(self, template: Dict[str, Any]) -> str:
        """Categorize a single template"""
        title = template.get('title', '').lower()
        description = template.get('description', '').lower()
        
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