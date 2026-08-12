import { getShopifyConfiguration } from "../src/lib/shopify/config.ts";

const config = getShopifyConfiguration();

if (!config) {
  console.log("SHOPIFY NOT CONFIGURED — DEMO MODE");
  process.exit(0);
}

if (!config.storeDomain.includes(".")) {
  console.error("SHOPIFY CONFIGURATION ERROR: SHOPIFY_STORE_DOMAIN must be an HTTPS-capable hostname.");
  process.exit(1);
}

const response = await fetch(`https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`, {
  body: JSON.stringify({ query: "query ShopifyHealth { shop { name primaryDomain { url } paymentSettings { currencyCode } } products(first: 1) { nodes { id } } }" }),
  headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Private-Token": config.privateAccessToken },
  method: "POST",
});
const body = await response.json().catch(() => null);
if (!response.ok || body?.errors || !body?.data?.shop?.name) {
  console.error("SHOPIFY CHECK FAILED: Storefront API did not return shop data.");
  process.exit(1);
}
console.log(`SHOPIFY CHECK OK: ${body.data.shop.name} (${config.apiVersion}, ${body.data.shop.paymentSettings?.currencyCode ?? "currency unavailable"})`);
