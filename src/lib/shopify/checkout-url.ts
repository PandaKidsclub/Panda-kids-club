export function isAllowedShopifyCheckoutUrl(value: string | null, configuredStoreDomain: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && Boolean(
      (configuredStoreDomain && (host === configuredStoreDomain || host.endsWith(`.${configuredStoreDomain}`)))
      || host.endsWith(".myshopify.com")
      || host === "checkout.shopify.com",
    );
  } catch {
    return false;
  }
}
