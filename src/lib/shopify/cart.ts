import { CART_CREATE, CART_LINES_ADD, CART_LINES_REMOVE, CART_LINES_UPDATE, CART_QUERY } from "@/lib/shopify/graphql/operations";
import { requestShopify } from "@/lib/shopify/client";
import { normaliseCart } from "@/lib/shopify/normalise";
import { ShopifyCommerceError } from "@/lib/shopify/errors";
import type { ShopCart, ShopCartResult } from "@/lib/shopify/types";

interface CartPayload {
  cart: unknown | null;
  userErrors: Array<{ message?: string }>;
  warnings: Array<{ message?: string }>;
}

function cartResult(payload: CartPayload): ShopCartResult {
  const userErrors = payload.userErrors?.map((error) => error.message).filter((message): message is string => Boolean(message)) ?? [];
  if (userErrors.length > 0) throw new ShopifyCommerceError(userErrors[0]);
  if (!payload.cart) throw new ShopifyCommerceError("Your cart is no longer available. Please add the item again.");
  return { cart: normaliseCart(payload.cart), mode: "shopify", warnings: payload.warnings?.map((warning) => warning.message).filter((message): message is string => Boolean(message)) ?? [] };
}

export function validateQuantity(value: unknown): number | null {
  const quantity = typeof value === "number" ? value : Number(value);
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 20 ? quantity : null;
}

export async function getShopifyCart(cartId: string, buyerIp?: string | null): Promise<ShopCart | null> {
  const data = await requestShopify<{ cart: unknown | null }>(CART_QUERY, { id: cartId }, { buyerIp, cache: "no-store" });
  return data.cart ? normaliseCart(data.cart) : null;
}

export async function addShopifyCartLine(cartId: string | null, variantId: string, quantity: number, countryCode: string, buyerIp?: string | null): Promise<ShopCartResult> {
  if (!cartId) {
    const data = await requestShopify<{ cartCreate: CartPayload }>(CART_CREATE, {
      input: { buyerIdentity: { countryCode }, lines: [{ merchandiseId: variantId, quantity }] },
    }, { buyerIp, cache: "no-store" });
    return cartResult(data.cartCreate);
  }
  const data = await requestShopify<{ cartLinesAdd: CartPayload }>(CART_LINES_ADD, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  }, { buyerIp, cache: "no-store" });
  return cartResult(data.cartLinesAdd);
}

export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number, buyerIp?: string | null): Promise<ShopCartResult> {
  const data = await requestShopify<{ cartLinesUpdate: CartPayload }>(CART_LINES_UPDATE, {
    cartId,
    lines: [{ id: lineId, quantity }],
  }, { buyerIp, cache: "no-store" });
  return cartResult(data.cartLinesUpdate);
}

export async function removeShopifyCartLine(cartId: string, lineId: string, buyerIp?: string | null): Promise<ShopCartResult> {
  const data = await requestShopify<{ cartLinesRemove: CartPayload }>(CART_LINES_REMOVE, {
    cartId,
    lineIds: [lineId],
  }, { buyerIp, cache: "no-store" });
  return cartResult(data.cartLinesRemove);
}
