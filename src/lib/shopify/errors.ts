export class ShopifyCommerceError extends Error {
  constructor(message = "Shopify is temporarily unavailable. Please try again shortly.") {
    super(message);
    this.name = "ShopifyCommerceError";
  }
}

export function safeCommerceMessage(error: unknown): string {
  if (error instanceof ShopifyCommerceError) {
    return error.message;
  }

  return "We could not update your cart just now. Please try again.";
}
