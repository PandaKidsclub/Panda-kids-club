import type { ShopCart, ShopCollection, ShopLandingData, ShopProduct } from "@/lib/shopify/types";
import { addDemoCartLine, removeDemoCartLine, updateDemoCartLine, type DemoCartState } from "./demo-cart-state";
import { getInitialVariant, resolveVariant } from "./normalise";

const image = {
  altText: "Panda Kids Club development merchandise placeholder",
  height: 914,
  url: "/brand/panda-kids-club-logo.png",
  width: 1536,
};

function product(handle: string, title: string, description: string, amount: string, options: Array<[string, string[]]> = []): ShopProduct {
  const combinations = options.reduce<Array<Record<string, string>>>((result, [name, values]) => (
    result.flatMap((current) => values.map((value) => ({ ...current, [name]: value })))
  ), [{}]);
  const variants = combinations.map((selection, index) => ({
    availableForSale: true,
    compareAtPrice: null,
    id: `demo-variant-${handle}-${index + 1}`,
    image,
    price: { amount, currencyCode: "ZAR" },
    selectedOptions: Object.entries(selection).map(([name, value]) => ({ name, value })),
    title: Object.values(selection).join(" / ") || "Default Title",
  }));

  return {
    availableForSale: true,
    description,
    descriptionHtml: `<p>${description}</p>`,
    featuredImage: image,
    handle,
    id: `demo-product-${handle}`,
    images: [image],
    options: options.map(([name, values]) => ({ name, values })),
    priceRange: { maxVariantPrice: { amount, currencyCode: "ZAR" }, minVariantPrice: { amount, currencyCode: "ZAR" } },
    title,
    variants,
  };
}

export const demoProducts: ShopProduct[] = [
  product("panda-adventure-hoodie", "Panda Adventure Hoodie", "Development fixture for a warm, everyday adventure layer.", "349.00", [["Size", ["5-6", "7-8", "9-10"]], ["Colour", ["Midnight", "Sunrise"]]]),
  product("panda-storytime-t-shirt", "Panda Storytime T-Shirt", "Development fixture for story-led play and reading days.", "199.00", [["Size", ["5-6", "7-8", "9-10"]], ["Colour", ["Ocean", "Coral"]]]),
  product("panda-explorer-backpack", "Panda Explorer Backpack", "Development fixture for school, sleepovers and small expeditions.", "429.00", [["Colour", ["Navy", "Teal"]]]),
  product("panda-water-bottle", "Panda Water Bottle", "Development fixture for a dependable daily companion.", "159.00", [["Style", ["Classic", "Adventure"]]]),
  product("panda-story-bundle", "Panda Story Bundle", "Development fixture for a shared family reading ritual.", "249.00"),
  product("panda-activity-pack", "Panda Activity Pack", "Development fixture for curious hands and bright afternoons.", "129.00"),
];

function collection(handle: string, title: string, products: ShopProduct[]): ShopCollection {
  return { description: "Development fixture collection. Shopify replaces this automatically when configured.", handle, id: `demo-collection-${handle}`, image, products, title };
}

export const demoCollections: ShopCollection[] = [
  collection("featured", "Featured", demoProducts.slice(0, 4)),
  collection("clothing", "Clothing", demoProducts.slice(0, 2)),
  collection("books-activities", "Books & Activities", demoProducts.slice(4)),
  collection("bags-accessories", "Bags & Accessories", demoProducts.slice(2, 4)),
];

export function getDemoShopLanding(): ShopLandingData {
  return { collections: demoCollections, featuredCollection: demoCollections[0], mode: "demo" };
}

export function getDemoProduct(handle: string): ShopProduct | null {
  return demoProducts.find((product) => product.handle === handle) ?? null;
}

export { parseDemoCart } from "./demo-cart-state";
export type { DemoCartState } from "./demo-cart-state";

function findVariant(variantId: string) {
  return demoProducts.flatMap((product) => product.variants.map((variant) => ({ product, variant }))).find(({ variant }) => variant.id === variantId) ?? null;
}

export function demoCartFromState(state: DemoCartState): ShopCart {
  const lines = state.lines.flatMap((line) => {
    const match = findVariant(line.variantId);
    if (!match) return [];
    const amount = (Number(match.variant.price.amount) * line.quantity).toFixed(2);
    return [{ id: `demo-line-${match.variant.id}`, merchandise: { ...match.variant, product: { handle: match.product.handle, title: match.product.title } }, quantity: line.quantity, totalAmount: { ...match.variant.price, amount } }];
  });
  const amount = lines.reduce((total, line) => total + Number(line.totalAmount.amount), 0).toFixed(2);
  return {
    checkoutUrl: null,
    cost: { subtotalAmount: { amount, currencyCode: "ZAR" }, totalAmount: { amount, currencyCode: "ZAR" }, totalTaxAmount: null },
    id: "demo-cart",
    lines,
    totalQuantity: lines.reduce((total, line) => total + line.quantity, 0),
  };
}

export function demoAddLine(state: DemoCartState, variantId: string, quantity: number): DemoCartState {
  const match = findVariant(variantId);
  if (!match || !match.variant.availableForSale) throw new Error("This development fixture variant is unavailable.");
  return addDemoCartLine(state, variantId, quantity);
}

export function demoUpdateLine(state: DemoCartState, lineId: string, quantity: number): DemoCartState {
  const variantId = lineId.replace(/^demo-line-/, "");
  return updateDemoCartLine(state, variantId, quantity);
}

export function demoRemoveLine(state: DemoCartState, lineId: string): DemoCartState {
  return removeDemoCartLine(state, lineId.replace(/^demo-line-/, ""));
}

export function getDemoInitialVariant(product: ShopProduct) {
  return getInitialVariant(product);
}

export function getDemoResolvedVariant(product: ShopProduct, selectedOptions: Record<string, string>) {
  return resolveVariant(product, selectedOptions);
}
