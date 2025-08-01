"""
Product Service
Handles product creation and management operations
"""

import json
from typing import List, Dict, Any
from services.printify_api import PrintifyApiClient
from printify_types.printify import ProductJsonFile, CreateProductRequest


class ProductService:
    """Service for managing Printify products"""
    
    def __init__(self, api_client: PrintifyApiClient):
        self.api_client = api_client
    
    def create_product_from_file(self, product_json_path: str) -> Dict[str, Any]:
        """Create a product from a JSON file"""
        try:
            # Read and parse the product JSON file
            with open(product_json_path, 'r') as f:
                product_data = json.load(f)
            
            # Validate the product data
            product_json = ProductJsonFile(**product_data)
            
            # Convert to create product request
            create_request = self.api_client.convert_product_json_to_request(product_json)
            
            # Create the product
            created_product = self.api_client.create_product(create_request)
            
            return created_product.dict()
            
        except Exception as e:
            print(f"Failed to create product from file {product_json_path}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response status: {e.response.status_code}")
                print(f"Response text: {e.response.text}")
            raise
    
    def list_shops(self) -> List[Dict[str, Any]]:
        """List all available shops"""
        try:
            shops = self.api_client.get_shops()
            return [shop.dict() for shop in shops]
        except Exception as e:
            print(f"Failed to list shops: {e}")
            raise
    
    def list_products(self) -> List[Dict[str, Any]]:
        """List all products in the current shop"""
        try:
            products = self.api_client.get_products()
            return [product.dict() for product in products]
        except Exception as e:
            print(f"Failed to list products: {e}")
            raise
    
    def get_product(self, product_id: str) -> Dict[str, Any]:
        """Get a specific product by ID"""
        try:
            product = self.api_client.get_product(product_id)
            return product.dict()
        except Exception as e:
            print(f"Failed to get product {product_id}: {e}")
            raise
    
    def update_product(self, product_id: str, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing product"""
        try:
            updated_product = self.api_client.update_product(product_id, product_data)
            return updated_product.dict()
        except Exception as e:
            print(f"Failed to update product {product_id}: {e}")
            raise
    
    def delete_product(self, product_id: str) -> None:
        """Delete a product"""
        try:
            self.api_client.delete_product(product_id)
        except Exception as e:
            print(f"Failed to delete product {product_id}: {e}")
            raise
    
    def publish_product(self, product_id: str, sales_channel_id: str) -> Dict[str, Any]:
        """Publish a product to a sales channel"""
        try:
            return self.api_client.publish_product(product_id, sales_channel_id)
        except Exception as e:
            print(f"Failed to publish product {product_id}: {e}")
            raise 