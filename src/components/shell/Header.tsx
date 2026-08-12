"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/shell/BrandMark";
import { PrimaryNavigation } from "@/components/shell/PrimaryNavigation";
import { ProfileButton } from "@/components/shell/ProfileButton";
import { SearchButton } from "@/components/shell/SearchButton";
import { getPageThemeForPathname } from "@/lib/theme/page-themes";

export function Header() {
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = useState(false);
  const theme = getPageThemeForPathname(pathname);

  useEffect(() => {
    const updateScrollState = () => setHasScrolled(window.scrollY > 12);

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <header className="site-header" data-page-theme={theme} data-scrolled={hasScrolled || undefined}>
      <div className="site-header__inner">
        <BrandMark />
        <PrimaryNavigation />
        <div className="site-header__actions" aria-label="Account and search">
          <SearchButton />
          <ProfileButton />
        </div>
      </div>
    </header>
  );
}
