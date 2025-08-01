"""
Printify API Types
Type definitions for Printify API entities
"""

from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field


class VariantOption(BaseModel):
    """Variant option (e.g., color, size)"""
    id: int
    value: str


class PlaceholderImage(BaseModel):
    """Image within a placeholder"""
    id: str
    name: str
    url: str
    preview_url: str
    x: float = 0
    y: float = 0
    scale: float = 1
    angle: int = 0


class Placeholder(BaseModel):
    """Print area placeholder"""
    position: str
    images: List[PlaceholderImage]


class PrintArea(BaseModel):
    """Print area for a product"""
    variant_ids: List[int]
    placeholders: List[Placeholder]


class SalesChannelProperty(BaseModel):
    """Sales channel property"""
    sales_channel_id: str
    properties: Dict[str, Any] = Field(default_factory=dict)


class PrintifyVariant(BaseModel):
    """Product variant"""
    id: int
    price: int
    is_enabled: bool
    is_default: bool
    grams: int
    options: List[VariantOption]


class PrintifyProduct(BaseModel):
    """Printify product"""
    id: str
    title: str
    description: str
    blueprint_id: int
    print_provider_id: int
    variants: List[PrintifyVariant]
    print_areas: List[PrintArea]
    sales_channel_properties: List[SalesChannelProperty] = Field(default_factory=list)


class PrintifyShop(BaseModel):
    """Printify shop"""
    id: str
    title: str
    sales_channel: str


class PrintifyBlueprint(BaseModel):
    """Printify blueprint (product type)"""
    id: int
    title: str
    description: str
    brand: str
    model: str
    images: List[str] = Field(default_factory=list)


class PrintifyPrintProvider(BaseModel):
    """Printify print provider"""
    id: int
    title: str
    location: Union[str, Dict[str, Any]]


class CreateVariantRequest(BaseModel):
    """Create variant request"""
    id: int
    price: int
    is_enabled: bool
    is_default: bool
    grams: int
    options: List[VariantOption]


class CreatePrintAreaRequest(BaseModel):
    """Create print area request"""
    variant_ids: List[int]
    placeholders: List[Placeholder]


class CreateProductRequest(BaseModel):
    """Create product request"""
    title: str
    description: str
    blueprint_id: int
    print_provider_id: int
    variants: List[CreateVariantRequest]
    print_areas: List[CreatePrintAreaRequest]
    sales_channel_properties: Optional[List[SalesChannelProperty]] = None


class ProductJsonFile(BaseModel):
    """Product JSON file structure"""
    title: str
    description: str
    blueprint_id: int
    print_provider_id: int
    variants: List[Dict[str, Any]]
    print_areas: List[Dict[str, Any]]
    sales_channel_properties: Optional[List[SalesChannelProperty]] = None


# Additional types for internal use
class Blueprint(BaseModel):
    """Internal blueprint representation"""
    id: int
    title: str
    description: str
    brand: str
    model: str


class PrintProvider(BaseModel):
    """Internal print provider representation"""
    id: int
    title: str
    location: str


class Variant(BaseModel):
    """Internal variant representation"""
    id: int
    title: str
    options: Optional[Dict[str, Any]] = None
    placeholders: Optional[List[Dict[str, Any]]] = None


class ProductTemplate(BaseModel):
    """Product template"""
    title: str
    description: str
    blueprint_id: int
    print_provider_id: int
    variants: List[Dict[str, Any]]
    print_areas: List[Dict[str, Any]]


class ProductSuggestion(BaseModel):
    """Product suggestion for discovery"""
    blueprint_id: int
    print_provider_id: int
    blueprint_title: str
    print_provider_title: str
    category: str
    description: str
    estimated_price: int
    popularity_score: float 