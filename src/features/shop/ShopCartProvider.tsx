"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import type { ShopCart, ShopCartResult } from "@/lib/shopify/types";

interface ShopCartContextValue {
  addLine: (variantId: string, quantity: number) => Promise<void>;
  cart: ShopCart | null;
  error: string | null;
  isBusy: boolean;
  isDrawerOpen: boolean;
  mode: "demo" | "shopify";
  openCart: () => void;
  removeLine: (lineId: string) => Promise<void>;
  setDrawerOpen: (open: boolean) => void;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  warnings: string[];
}

const ShopCartContext = createContext<ShopCartContextValue | null>(null);

async function requestCart(path: string, method = "GET", body?: unknown): Promise<ShopCartResult> {
  const response = await fetch(path, {
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    method,
  });
  const data = await response.json() as ShopCartResult & { error?: string };
  if (!response.ok || data.error) throw new Error(data.error || "We could not update your cart just now.");
  return data;
}

export function ShopCartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopCart | null>(null);
  const [mode, setMode] = useState<"demo" | "shopify">("demo");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const apply = useCallback((result: ShopCartResult) => {
    setCart(result.cart);
    setMode(result.mode);
    setWarnings(result.warnings);
  }, []);

  useEffect(() => {
    requestCart("/api/shop/cart").then(apply).catch(() => setError("Your cart could not be restored just now."));
  }, [apply]);

  const mutate = useCallback(async (method: string, body?: unknown) => {
    setError(null);
    setIsBusy(true);
    try {
      const result = await requestCart("/api/shop/cart", method, body);
      apply(result);
      return result;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We could not update your cart just now.");
      throw requestError;
    } finally {
      setIsBusy(false);
    }
  }, [apply]);

  const addLine = useCallback(async (variantId: string, quantity: number) => {
    await mutate("POST", { quantity, variantId });
    setDrawerOpen(true);
  }, [mutate]);

  return (
    <ShopCartContext.Provider value={{
      addLine,
      cart,
      error,
      isBusy,
      isDrawerOpen,
      mode,
      openCart: () => setDrawerOpen(true),
      removeLine: (lineId) => mutate("DELETE", { lineId }).then(() => undefined),
      setDrawerOpen,
      updateLine: (lineId, quantity) => mutate("PATCH", { lineId, quantity }).then(() => undefined),
      warnings,
    }}>
      {children}
    </ShopCartContext.Provider>
  );
}

export function useShopCart(): ShopCartContextValue {
  const context = useContext(ShopCartContext);
  if (!context) throw new Error("Shop cart controls must be rendered inside ShopCartProvider.");
  return context;
}
