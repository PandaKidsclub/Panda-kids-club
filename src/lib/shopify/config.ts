import type { ShopMode } from "@/lib/shopify/types";

const DEFAULT_API_VERSION = "2026-07";
const DEFAULT_COUNTRY = "ZA";

export interface ShopifyConfiguration {
  apiVersion: string;
  defaultCountry: string;
  featuredCollectionHandle: string | null;
  privateAccessToken: string;
  storeDomain: string;
}

function clean(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function normaliseStoreDomain(value: string | undefined): string | null {
  const domain = clean(value).replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();

  if (!domain || domain.includes("/") || !/^[a-z0-9.-]+(?::\d+)?$/.test(domain)) {
    return null;
  }

  return domain;
}

export function getShopifyConfiguration(env: NodeJS.ProcessEnv = process.env): ShopifyConfiguration | null {
  const storeDomain = normaliseStoreDomain(env.SHOPIFY_STORE_DOMAIN);
  const privateAccessToken = clean(env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN);

  if (!storeDomain || !privateAccessToken) {
    return null;
  }

  return {
    apiVersion: clean(env.SHOPIFY_STOREFRONT_API_VERSION) || DEFAULT_API_VERSION,
    defaultCountry: (clean(env.SHOPIFY_DEFAULT_COUNTRY) || DEFAULT_COUNTRY).toUpperCase(),
    featuredCollectionHandle: clean(env.SHOPIFY_FEATURED_COLLECTION_HANDLE) || null,
    privateAccessToken,
    storeDomain,
  };
}

export function getConfiguredShopifyStoreDomain(env: NodeJS.ProcessEnv = process.env): string | null {
  return normaliseStoreDomain(env.SHOPIFY_STORE_DOMAIN);
}

export function getShopMode(env: NodeJS.ProcessEnv = process.env): ShopMode {
  return getShopifyConfiguration(env) ? "shopify" : "demo";
}

export function isShopifyConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return getShopMode(env) === "shopify";
}

export function isShopEnabledForProduction(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.SHOP_ENABLED === "true";
}

export function validateShopifyProductionConfiguration(env: NodeJS.ProcessEnv = process.env): string | null {
  if (env.NODE_ENV !== "production" || !isShopEnabledForProduction(env)) {
    return null;
  }

  if (!getShopifyConfiguration(env)) {
    return "SHOP_ENABLED=true requires SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_PRIVATE_TOKEN in production.";
  }

  return null;
}

export const shopifyDefaults = { DEFAULT_API_VERSION, DEFAULT_COUNTRY };
