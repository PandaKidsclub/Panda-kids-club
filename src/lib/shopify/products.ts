import { getDemoProduct, getDemoShopLanding } from "@/lib/shopify/demo";
import { getShopifyConfiguration } from "@/lib/shopify/config";
import { normaliseCollection, normaliseProduct } from "@/lib/shopify/normalise";
import { COLLECTION_BY_HANDLE_QUERY, COLLECTIONS_QUERY, PRODUCT_BY_HANDLE_QUERY, PRODUCTS_QUERY } from "@/lib/shopify/graphql/operations";
import { requestShopify } from "@/lib/shopify/client";
import type { ShopLandingData, ShopProduct } from "@/lib/shopify/types";

const PRODUCT_PAGE_SIZE = 12;
const COLLECTION_PAGE_SIZE = 8;

export async function getShopLanding(): Promise<ShopLandingData> {
  const config = getShopifyConfiguration();
  if (!config) return getDemoShopLanding();

  const [collectionData, productData] = await Promise.all([
    requestShopify<{ collections: { nodes: unknown[] } }>(COLLECTIONS_QUERY, { first: COLLECTION_PAGE_SIZE, after: null }, { cache: "products" }),
    requestShopify<{ products: { nodes: unknown[] } }>(PRODUCTS_QUERY, { first: PRODUCT_PAGE_SIZE, after: null }, { cache: "products" }),
  ]);
  const collections = collectionData.collections.nodes.map(normaliseCollection).filter((collection) => collection.products.length > 0);
  const featuredCollection = config.featuredCollectionHandle
    ? collections.find((collection) => collection.handle === config.featuredCollectionHandle) ?? await getShopCollection(config.featuredCollectionHandle)
    : collections[0] ?? null;
  const fallbackProducts = productData.products.nodes.map(normaliseProduct);
  return {
    collections: collections.length > 0 ? collections : fallbackProducts.length > 0 ? [{ description: "", handle: "all", id: "all", image: null, products: fallbackProducts, title: "Shop collection" }] : [],
    featuredCollection,
    mode: "shopify",
  };
}

export async function getShopCollection(handle: string) {
  if (!getShopifyConfiguration()) return getDemoShopLanding().collections.find((collection) => collection.handle === handle) ?? null;
  const data = await requestShopify<{ collection: unknown | null }>(COLLECTION_BY_HANDLE_QUERY, { handle }, { cache: "products" });
  return data.collection ? normaliseCollection(data.collection) : null;
}

export async function getShopProductByHandle(handle: string): Promise<ShopProduct | null> {
  if (!getShopifyConfiguration()) return getDemoProduct(handle);
  const data = await requestShopify<{ product: unknown | null }>(PRODUCT_BY_HANDLE_QUERY, { handle }, { cache: "products" });
  return data.product ? normaliseProduct(data.product) : null;
}
