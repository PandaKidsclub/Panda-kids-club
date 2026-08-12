import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { addShopifyCartLine, getShopifyCart, removeShopifyCartLine, updateShopifyCartLine, validateQuantity } from "@/lib/shopify/cart";
import { getShopMode, getShopifyConfiguration } from "@/lib/shopify/config";
import { demoAddLine, demoCartFromState, demoRemoveLine, demoUpdateLine, parseDemoCart } from "@/lib/shopify/demo";
import { safeCommerceMessage } from "@/lib/shopify/errors";
import { cartCookieOptions, DEMO_CART_COOKIE, getTrustedBuyerIp, SHOPIFY_CART_COOKIE } from "@/lib/shopify/session";

export const dynamic = "force-dynamic";

async function currentCart(request: NextRequest) {
  const cookieStore = await cookies();
  if (getShopMode() === "demo") {
    return { cart: demoCartFromState(parseDemoCart(cookieStore.get(DEMO_CART_COOKIE)?.value)), mode: "demo" as const, warnings: [] };
  }
  const id = cookieStore.get(SHOPIFY_CART_COOKIE)?.value;
  if (!id) return { cart: null, mode: "shopify" as const, warnings: [] };
  try {
    const cart = await getShopifyCart(id, getTrustedBuyerIp(request));
    return { cart, mode: "shopify" as const, warnings: [] };
  } catch {
    return { cart: null, mode: "shopify" as const, warnings: [] };
  }
}

function errorResponse(error: unknown, status = 400) {
  return NextResponse.json({ error: safeCommerceMessage(error) }, { status });
}

export async function GET(request: NextRequest) {
  const result = await currentCart(request);
  const response = NextResponse.json(result);
  if (!result.cart && result.mode === "shopify") response.cookies.delete(SHOPIFY_CART_COOKIE);
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { quantity?: unknown; variantId?: unknown };
    const quantity = validateQuantity(body.quantity);
    if (!quantity || typeof body.variantId !== "string" || body.variantId.length > 256) return errorResponse(new Error("Choose a valid product option."));
    const cookieStore = await cookies();
    if (getShopMode() === "demo") {
      const state = demoAddLine(parseDemoCart(cookieStore.get(DEMO_CART_COOKIE)?.value), body.variantId, quantity);
      const response = NextResponse.json({ cart: demoCartFromState(state), mode: "demo", warnings: [] });
      response.cookies.set(DEMO_CART_COOKIE, JSON.stringify(state), cartCookieOptions);
      return response;
    }
    const result = await addShopifyCartLine(cookieStore.get(SHOPIFY_CART_COOKIE)?.value ?? null, body.variantId, quantity, getShopifyConfiguration()!.defaultCountry, getTrustedBuyerIp(request));
    const response = NextResponse.json(result);
    response.cookies.set(SHOPIFY_CART_COOKIE, result.cart.id!, cartCookieOptions);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as { lineId?: unknown; quantity?: unknown };
    const quantity = validateQuantity(body.quantity);
    if (!quantity || typeof body.lineId !== "string" || body.lineId.length > 256) return errorResponse(new Error("Choose a valid quantity."));
    const cookieStore = await cookies();
    if (getShopMode() === "demo") {
      const state = demoUpdateLine(parseDemoCart(cookieStore.get(DEMO_CART_COOKIE)?.value), body.lineId, quantity);
      const response = NextResponse.json({ cart: demoCartFromState(state), mode: "demo", warnings: [] });
      response.cookies.set(DEMO_CART_COOKIE, JSON.stringify(state), cartCookieOptions);
      return response;
    }
    const cartId = cookieStore.get(SHOPIFY_CART_COOKIE)?.value;
    if (!cartId) return errorResponse(new Error("Your cart is empty."));
    const result = await updateShopifyCartLine(cartId, body.lineId, quantity, getTrustedBuyerIp(request));
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json() as { lineId?: unknown };
    if (typeof body.lineId !== "string" || body.lineId.length > 256) return errorResponse(new Error("Choose a valid cart item."));
    const cookieStore = await cookies();
    if (getShopMode() === "demo") {
      const state = demoRemoveLine(parseDemoCart(cookieStore.get(DEMO_CART_COOKIE)?.value), body.lineId);
      const response = NextResponse.json({ cart: demoCartFromState(state), mode: "demo", warnings: [] });
      response.cookies.set(DEMO_CART_COOKIE, JSON.stringify(state), cartCookieOptions);
      return response;
    }
    const cartId = cookieStore.get(SHOPIFY_CART_COOKIE)?.value;
    if (!cartId) return errorResponse(new Error("Your cart is empty."));
    const result = await removeShopifyCartLine(cartId, body.lineId, getTrustedBuyerIp(request));
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
