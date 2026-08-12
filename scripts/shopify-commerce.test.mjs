import assert from "node:assert/strict";
import test from "node:test";
import { getShopMode, getShopifyConfiguration, normaliseStoreDomain, validateShopifyProductionConfiguration } from "../src/lib/shopify/config.ts";
import { formatShopMoney } from "../src/lib/shopify/money.ts";
import { getInitialVariant, normaliseProduct, resolveVariant } from "../src/lib/shopify/normalise.ts";
import { addDemoCartLine, parseDemoCart, removeDemoCartLine, updateDemoCartLine } from "../src/lib/shopify/demo-cart-state.ts";
import { isAllowedShopifyCheckoutUrl } from "../src/lib/shopify/checkout-url.ts";

test("formatShopMoney preserves Shopify currency codes", () => {
  assert.match(formatShopMoney({ amount: "349.00", currencyCode: "ZAR" }), /349/);
  assert.match(formatShopMoney({ amount: "12.50", currencyCode: "USD" }), /12\.50|12,50/);
});

test("Shopify configuration only activates when domain and private token are present", () => {
  assert.equal(getShopMode({}), "demo");
  assert.equal(getShopMode({ SHOPIFY_STORE_DOMAIN: "panda.myshopify.com", SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "private" }), "shopify");
  assert.equal(normaliseStoreDomain("https://PANDA.myshopify.com/"), "panda.myshopify.com");
  assert.equal(normaliseStoreDomain("not a domain/path"), null);
  assert.equal(getShopifyConfiguration({ SHOPIFY_STORE_DOMAIN: "panda.myshopify.com" }), null);
});

test("production Shop requires a complete private Shopify configuration", () => {
  assert.match(validateShopifyProductionConfiguration({ NODE_ENV: "production", SHOP_ENABLED: "true" }) ?? "", /requires/);
  assert.equal(validateShopifyProductionConfiguration({ NODE_ENV: "production", SHOP_ENABLED: "true", SHOPIFY_STORE_DOMAIN: "panda.myshopify.com", SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "private" }), null);
});

test("product normalisation and variant resolution remain data driven", () => {
  const product = normaliseProduct({
    availableForSale: true,
    description: "Test",
    featuredImage: null,
    handle: "test-product",
    id: "product-1",
    images: { nodes: [] },
    options: [{ name: "Size", values: ["5-6", "7-8"] }, { name: "Colour", values: ["Blue", "Red"] }],
    priceRange: { maxVariantPrice: { amount: "10", currencyCode: "ZAR" }, minVariantPrice: { amount: "10", currencyCode: "ZAR" } },
    title: "Test product",
    variants: { nodes: [
      { id: "variant-blue", title: "5-6 / Blue", availableForSale: false, selectedOptions: [{ name: "Size", value: "5-6" }, { name: "Colour", value: "Blue" }], price: { amount: "10", currencyCode: "ZAR" }, compareAtPrice: null, image: null },
      { id: "variant-red", title: "7-8 / Red", availableForSale: true, selectedOptions: [{ name: "Size", value: "7-8" }, { name: "Colour", value: "Red" }], price: { amount: "12", currencyCode: "ZAR" }, compareAtPrice: null, image: null },
    ] },
  });
  assert.equal(getInitialVariant(product)?.id, "variant-red");
  assert.equal(resolveVariant(product, { Size: "5-6", Colour: "Blue" })?.availableForSale, false);
  assert.equal(resolveVariant(product, { Size: "7-8", Colour: "Red" })?.id, "variant-red");
});

test("demo cart supports add, update and remove state transitions without impersonating Shopify", () => {
  const first = addDemoCartLine({ lines: [] }, "variant-1", 1);
  const second = addDemoCartLine(first, "variant-1", 2);
  assert.equal(second.lines[0].quantity, 3);
  const updated = updateDemoCartLine(second, "variant-1", 1);
  assert.equal(updated.lines[0].quantity, 1);
  assert.equal(removeDemoCartLine(updated, "variant-1").lines.length, 0);
  assert.deepEqual(parseDemoCart("not-json"), { lines: [] });
});

test("checkout URL allowlisting permits Shopify HTTPS and rejects arbitrary destinations", () => {
  assert.equal(isAllowedShopifyCheckoutUrl("https://panda.myshopify.com/checkouts/example", "panda.myshopify.com"), true);
  assert.equal(isAllowedShopifyCheckoutUrl("https://checkout.shopify.com/example", null), true);
  assert.equal(isAllowedShopifyCheckoutUrl("http://panda.myshopify.com/checkouts/example", "panda.myshopify.com"), false);
  assert.equal(isAllowedShopifyCheckoutUrl("https://payment.example.com/checkout", "panda.myshopify.com"), false);
});
