import type { ReactNode } from "react";
import { ShopCartDrawer } from "@/components/shop/ShopCartDrawer";
import { ShopCartProvider } from "@/features/shop/ShopCartProvider";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return <ShopCartProvider>{children}<ShopCartDrawer /></ShopCartProvider>;
}
