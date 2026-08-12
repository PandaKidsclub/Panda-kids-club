import type { NavigationItem } from "@/lib/content/types";

export const primaryNavigationItems: NavigationItem[] = [
  { id: "home", label: "Home", href: "/", theme: "home" },
  { id: "stories", label: "Stories", href: "/stories", theme: "stories" },
  { id: "learn", label: "Learn", href: "/learn", theme: "learn" },
  { id: "heroes", label: "Heroes", href: "/heroes", theme: "heroes" },
  { id: "specials", label: "Specials", href: "/specials", theme: "specials" },
  { id: "my-list", label: "My List", href: "/my-list", theme: "my-list" },
  { id: "coming-soon", label: "Coming Soon", href: "/coming-soon", theme: "coming-soon" },
  { id: "shop", label: "Shop", href: "/shop", theme: "shop" },
];
