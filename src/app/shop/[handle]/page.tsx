import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ShopProductDetailClient } from "@/components/shop/ShopProductDetailClient";
import { getShopProductByHandle } from "@/lib/shopify/products";

interface ProductPageProps { params: Promise<{ handle: string }>; }

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getShopProductByHandle(handle);
  if (!product) return { title: "Product not found" };
  return { description: product.description, openGraph: product.featuredImage ? { images: [{ alt: product.featuredImage.altText ?? product.title, url: product.featuredImage.url }] } : undefined, title: product.title };
}

export default async function ShopProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getShopProductByHandle(handle);
  if (!product) notFound();
  return <PageContainer theme="shop"><main className="shop-product-page"><Link className="shop-back-link" href="/shop">Back to Shop</Link><ShopProductDetailClient product={product} /></main></PageContainer>;
}
