"""
Image Uploader
Handles image uploads to Printify
"""

import os
import requests
import tempfile
from typing import Dict, Any
from PIL import Image, ImageDraw, ImageFont


class ImageUploader:
    """Handles image uploads to Printify"""
    
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.base_url = "https://api.printify.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "User-Agent": "EdenPrintify/1.0.0"
        }
    
    def upload_image(self, image_path: str) -> Dict[str, str]:
        """Upload an image to Printify"""
        try:
            # Check if file exists
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image file not found: {image_path}")
            
            # Prepare the upload data
            with open(image_path, 'rb') as f:
                files = {'file': (os.path.basename(image_path), f, 'image/png')}
                
                response = requests.post(
                    f"{self.base_url}/uploads/images.json",
                    headers=self.headers,
                    files=files,
                    timeout=60
                )
            
            response.raise_for_status()
            upload_data = response.json()
            
            return {
                'id': upload_data['id'],
                'url': upload_data.get('url', upload_data.get('preview_url')),
                'preview_url': upload_data['preview_url']
            }
            
        except Exception as e:
            print(f"Failed to upload image {image_path}: {e}")
            raise
    
    def create_test_image(self) -> str:
        """Create a simple test image for testing uploads"""
        try:
            # Create a simple test image
            width, height = 400, 400
            image = Image.new('RGB', (width, height), color='white')
            draw = ImageDraw.Draw(image)
            
            # Add some text
            try:
                # Try to use a default font
                font = ImageFont.load_default()
            except:
                font = None
            
            text = "Test Image\nEden Printify"
            bbox = draw.textbbox((0, 0), text, font=font) if font else (0, 0, 200, 50)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            x = (width - text_width) // 2
            y = (height - text_height) // 2
            
            draw.text((x, y), text, fill='black', font=font)
            
            # Add a border
            draw.rectangle([0, 0, width-1, height-1], outline='black', width=2)
            
            # Save to temporary file
            temp_file = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
            image.save(temp_file.name, 'PNG')
            temp_file.close()
            
            return temp_file.name
            
        except Exception as e:
            print(f"Failed to create test image: {e}")
            raise 