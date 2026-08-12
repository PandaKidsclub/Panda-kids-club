# Shopify Commerce

Panda Shop is a custom Next.js headless storefront. Shopify is the production source of truth for products, collections, variants, availability, prices, markets, carts, discounts where later enabled, and hosted checkout. Panda does not collect payment data, run payment processing, or create orders.

## Integration Boundary

The server-only module in `src/lib/shopify/` owns the official `@shopify/storefront-api-client`, normalized Panda shop types, Storefront GraphQL operations, product/collection reads, cart mutations, money formatting, error normalization, and configuration validation. The pinned Storefront API version is `2026-07`.

Browser components call Panda route handlers at `/api/shop/cart` and `/api/shop/checkout`; they never receive a private token. Shopify product media stays separate from Panda programme media and is loaded only from configured Shopify image hosts.

## Modes

Without a complete `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`, `/shop` deliberately runs in Demo mode with development-only fixture products and an isolated HttpOnly demo cart. Demo checkout is disabled. When both variables are configured, the same UI automatically uses Shopify products, cart state, prices, availability, and `checkoutUrl`.

Set `SHOP_ENABLED=true` only for a production deployment intended to sell merchandise. `pnpm production:check` then fails when Shopify configuration is incomplete.

## Cart and Checkout

Shopify mode stores only the Shopify cart ID in the `panda_shopify_cart` HttpOnly, SameSite=Lax cookie, with a 30-day lifetime and Secure enabled in production. Cart reads/mutations are dynamic and `no-store`; product and collection queries revalidate every 120 seconds. Cart APIs validate positive integer quantities from 1 through 20 and accept Shopify cart mutation output, including user errors and warnings, as authoritative.

Checkout is a browser navigation to Shopify's current `cart.checkoutUrl`. Panda validates that the returned URL is HTTPS and belongs to the configured shop, a Shopify `myshopify.com` host, or Shopify checkout before redirecting. Panda never constructs checkout URLs from product handles.

## Buyer Context and Security

`SHOPIFY_DEFAULT_COUNTRY` provides the initial cart buyer country (default `ZA`), keeping later market expansion configuration-driven. For server-triggered buyer actions, Panda forwards `Shopify-Storefront-Buyer-IP` only from trusted Cloudflare/Vercel headers. `x-forwarded-for` is used only when `TRUST_PROXY_HEADERS=true` behind a controlled proxy. Verify that deployment topology before enabling the flag.

The private Storefront token must be a deployment secret, never `NEXT_PUBLIC_*`, source-controlled, logged, or passed to client components. The current scope is guest cart and Shopify checkout. A future guardian identity may join Shopify's Customer Account API at this server boundary; order history, webhooks, analytics, and consent policy remain future work.
