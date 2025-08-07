"""
Printify API Client
Handles all API interactions with Printify
"""

import requests
import json
from typing import List, Dict, Any, Optional
from printify_types.printify import (
    PrintifyShop, PrintifyBlueprint, PrintifyPrintProvider, 
    PrintifyProduct, CreateProductRequest, ProductJsonFile
)


class PrintifyApiClient:
    """Client for interacting with the Printify API"""
    
    def __init__(self, api_token: str, shop_id: Optional[str] = None):
        self.api_token = api_token
        self.shop_id = shop_id or ""
        self.base_url = "https://api.printify.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "User-Agent": "EdenPrintify/1.0.0",
            "Content-Type": "application/json"
        }
    
    @classmethod
    def create_with_dynamic_shop_id(cls, api_token: str) -> 'PrintifyApiClient':
        """Create an API client with dynamically fetched shop ID"""
        temp_client = cls(api_token)
        shops = temp_client.get_shops()
        
        if not shops:
            raise ValueError("No shops found for this account. Please create a shop in Printify first.")
        
        if len(shops) == 1:
            print(f"✅ Using shop: {shops[0].title} (ID: {shops[0].id})")
            return cls(api_token, shops[0].id)
        
        # If multiple shops, use the first one but warn the user
        print(f"⚠️  Multiple shops found. Using the first shop: {shops[0].title} (ID: {shops[0].id})")
        print("Available shops:")
        for i, shop in enumerate(shops):
            print(f"  {i + 1}. {shop.title} (ID: {shop.id})")
        
        return cls(api_token, shops[0].id)
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Make a request to the Printify API"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=self.headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=self.headers, json=data, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=self.headers, json=data, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=self.headers, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            # Log detailed error information
            print(f"Printify API Error:")
            print(f"  Status: {getattr(e.response, 'status_code', 'N/A')}")
            print(f"  URL: {url}")
            print(f"  Method: {method}")
            
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json()
                    print(f"  Error Data: {json.dumps(error_data, indent=2)}")
                    
                    # Log validation errors if available
                    if 'errors' in error_data:
                        print("  🚨 Validation Errors:")
                        print(json.dumps(error_data['errors'], indent=2))
                except:
                    print(f"  Response Text: {e.response.text}")
            
            if data:
                print(f"  Request Data: {json.dumps(data, indent=2)}")
            
            raise
    
    def get_shops(self) -> List[PrintifyShop]:
        """Get all shops for the authenticated user"""
        try:
            response = self._make_request("GET", "/shops.json")
            # Convert shop ID to string if it's an integer
            shops = []
            for shop in response:
                if isinstance(shop.get('id'), int):
                    shop['id'] = str(shop['id'])
                shops.append(PrintifyShop(**shop))
            return shops
        except Exception as e:
            print(f"Failed to fetch shops: {e}")
            raise
    
    def get_blueprints(self) -> List[PrintifyBlueprint]:
        """Get all blueprints (product types) available"""
        try:
            response = self._make_request("GET", "/catalog/blueprints.json")
            return [PrintifyBlueprint(**blueprint) for blueprint in response]
        except Exception as e:
            print(f"Failed to fetch blueprints: {e}")
            raise
    
    def get_print_providers(self, blueprint_id: int) -> List[PrintifyPrintProvider]:
        """Get print providers for a specific blueprint"""
        try:
            response = self._make_request("GET", f"/catalog/blueprints/{blueprint_id}/print_providers.json")
            return [PrintifyPrintProvider(**provider) for provider in response]
        except Exception as e:
            print(f"Failed to fetch print providers for blueprint {blueprint_id}: {e}")
            raise
    
    def get_print_provider(self, provider_id: int) -> PrintifyPrintProvider:
        """Get a specific print provider by ID"""
        try:
            response = self._make_request("GET", f"/catalog/print_providers/{provider_id}.json")
            return PrintifyPrintProvider(**response)
        except Exception as e:
            print(f"Failed to fetch print provider {provider_id}: {e}")
            raise
    
    def get_variants(self, blueprint_id: int, print_provider_id: int) -> List[Dict[str, Any]]:
        """Get variants for a specific blueprint and print provider"""
        try:
            response = self._make_request("GET", f"/catalog/blueprints/{blueprint_id}/print_providers/{print_provider_id}/variants.json")
            return response if isinstance(response, list) else []
        except Exception as e:
            print(f"Failed to fetch variants for blueprint {blueprint_id} and print provider {print_provider_id}: {e}")
            raise
    
    def create_product(self, product_data: CreateProductRequest) -> PrintifyProduct:
        """Create a new product"""
        try:
            # Convert to dict for API request
            data = product_data.dict(exclude_none=True)
            response = self._make_request("POST", f"/shops/{self.shop_id}/products.json", data)
            return PrintifyProduct(**response)
        except Exception as e:
            print(f"Failed to create product: {e}")
            raise
    
    def get_products(self) -> List[PrintifyProduct]:
        """Get all products in the current shop"""
        try:
            response = self._make_request("GET", f"/shops/{self.shop_id}/products.json")
            return [PrintifyProduct(**product) for product in response]
        except Exception as e:
            print(f"Failed to fetch products: {e}")
            raise
    
    def get_product(self, product_id: str) -> PrintifyProduct:
        """Get a specific product by ID"""
        try:
            response = self._make_request("GET", f"/shops/{self.shop_id}/products/{product_id}.json")
            return PrintifyProduct(**response)
        except Exception as e:
            print(f"Failed to fetch product {product_id}: {e}")
            raise
    
    def update_product(self, product_id: str, product_data: Dict[str, Any]) -> PrintifyProduct:
        """Update an existing product"""
        try:
            response = self._make_request("PUT", f"/shops/{self.shop_id}/products/{product_id}.json", product_data)
            return PrintifyProduct(**response)
        except Exception as e:
            print(f"Failed to update product {product_id}: {e}")
            raise
    
    def delete_product(self, product_id: str) -> None:
        """Delete a product"""
        try:
            self._make_request("DELETE", f"/shops/{self.shop_id}/products/{product_id}.json")
        except Exception as e:
            print(f"Failed to delete product {product_id}: {e}")
            raise
    
    def publish_product(self, product_id: str, sales_channel_id: str) -> Dict[str, Any]:
        """Publish a product to a sales channel"""
        try:
            data = {"sales_channel_id": sales_channel_id}
            return self._make_request("POST", f"/shops/{self.shop_id}/products/{product_id}/publish.json", data)
        except Exception as e:
            print(f"Failed to publish product {product_id}: {e}")
            raise
    
    def convert_product_json_to_request(self, product_json: ProductJsonFile) -> CreateProductRequest:
        """Convert a product JSON file to a create product request"""
        # Convert variants
        variants = []
        for variant in product_json.variants:
            variant_request = {
                "id": variant["id"],
                "price": variant["price"],
                "is_enabled": variant["is_enabled"],
                "is_default": variant["is_default"],
                "grams": variant["grams"],
                "options": variant.get("options", [])
            }
            variants.append(variant_request)
        
        # Convert print areas
        print_areas = []
        for print_area in product_json.print_areas:
            print_area_request = {
                "variant_ids": print_area["variant_ids"],
                "placeholders": print_area["placeholders"]
            }
            print_areas.append(print_area_request)
        
        return CreateProductRequest(
            title=product_json.title,
            description=product_json.description,
            blueprint_id=product_json.blueprint_id,
            print_provider_id=product_json.print_provider_id,
            variants=variants,
            print_areas=print_areas,
            sales_channel_properties=product_json.sales_channel_properties
        ) 