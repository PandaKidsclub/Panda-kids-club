"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ShopCartButton } from "@/components/shop/ShopCartDrawer";
import { useShopCart } from "@/features/shop/ShopCartProvider";
import { formatShopMoney } from "@/lib/shopify/money";
import { getInitialVariant, resolveVariant } from "@/lib/shopify/normalise";
import type { ShopProduct } from "@/lib/shopify/types";

export function ShopProductDetailClient({ product }: { product: ShopProduct }) {
  const initialVariant = useMemo(() => getInitialVariant(product), [product]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => Object.fromEntries(initialVariant?.selectedOptions.map((option) => [option.name, option.value]) ?? []));
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addLine, error, isBusy } = useShopCart();
  const variant = resolveVariant(product, selectedOptions) ?? initialVariant;
  const images = product.images.length > 0 ? product.images : product.featuredImage ? [product.featuredImage] : [];
  const displayImage = variant?.image ?? images[activeImage] ?? null;

  return <div className="shop-product-detail">
    <section aria-label={`${product.title} images`} className="shop-product-gallery">
      <div className="shop-product-gallery__primary">{displayImage ? <Image alt={displayImage.altText ?? product.title} fill priority sizes="(max-width: 900px) 100vw, 52vw" src={displayImage.url} /> : null}</div>
      {images.length > 1 ? <div className="shop-product-gallery__thumbnails">{images.map((image, index) => <button aria-label={`Show image ${index + 1}`} aria-pressed={index === activeImage} className="shop-product-gallery__thumbnail" key={image.url} type="button" onClick={() => setActiveImage(index)}><Image alt="" fill sizes="72px" src={image.url} /></button>)}</div> : null}
    </section>
    <section className="shop-product-detail__copy">
      <div className="shop-product-detail__heading"><p className="shop-product-detail__eyebrow">PANDA SHOP</p><ShopCartButton /></div><h1>{product.title}</h1>
      {variant ? <div className="shop-product-detail__price"><strong>{formatShopMoney(variant.price)}</strong>{variant.compareAtPrice ? <del>{formatShopMoney(variant.compareAtPrice)}</del> : null}</div> : null}
      <p>{product.description}</p>
      {product.options.map((option) => <fieldset className="shop-variant-selector" key={option.name}><legend>{option.name}</legend><div>{option.values.map((value) => {
        const candidate = resolveVariant(product, { ...selectedOptions, [option.name]: value });
        const unavailable = !candidate?.availableForSale;
        return <button aria-pressed={selectedOptions[option.name] === value} disabled={!candidate} key={value} type="button" data-unavailable={unavailable || undefined} onClick={() => setSelectedOptions((current) => ({ ...current, [option.name]: value }))}>{value}</button>;
      })}</div></fieldset>)}
      <div className="shop-product-detail__purchase"><div className="shop-quantity-control" aria-label="Quantity"><button aria-label="Decrease quantity" disabled={quantity <= 1 || isBusy} type="button" onClick={() => setQuantity((current) => current - 1)}>-</button><span>{quantity}</span><button aria-label="Increase quantity" disabled={quantity >= 20 || isBusy} type="button" onClick={() => setQuantity((current) => current + 1)}>+</button></div>
        <button className="button button--primary shop-add-to-cart" disabled={!variant?.availableForSale || isBusy} type="button" onClick={() => variant && addLine(variant.id, quantity)}>{isBusy ? "Adding..." : variant?.availableForSale ? "Add to Cart" : "Sold Out"}</button></div>
      {error ? <p className="shop-product-detail__error" role="alert">{error}</p> : null}
      <p className="shop-product-detail__reassurance">Secure checkout, shipping and taxes are handled by Shopify.</p>
    </section>
  </div>;
}
