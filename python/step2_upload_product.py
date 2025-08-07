#!/usr/bin/env python3
"""
Step 2: Upload the edited product.json to Printify
"""

import asyncio
import json
import os
import sys
import requests
import base64
from PIL import Image, ImageDraw, ImageFont

# Add src to path for imports
sys.path.append(str(os.path.join(os.path.dirname(__file__), "src")))

from utils.config import load_config, validate_config
from services.printify_api import PrintifyApiClient

def create_test_image(text, filename):
    """Create a simple test image"""
    width, height = 800, 600
    image = Image.new('RGB', (width, height), color='#0066CC')
    draw = ImageDraw.Draw(image)
    
    try:
        font = ImageFont.load_default()
    except:
        font = None
    
    # Draw text
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    draw.text((x, y), text, fill='white', font=font)
    
    # Save the image
    image.save(filename, "JPEG", quality=95)
    
    print(f"✅ Created test image: {filename}")
    print(f"   Size: {width}x{height} pixels")
    print(f"   File size: {os.path.getsize(filename)} bytes")
    print(f"   Text: {text}")
    
    return filename

def upload_image_to_printify(image_path, api_token):
    """Upload an image to Printify"""
    try:
        # Read and encode the image
        with open(image_path, 'rb') as f:
            image_data = f.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Prepare the upload data
        upload_data = {
            "contents": image_base64,
            "file_name": os.path.basename(image_path)
        }
        
        # Make the API request
        url = "https://api.printify.com/v1/uploads/images.json"
        headers = {
            "Authorization": f"Bearer {api_token}",
            "User-Agent": "EdenPrintify/1.0.0",
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, headers=headers, json=upload_data, timeout=30)
        response.raise_for_status()
        
        upload_result = response.json()
        return upload_result
        
    except Exception as e:
        print(f"❌ Failed to upload image {image_path}: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        raise

async def upload_product():
    """Upload the edited product.json to Printify"""
    
    print("📤 Step 2: Uploading Product to Printify")
    print("=" * 50)
    
    # Check if product.json exists
    if not os.path.exists('product.json'):
        print("❌ Error: product.json not found!")
        print("Please run step1_download_template.py first to download a template.")
        return None
    
    # Check if .env file exists
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
        
        # Step 1: Create and upload test images
        print(f"\n🖼️  Step 1: Creating and uploading images...")
        
        # Create front image
        print("📸 Creating front image...")
        front_image_filename = create_test_image("Front Design", "front_test_image.jpg")
        
        # Create back image
        print("📸 Creating back image...")
        back_image_filename = create_test_image("Back Design", "back_test_image.jpg")
        
        # Upload images to Printify
        print("📤 Uploading front image to Printify...")
        front_uploaded_image = upload_image_to_printify(front_image_filename, config['printify_api_token'])
        print(f"✅ Front image uploaded with ID: {front_uploaded_image['id']}")
        
        print("📤 Uploading back image to Printify...")
        back_uploaded_image = upload_image_to_printify(back_image_filename, config['printify_api_token'])
        print(f"✅ Back image uploaded with ID: {back_uploaded_image['id']}")
        
        # Step 2: Read and update product.json
        print(f"\n📄 Step 2: Reading and updating product.json...")
        with open('product.json', 'r') as f:
            product_data = json.load(f)
        
        print(f"✅ Product data loaded")
        print(f"   Title: {product_data.get('title', 'No title')}")
        print(f"   Variants: {len(product_data.get('variants', []))}")
        print(f"   Print Areas: {len(product_data.get('print_areas', []))}")
        
        # Step 3: Update images with real Printify image IDs
        print(f"🔄 Updating product images with real Printify image IDs...")
        
        # Create a mapping of positions to uploaded images
        image_mapping = {
            'front': front_uploaded_image,
            'back': back_uploaded_image
        }
        
        # Update all print areas with real image IDs
        for print_area in product_data.get('print_areas', []):
            for placeholder in print_area.get('placeholders', []):
                position = placeholder.get('position', 'front')
                uploaded_image = image_mapping.get(position, front_uploaded_image)
                
                for image in placeholder.get('images', []):
                    # Update with real Printify image data
                    image['id'] = uploaded_image['id']
                    image['url'] = uploaded_image['preview_url']  # Use preview_url instead of url
                    image['preview_url'] = uploaded_image['preview_url']
                    image['name'] = f"{position}_design.jpg"
                    # Ensure angle is an integer (Printify requirement)
                    image['angle'] = int(image.get('angle', 0))
        
        print(f"✅ Updated {len(product_data.get('print_areas', []))} print areas with real image IDs")
        
        # Fix variant options format
        print(f"🔧 Fixing variant options format...")
        for variant in product_data.get('variants', []):
            if 'options' in variant:
                fixed_options = []
                for option in variant['options']:
                    if isinstance(option, int):
                        # Convert integer to proper format
                        fixed_options.append({"id": option, "value": str(option)})
                    elif isinstance(option, dict):
                        # Already in correct format
                        fixed_options.append(option)
                    else:
                        # Fallback
                        fixed_options.append({"id": option, "value": str(option)})
                variant['options'] = fixed_options
        
        print(f"✅ Fixed {len(product_data.get('variants', []))} variants")
        
        # Step 4: Upload product to Printify
        print(f"\n🚀 Step 4: Creating product on Printify...")
        
        # Get shop ID dynamically
        print(f"🔄 Fetching shop ID...")
        temp_client = PrintifyApiClient(config['printify_api_token'])
        shops = temp_client.get_shops()
        
        if not shops:
            raise Exception("No shops found for this account. Please create a shop in Printify first.")
        
        shop_id = shops[0].id
        print(f"✅ Using shop: {shops[0].title} (ID: {shop_id})")
        
        # Upload directly to Printify API
        url = f"https://api.printify.com/v1/shops/{shop_id}/products.json"
        headers = {
            "Authorization": f"Bearer {config['printify_api_token']}",
            "User-Agent": "EdenPrintify/1.0.0",
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, headers=headers, json=product_data, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Upload failed with status {response.status_code}")
            print(f"Response: {response.text}")
            raise Exception(f"Product creation failed: {response.text}")
        
        created_product = response.json()
        
        print(f"✅ Product created successfully!")
        print(f"   Product ID: {created_product.get('id')}")
        print(f"   Title: {created_product.get('title')}")
        print(f"   Description: {created_product.get('description', '')[:100]}...")
        print(f"   Blueprint ID: {created_product.get('blueprint_id')}")
        print(f"   Print Provider ID: {created_product.get('print_provider_id')}")
        print(f"   Variants: {len(created_product.get('variants', []))}")
        print(f"   Print Areas: {len(created_product.get('print_areas', []))}")
        
        # Clean up temporary files
        for filename in [front_image_filename, back_image_filename]:
            if os.path.exists(filename):
                os.remove(filename)
                print(f"🧹 Cleaned up: {filename}")
        
        # Save upload results
        upload_results = {
            "upload_timestamp": asyncio.get_event_loop().time(),
            "product_id": created_product.get('id'),
            "product_title": created_product.get('title'),
            "images_uploaded": {
                "front_image_id": front_uploaded_image['id'],
                "back_image_id": back_uploaded_image['id']
            },
            "product_data": created_product,
            "status": "success"
        }
        
        with open('upload_results.json', 'w') as f:
            json.dump(upload_results, f, indent=2)
        
        print(f"\n📄 Upload results saved to: upload_results.json")
        print(f"🎉 Product uploaded successfully!")
        print(f"\n🔗 You can view your product in your Printify dashboard")
        print(f"   Product URL: https://printify.com/app/shops/{shop_id}/products/{created_product.get('id')}")
        
        return upload_results
        
    except Exception as e:
        print(f"❌ Error uploading product: {e}")
        
        # Save error results
        error_results = {
            "upload_timestamp": asyncio.get_event_loop().time(),
            "error": str(e),
            "error_type": type(e).__name__,
            "status": "failed"
        }
        
        with open('upload_results.json', 'w') as f:
            json.dump(error_results, f, indent=2)
        
        print(f"📄 Error results saved to: upload_results.json")
        return None

if __name__ == "__main__":
    asyncio.run(upload_product()) 