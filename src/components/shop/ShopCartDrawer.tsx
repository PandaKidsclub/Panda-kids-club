"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useShopCart } from "@/features/shop/ShopCartProvider";
import { formatShopMoney } from "@/lib/shopify/money";

export function ShopCartButton() {
  const { cart, openCart } = useShopCart();
  return <button className="shop-cart-button" type="button" onClick={openCart}>Cart <span aria-label={`${cart?.totalQuantity ?? 0} items`}>{cart?.totalQuantity ?? 0}</span></button>;
}

export function ShopCartDrawer() {
  const { cart, error, isBusy, isDrawerOpen, mode, removeLine, setDrawerOpen, updateLine, warnings } = useShopCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isDrawerOpen) return;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const timeout = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setDrawerOpen(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [isDrawerOpen, setDrawerOpen]);

  const checkout = async () => {
    const response = await fetch("/api/shop/checkout", { method: "POST" });
    const data = await response.json() as { checkoutUrl?: string; error?: string };
    if (response.ok && data.checkoutUrl) window.location.assign(data.checkoutUrl);
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="shop-cart-layer" role="presentation">
      <button aria-label="Close cart" className="shop-cart-layer__backdrop" type="button" onClick={() => setDrawerOpen(false)} />
      <aside aria-labelledby="shop-cart-title" aria-modal="true" className="shop-cart-drawer" role="dialog">
        <div className="shop-cart-drawer__header">
          <div><p>YOUR PANDA SHOP</p><h2 id="shop-cart-title">Cart</h2></div>
          <button ref={closeButtonRef} aria-label="Close cart" className="shop-cart-drawer__close" type="button" onClick={() => setDrawerOpen(false)}>Close</button>
        </div>
        {mode === "demo" ? <p className="shop-cart-drawer__notice">Demo cart only. Shopify checkout is enabled after merchant configuration.</p> : null}
        {error ? <p className="shop-cart-drawer__error" role="alert">{error}</p> : null}
        {warnings.map((warning) => <p key={warning} className="shop-cart-drawer__notice" role="status">{warning}</p>)}
        {!cart || cart.lines.length === 0 ? <p className="shop-cart-drawer__empty">Your cart is ready for a family favourite.</p> : (
          <>
            <ul className="shop-cart-lines">
              {cart.lines.map((line) => <li key={line.id} className="shop-cart-line">
                <div className="shop-cart-line__image">{line.merchandise.image ? <Image alt="" fill sizes="88px" src={line.merchandise.image.url} /> : null}</div>
                <div className="shop-cart-line__copy">
                  <strong>{line.merchandise.product.title}</strong>
                  {line.merchandise.selectedOptions.length > 0 ? <span>{line.merchandise.selectedOptions.map((option) => option.value).join(" / ")}</span> : null}
                  <b>{formatShopMoney(line.totalAmount)}</b>
                  <div className="shop-quantity-control" aria-label={`Quantity for ${line.merchandise.product.title}`}>
                    <button aria-label={`Decrease ${line.merchandise.product.title} quantity`} disabled={isBusy || line.quantity <= 1} type="button" onClick={() => updateLine(line.id, line.quantity - 1)}>-</button>
                    <span>{line.quantity}</span>
                    <button aria-label={`Increase ${line.merchandise.product.title} quantity`} disabled={isBusy || line.quantity >= 20} type="button" onClick={() => updateLine(line.id, line.quantity + 1)}>+</button>
                  </div>
                  <button className="shop-cart-line__remove" disabled={isBusy} type="button" onClick={() => removeLine(line.id)}>Remove</button>
                </div>
              </li>)}</ul>
            <div className="shop-cart-drawer__total"><span>Subtotal</span><strong>{formatShopMoney(cart.cost.subtotalAmount)}</strong></div>
            <button className="button button--primary shop-cart-drawer__checkout" disabled={isBusy || mode === "demo"} type="button" onClick={checkout}>Secure Checkout</button>
          </>
        )}
      </aside>
    </div>
  );
}
