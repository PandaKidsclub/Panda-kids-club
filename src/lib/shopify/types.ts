export type ShopMode = "demo" | "shopify";

export interface ShopMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopImage {
  altText: string | null;
  height: number | null;
  url: string;
  width: number | null;
}

export interface ShopProductVariant {
  availableForSale: boolean;
  compareAtPrice: ShopMoney | null;
  id: string;
  image: ShopImage | null;
  price: ShopMoney;
  selectedOptions: Array<{ name: string; value: string }>;
  title: string;
}

export interface ShopProductOption {
  name: string;
  values: string[];
}

export interface ShopProduct {
  availableForSale: boolean;
  description: string;
  descriptionHtml: string;
  featuredImage: ShopImage | null;
  handle: string;
  id: string;
  images: ShopImage[];
  options: ShopProductOption[];
  priceRange: { maxVariantPrice: ShopMoney; minVariantPrice: ShopMoney };
  title: string;
  variants: ShopProductVariant[];
}

export interface ShopCollection {
  description: string;
  handle: string;
  id: string;
  image: ShopImage | null;
  products: ShopProduct[];
  title: string;
}

export interface ShopCartLine {
  id: string;
  merchandise: ShopProductVariant & { product: Pick<ShopProduct, "handle" | "title"> };
  quantity: number;
  totalAmount: ShopMoney;
}

export interface ShopCart {
  checkoutUrl: string | null;
  cost: {
    subtotalAmount: ShopMoney;
    totalAmount: ShopMoney;
    totalTaxAmount: ShopMoney | null;
  };
  id: string | null;
  lines: ShopCartLine[];
  totalQuantity: number;
}

export interface ShopCartResult {
  cart: ShopCart;
  mode: ShopMode;
  warnings: string[];
}

export interface ShopLandingData {
  collections: ShopCollection[];
  featuredCollection: ShopCollection | null;
  mode: ShopMode;
}
