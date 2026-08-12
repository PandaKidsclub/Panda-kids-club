import Image from "next/image";
import Link from "next/link";
import { formatShopMoney } from "@/lib/shopify/money";
import type { ShopProduct } from "@/lib/shopify/types";

export function ShopProductCard({ product }: { product: ShopProduct }) {
  const showCompareAt = product.priceRange.maxVariantPrice.amount !== product.priceRange.minVariantPrice.amount;
  return <Link aria-label={`View ${product.title}`} className="shop-product-card" href={`/shop/${encodeURIComponent(product.handle)}`}>
    <span className="shop-product-card__image">
      {product.featuredImage ? <Image alt={product.featuredImage.altText ?? product.title} fill sizes="(max-width: 640px) 78vw, (max-width: 1000px) 42vw, 23vw" src={product.featuredImage.url} /> : <span className="shop-product-card__placeholder" aria-hidden="true" />}
    </span>
    <span className="shop-product-card__copy"><strong>{product.title}</strong><span>{product.availableForSale ? "Available" : "Sold Out"}</span><b>{showCompareAt ? "From " : ""}{formatShopMoney(product.priceRange.minVariantPrice)}</b></span>
  </Link>;
}
