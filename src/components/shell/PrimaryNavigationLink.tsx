"use client";

import Link from "next/link";
import { usePointerDepthSurface } from "@/features/interaction/usePointerDepthSurface";
import type { NavigationItem } from "@/lib/content/types";

interface PrimaryNavigationLinkProps {
  item: NavigationItem;
  isActive: boolean;
}

export function PrimaryNavigationLink({ item, isActive }: PrimaryNavigationLinkProps) {
  const { attachSurface, handlePointerLeave, handlePointerMove } = usePointerDepthSurface<HTMLAnchorElement>({
    maxTiltX: 0.25,
    maxTiltY: 0.45,
  });

  return (
    <Link
      ref={attachSurface}
      className={`primary-nav__link${isActive ? " is-active" : ""}`}
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      {item.label}
    </Link>
  );
}
