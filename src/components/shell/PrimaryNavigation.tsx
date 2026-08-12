"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { primaryNavigationItems } from "@/lib/content/navigation";
import { PrimaryNavigationLink } from "@/components/shell/PrimaryNavigationLink";

export function PrimaryNavigation() {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const activeItem = listRef.current?.querySelector<HTMLElement>("[aria-current='page']");
    activeItem?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  return (
    <nav className="primary-nav" aria-label="Primary navigation">
      <ul ref={listRef} className="primary-nav__list">
        {primaryNavigationItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <li key={item.id}>
              <PrimaryNavigationLink item={item} isActive={isActive} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
