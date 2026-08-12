import type { NextRequest } from "next/server";
import { isAllowedShopifyCheckoutUrl } from "@/lib/shopify/checkout-url";
import { getShopifyConfiguration } from "@/lib/shopify/config";

export const SHOPIFY_CART_COOKIE = "panda_shopify_cart";
export const DEMO_CART_COOKIE = "panda_demo_cart";

export const cartCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 30,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export function getTrustedBuyerIp(request: NextRequest): string | null {
  const platformIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-vercel-forwarded-for");
  if (platformIp && /^[0-9a-f:.]+$/i.test(platformIp)) return platformIp;
  if (process.env.TRUST_PROXY_HEADERS === "true") {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (forwarded && /^[0-9a-f:.]+$/i.test(forwarded)) return forwarded;
  }
  return null;
}

export function isAllowedCheckoutUrl(value: string | null): value is string {
  return isAllowedShopifyCheckoutUrl(value, getShopifyConfiguration()?.storeDomain?.split(":")[0] ?? null);
}
