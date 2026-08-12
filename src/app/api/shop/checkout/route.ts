import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getShopifyCart } from "@/lib/shopify/cart";
import { getShopMode } from "@/lib/shopify/config";
import { getTrustedBuyerIp, isAllowedCheckoutUrl, SHOPIFY_CART_COOKIE } from "@/lib/shopify/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (getShopMode() === "demo") {
    return NextResponse.json({ error: "Demo mode does not open checkout. Configure Shopify to test a real checkout." }, { status: 409 });
  }
  const cookieStore = await cookies();
  const cartId = cookieStore.get(SHOPIFY_CART_COOKIE)?.value;
  if (!cartId) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  try {
    const cart = await getShopifyCart(cartId, getTrustedBuyerIp(request));
    if (!cart?.checkoutUrl || !isAllowedCheckoutUrl(cart.checkoutUrl)) {
      return NextResponse.json({ error: "Checkout is unavailable. Please try again." }, { status: 400 });
    }
    return NextResponse.json({ checkoutUrl: cart.checkoutUrl });
  } catch {
    return NextResponse.json({ error: "Checkout is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
