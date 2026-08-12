# Shopify Store Setup

1. Create or open the Panda Kids Club Shopify store.
2. Install and configure Shopify's Headless sales channel.
3. Create the Panda Kids Club custom storefront in that channel.
4. Create and copy a private Storefront API token with the product, collection, and cart scopes required by the storefront.
5. Create products, real variants, availability, product photography, and collections in Shopify Admin.
6. Publish those products and collections to the Panda Headless storefront channel.
7. Configure Markets, including South Africa and ZAR where appropriate, then configure shipping, taxes, and Shopify payments.
8. Add `SHOP_ENABLED=true`, `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`, `SHOPIFY_STOREFRONT_API_VERSION=2026-07`, `SHOPIFY_DEFAULT_COUNTRY=ZA`, and optionally `SHOPIFY_FEATURED_COLLECTION_HANDLE` to Panda's deployment environment. Keep the token server-only.
9. Run `pnpm shopify:check`, then verify a product, dynamic variants, cart add/update/remove, cart persistence, and the Shopify checkout handoff against a development store.
10. Complete one controlled Shopify test checkout before enabling the production Shop. Do not automate merchant financial, tax, shipping, or payment setup from Panda.

For deployments behind a trusted reverse proxy, verify the platform's buyer-IP header and only then set `TRUST_PROXY_HEADERS=true`. The store operator owns product publishing, inventory, pricing, Shopify Markets, checkout settings, and payment setup. Panda remains the headless experience.
