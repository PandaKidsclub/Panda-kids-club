import type { ShopMoney } from "@/lib/shopify/types";

export function formatShopMoney(money: ShopMoney, locale = "en-ZA"): string {
  return new Intl.NumberFormat(locale, {
    currency: money.currencyCode,
    style: "currency",
  }).format(Number(money.amount));
}
