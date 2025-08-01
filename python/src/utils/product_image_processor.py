"""
Product Image Processor
Handles automatic image extraction, upload, and replacement in product JSON
"""

import json
import os
import requests
from typing import Dict, Any, List
from urllib.parse import urlparse


class ProductImageProcessor:
    """Handles automatic image processing for product JSON files"""
    
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.base_url = "https://api.printify.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "User-Agent": "EdenPrintify/1.0.0",
            "Content-Type": "application/json"
        }
    
    def process_product_with_images(self, product_json_path: str) -> str:
        """Process a product JSON file by extracting images, uploading them, and replacing URLs"""
        try:
            # Read the product JSON file
            with open(product_json_path, 'r') as f:
                product_data = json.load(f)
            
            # Extract and upload images
            processed_data = self._process_images_in_product(product_data)
            
            # Clean product data (remove sales_channel_properties if needed)
            processed_data = self._clean_product_data(processed_data)
            
            # Write the processed product data to a new file
            processed_path = product_json_path.replace('.json', '-processed.json')
            with open(processed_path, 'w') as f:
                json.dump(processed_data, f, indent=2)
            
            return processed_path
            
        except Exception as e:
            print(f"Failed to process product with images: {e}")
            raise
    
    def _process_images_in_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process all images in a product data structure"""
        try:
            # Process images in print areas
            if 'print_areas' in product_data:
                for print_area in product_data['print_areas']:
                    if 'placeholders' in print_area:
                        for placeholder in print_area['placeholders']:
                            if 'images' in placeholder:
                                for image in placeholder['images']:
                                    if 'url' in image and image['url'].startswith('http'):
                                        try:
                                            # Upload the image to Printify
                                            uploaded_image = self._upload_image_url_to_printify(
                                                image['url'], 
                                                image.get('name', 'uploaded_image')
                                            )
                                            
                                            # Replace the image data with Printify image data
                                            image['id'] = uploaded_image['id']
                                            image['url'] = uploaded_image['url']
                                            image['preview_url'] = uploaded_image['preview_url']
                                            
                                            print(f"✅ Uploaded image: {image['name']} -> ID: {uploaded_image['id']}")
                                            
                                        except Exception as e:
                                            print(f"⚠️  Failed to upload image {image.get('name', 'unknown')}: {e}")
                                            # Keep the original image data if upload fails
            
            return product_data
            
        except Exception as e:
            print(f"Failed to process images in product: {e}")
            raise
    
    def _upload_image_url_to_printify(self, image_url: str, file_name: str) -> Dict[str, str]:
        """Upload an image URL to Printify"""
        try:
            # Use the URL-based upload endpoint
            upload_data = {
                'url': image_url,
                'file_name': file_name
            }
            
            response = requests.post(
                f"{self.base_url}/uploads/images.json",
                headers=self.headers,
                json=upload_data,
                timeout=60
            )
            
            response.raise_for_status()
            upload_response = response.json()
            
            return {
                'id': upload_response['id'],
                'url': upload_response.get('url', upload_response.get('preview_url')),
                'preview_url': upload_response['preview_url']
            }
            
        except Exception as e:
            print(f"Failed to upload image URL to Printify: {e}")
            raise
    
    def _clean_product_data(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Clean product data for compatibility"""
        # Remove sales_channel_properties if present (can cause issues)
        if 'sales_channel_properties' in product_data:
            del product_data['sales_channel_properties']
            print("🧹 Removed sales_channel_properties for compatibility")
        
        return product_data 