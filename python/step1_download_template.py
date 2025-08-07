#!/usr/bin/env python3
"""
Step 1: Fetch a template from Printify API and save it for user editing
"""

import asyncio
import json
import os
import sys
import requests

# Add src to path for imports
sys.path.append(str(os.path.join(os.path.dirname(__file__), "src")))

from utils.config import load_config, validate_config

def fetch_printify_template(api_token, blueprint_id=15, print_provider_id=3):
    """Fetch a template from Printify API"""
    try:
        # Get blueprint details
        blueprint_url = f"https://api.printify.com/v1/catalog/blueprints/{blueprint_id}.json"
        headers = {
            "Authorization": f"Bearer {api_token}",
            "User-Agent": "EdenPrintify/1.0.0"
        }
        
        print(f"📡 Fetching blueprint {blueprint_id} from Printify...")
        blueprint_response = requests.get(blueprint_url, headers=headers, timeout=30)
        blueprint_response.raise_for_status()
        blueprint_data = blueprint_response.json()
        
        print(f"✅ Blueprint fetched: {blueprint_data.get('title', 'Unknown')}")
        
        # Get print provider details
        provider_url = f"https://api.printify.com/v1/catalog/print_providers/{print_provider_id}.json"
        print(f"📡 Fetching print provider {print_provider_id} from Printify...")
        provider_response = requests.get(provider_url, headers=headers, timeout=30)
        provider_response.raise_for_status()
        provider_data = provider_response.json()
        
        print(f"✅ Print provider fetched: {provider_data.get('title', 'Unknown')}")
        
        # Get variants for this blueprint and provider
        variants_url = f"https://api.printify.com/v1/catalog/blueprints/{blueprint_id}/print_providers/{print_provider_id}/variants.json"
        print(f"📡 Fetching variants from Printify...")
        variants_response = requests.get(variants_url, headers=headers, timeout=30)
        variants_response.raise_for_status()
        variants_data = variants_response.json()
        
        print(f"✅ Variants fetched: {len(variants_data)} variants available")
        
        # Create a template structure
        template = {
            "title": f"Custom {blueprint_data.get('title', 'Product')}",
            "description": f"A beautiful custom {blueprint_data.get('title', 'product').lower()}",
            "blueprint_id": blueprint_id,
            "print_provider_id": print_provider_id,
            "variants": [],
            "print_areas": []
        }
        
        # Extract the actual variants list from the response
        actual_variants = variants_data.get("variants", [])
        
        # Add first variant as default
        if actual_variants and len(actual_variants) > 0:
            first_variant = actual_variants[0]
            print(f"📋 Using variant: {first_variant.get('title', 'Unknown')} (ID: {first_variant.get('id')})")
            
            template["variants"] = [{
                "id": first_variant["id"],
                "price": 2500,  # $25.00 in cents
                "is_enabled": True,
                "is_default": True,
                "grams": first_variant.get("grams", 180),
                "options": []
            }]
            
            # Add print areas if available
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
                # Create a default print area if none exist
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
            # Create a basic template structure if no variants are available
            template["variants"] = [{
                "id": 13629,  # Default t-shirt variant ID
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
        print(f"❌ Failed to fetch template from Printify: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        raise

async def download_template():
    """Fetch a template from Printify API and save it"""
    
    print("📥 Step 1: Fetching Template from Printify")
    print("=" * 50)
    
    # Check for configuration
    if not os.path.exists('.env'):
        print("❌ Error: .env file not found!")
        print("Please create a .env file with your Printify credentials:")
        print("PRINTIFY_API_TOKEN=your_api_token_here")
        print("# Shop ID will be fetched automatically")
        return None
    
    try:
        # Load configuration
        config = load_config()
        validate_config(config)
        
        print(f"✅ Configuration loaded successfully")
        print(f"   API Token: {config['printify_api_token'][:10]}...")
        print(f"   Shop ID: Will be fetched automatically")
        
        # Step 1: Fetch template from Printify API
        print(f"\n1️⃣ Fetching template from Printify API...")
        
        # For now, use a default t-shirt template (blueprint_id=15, print_provider_id=3)
        # You can modify these IDs to get different product types
        template_data = fetch_printify_template(
            config['printify_api_token'],
            blueprint_id=15,  # T-shirt
            print_provider_id=3  # Default provider
        )
        
        print(f"✅ Template fetched successfully")
        print(f"   Title: {template_data.get('title', 'No title')}")
        print(f"   Blueprint ID: {template_data.get('blueprint_id')}")
        print(f"   Provider ID: {template_data.get('print_provider_id')}")
        print(f"   Variants: {len(template_data.get('variants', []))}")
        print(f"   Print Areas: {len(template_data.get('print_areas', []))}")
        
        # Step 2: Ensure templates directory exists
        print(f"\n2️⃣ Saving template to templates/template.json...")
        
        if not os.path.exists('templates'):
            os.makedirs('templates')
            print(f"✅ Created templates directory")
        
        # Save the fetched template
        with open('templates/template.json', 'w') as f:
            json.dump(template_data, f, indent=2)
        
        print(f"✅ Template saved to: templates/template.json")
        print(f"   File size: {os.path.getsize('templates/template.json')} bytes")
        
        # Step 3: Create empty product.json
        print(f"\n3️⃣ Creating empty product.json...")
        
        empty_product = {}
        
        with open('product.json', 'w') as f:
            json.dump(empty_product, f, indent=2)
        
        print(f"✅ Empty product.json created")
        print(f"   File size: {os.path.getsize('product.json')} bytes")
        
        # Step 4: Instructions for the user
        print(f"\n📝 Next Steps:")
        print(f"   1. Copy the template data from templates/template.json to product.json")
        print(f"   2. Edit the product.json file with your customizations")
        print(f"   3. Update the title, description, and other fields as needed")
        print(f"   4. Add your own images or modify the existing ones")
        print(f"   5. Save the file when you're done")
        print(f"   6. Run: python step2_upload_product.py")
        
        print(f"\n🎯 Template Details:")
        print(f"   Title: {template_data.get('title', 'No title')}")
        print(f"   Description: {template_data.get('description', 'No description')[:100]}...")
        print(f"   Blueprint ID: {template_data.get('blueprint_id')}")
        print(f"   Print Provider ID: {template_data.get('print_provider_id')}")
        print(f"   Variants: {len(template_data.get('variants', []))}")
        print(f"   Print Areas: {len(template_data.get('print_areas', []))}")
        
        # Save template info for reference
        template_info = {
            "template_source": "printify_api",
            "template_title": template_data.get('title', 'No title'),
            "blueprint_id": template_data.get('blueprint_id'),
            "print_provider_id": template_data.get('print_provider_id'),
            "fetch_timestamp": asyncio.get_event_loop().time(),
            "instructions": "Copy template data to product.json, edit it, then run step2_upload_product.py"
        }
        
        with open('template_info.json', 'w') as f:
            json.dump(template_info, f, indent=2)
        
        print(f"\n📄 Template info saved to: template_info.json")
        print(f"🎉 Step 1 completed! Template fetched and ready for editing.")
        
        return {
            "template_source": "printify_api",
            "template_data": template_data
        }
        
    except Exception as e:
        print(f"❌ Error fetching template: {e}")
        return None

if __name__ == "__main__":
    asyncio.run(download_template()) 