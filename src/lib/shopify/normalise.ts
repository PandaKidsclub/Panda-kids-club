import type { ShopCart, ShopCollection, ShopImage, ShopMoney, ShopProduct, ShopProductVariant } from "@/lib/shopify/types";

type RecordLike = Record<string, unknown>;

function asRecord(value: unknown): RecordLike {
  return value && typeof value === "object" ? value as RecordLike : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function normaliseMoney(value: unknown): ShopMoney {
  const money = asRecord(value);
  return { amount: String(money.amount ?? "0"), currencyCode: String(money.currencyCode ?? "ZAR") };
}

export function normaliseImage(value: unknown): ShopImage | null {
  if (!value) return null;
  const image = asRecord(value);
  const url = typeof image.url === "string" ? image.url : "";
  if (!url) return null;
  return {
    altText: typeof image.altText === "string" ? image.altText : null,
    height: typeof image.height === "number" ? image.height : null,
    url,
    width: typeof image.width === "number" ? image.width : null,
  };
}

export function normaliseVariant(value: unknown): ShopProductVariant {
  const variant = asRecord(value);
  return {
    availableForSale: Boolean(variant.availableForSale),
    compareAtPrice: normaliseMoneyOrNull(variant.compareAtPrice),
    id: String(variant.id ?? ""),
    image: normaliseImage(variant.image),
    price: normaliseMoney(variant.price),
    selectedOptions: asArray(variant.selectedOptions).map((option) => {
      const record = asRecord(option);
      return { name: String(record.name ?? ""), value: String(record.value ?? "") };
    }),
    title: String(variant.title ?? "Default Title"),
  };
}

export function normaliseProduct(value: unknown): ShopProduct {
  const product = asRecord(value);
  const variants = asArray(asRecord(product.variants).nodes).map(normaliseVariant);
  const range = asRecord(product.priceRange);
  return {
    availableForSale: Boolean(product.availableForSale),
    description: String(product.description ?? ""),
    descriptionHtml: String(product.descriptionHtml ?? ""),
    featuredImage: normaliseImage(product.featuredImage),
    handle: String(product.handle ?? ""),
    id: String(product.id ?? ""),
    images: asArray(asRecord(product.images).nodes).map(normaliseImage).filter((image): image is ShopImage => Boolean(image)),
    options: asArray(product.options).map((option) => {
      const record = asRecord(option);
      return { name: String(record.name ?? ""), values: asArray(record.values).map(String) };
    }),
    priceRange: { maxVariantPrice: normaliseMoney(range.maxVariantPrice), minVariantPrice: normaliseMoney(range.minVariantPrice) },
    title: String(product.title ?? "Product"),
    variants,
  };
}

function normaliseMoneyOrNull(value: unknown): ShopMoney | null {
  return value ? normaliseMoney(value) : null;
}

export function normaliseCollection(value: unknown): ShopCollection {
  const collection = asRecord(value);
  return {
    description: String(collection.description ?? ""),
    handle: String(collection.handle ?? ""),
    id: String(collection.id ?? ""),
    image: normaliseImage(collection.image),
    products: asArray(asRecord(collection.products).nodes).map(normaliseProduct),
    title: String(collection.title ?? "Collection"),
  };
}

export function normaliseCart(value: unknown): ShopCart {
  const cart = asRecord(value);
  const cost = asRecord(cart.cost);
  return {
    checkoutUrl: typeof cart.checkoutUrl === "string" ? cart.checkoutUrl : null,
    cost: {
      subtotalAmount: normaliseMoney(cost.subtotalAmount),
      totalAmount: normaliseMoney(cost.totalAmount),
      totalTaxAmount: cost.totalTaxAmount ? normaliseMoney(cost.totalTaxAmount) : null,
    },
    id: typeof cart.id === "string" ? cart.id : null,
    lines: asArray(asRecord(cart.lines).nodes).flatMap((line) => {
      const record = asRecord(line);
      const merchandise = asRecord(record.merchandise);
      if (!merchandise.id) return [];
      const variant = normaliseVariant(merchandise);
      const product = asRecord(merchandise.product);
      return [{
        id: String(record.id ?? ""),
        merchandise: { ...variant, product: { handle: String(product.handle ?? ""), title: String(product.title ?? "Product") } },
        quantity: Number(record.quantity ?? 0),
        totalAmount: normaliseMoney(asRecord(record.cost).totalAmount),
      }];
    }),
    totalQuantity: Number(cart.totalQuantity ?? 0),
  };
}

export function resolveVariant(product: ShopProduct, selectedOptions: Record<string, string>): ShopProductVariant | null {
  return product.variants.find((variant) => product.options.every((option) => variant.selectedOptions.some(
    (selected) => selected.name === option.name && selected.value === selectedOptions[option.name],
  ))) ?? null;
}

export function getInitialVariant(product: ShopProduct): ShopProductVariant | null {
  return product.variants.find((variant) => variant.availableForSale) ?? product.variants[0] ?? null;
}
