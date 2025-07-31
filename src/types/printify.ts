export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  blueprint_id: number;
  print_provider_id: number;
  variants: PrintifyVariant[];
  print_areas: PrintifyPrintArea[];
  sales_channel_properties: SalesChannelProperty[];
}

export interface PrintifyVariant {
  id: number;
  price: number;
  is_enabled: boolean;
  is_default: boolean;
  grams: number;
  options: VariantOption[];
}

export interface VariantOption {
  id: number;
  value: string;
}

export interface PrintifyPrintArea {
  variant_ids: number[];
  placeholders: Placeholder[];
}

export interface Placeholder {
  position: string;
  images: PlaceholderImage[];
}

export interface PlaceholderImage {
  id: string;
  name: string;
  url: string;
  preview_url: string;
  x: number;
  y: number;
  scale: number;
  angle: number;
}

export interface SalesChannelProperty {
  sales_channel_id: string;
  properties: {
    title?: string;
    description?: string;
    price?: number;
    is_enabled?: boolean;
  };
}

export interface PrintifyShop {
  id: string;
  title: string;
  sales_channel: string;
}

export interface PrintifyBlueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: string[];
}

export interface PrintifyPrintProvider {
  id: number;
  title: string;
  location: string;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  blueprint_id: number;
  print_provider_id: number;
  variants: CreateVariantRequest[];
  print_areas: CreatePrintAreaRequest[];
  sales_channel_properties?: SalesChannelProperty[];
}

export interface CreateVariantRequest {
  id: number;
  price: number;
  is_enabled: boolean;
  is_default: boolean;
  grams: number;
  options: VariantOption[];
}

export interface CreatePrintAreaRequest {
  variant_ids: number[];
  placeholders: CreatePlaceholderRequest[];
}

export interface CreatePlaceholderRequest {
  position: string;
  images: CreatePlaceholderImageRequest[];
}

export interface CreatePlaceholderImageRequest {
  id: string;
  name: string;
  url: string;
  preview_url: string;
  x: number;
  y: number;
  scale: number;
  angle: number;
}

export interface ProductJsonFile {
  title: string;
  description: string;
  blueprint_id: number;
  print_provider_id: number;
  variants: ProductVariantJson[];
  print_areas: ProductPrintAreaJson[];
  sales_channel_properties?: SalesChannelProperty[];
}

export interface ProductVariantJson {
  id: number;
  price: number;
  is_enabled: boolean;
  is_default: boolean;
  grams: number;
  options: VariantOption[];
}

export interface ProductPrintAreaJson {
  variant_ids: number[];
  placeholders: ProductPlaceholderJson[];
}

export interface ProductPlaceholderJson {
  position: string;
  images: ProductImageJson[];
}

export interface ProductImageJson {
  id: string;
  name: string;
  url: string;
  preview_url: string;
  x: number;
  y: number;
  scale: number;
  angle: number;
}
