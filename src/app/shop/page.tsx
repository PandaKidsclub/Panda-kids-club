import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { ShopLanding } from "@/components/shop/ShopLanding";
import { getShopLanding } from "@/lib/shopify/products";

export const metadata: Metadata = { description: "Guardian-oriented Panda Kids Club merchandise.", title: "Panda Shop" };

export default async function ShopPage() {
  const data = await getShopLanding();
  return <PageContainer theme="shop"><ShopLanding data={data} /></PageContainer>;
}
