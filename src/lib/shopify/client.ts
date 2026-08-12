import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import { getShopifyConfiguration } from "@/lib/shopify/config";
import { ShopifyCommerceError } from "@/lib/shopify/errors";

interface ShopifyRequestOptions {
  buyerIp?: string | null;
  cache?: "products" | "no-store";
}

export async function requestShopify<T>(operation: string, variables?: Record<string, unknown>, options: ShopifyRequestOptions = {}): Promise<T> {
  const config = getShopifyConfiguration();
  if (!config) throw new ShopifyCommerceError("Shopify commerce is not configured.");

  const client = createStorefrontApiClient({
    apiVersion: config.apiVersion,
    clientName: "Panda Kids Club storefront",
    customFetchApi: async (url, init) => fetch(url, {
      ...init,
      cache: options.cache === "no-store" ? "no-store" : "force-cache",
      next: options.cache === "products" ? { revalidate: 120 } : undefined,
    } as RequestInit),
    privateAccessToken: config.privateAccessToken,
    retries: 1,
    storeDomain: `https://${config.storeDomain}`,
  });

  const response = await client.request<T>(operation, {
    headers: options.buyerIp ? { "Shopify-Storefront-Buyer-IP": options.buyerIp } : undefined,
    variables,
  });

  if (response.errors || !response.data) {
    throw new ShopifyCommerceError();
  }

  return response.data;
}
