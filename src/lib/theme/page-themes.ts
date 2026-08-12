export const pageThemes = [
  "home",
  "stories",
  "learn",
  "heroes",
  "specials",
  "my-list",
  "coming-soon",
  "monthly-updates",
  "search",
  "shop",
  "title",
  "watch",
] as const;

export type PageTheme = (typeof pageThemes)[number];

const routeThemes: Array<{ prefix: string; theme: PageTheme }> = [
  { prefix: "/stories", theme: "stories" },
  { prefix: "/learn", theme: "learn" },
  { prefix: "/heroes", theme: "heroes" },
  { prefix: "/specials", theme: "specials" },
  { prefix: "/coming-soon", theme: "coming-soon" },
  { prefix: "/my-list", theme: "my-list" },
  { prefix: "/monthly-updates", theme: "monthly-updates" },
  { prefix: "/search", theme: "search" },
  { prefix: "/shop", theme: "shop" },
  { prefix: "/title", theme: "title" },
  { prefix: "/watch", theme: "watch" },
];

export function getPageThemeForPathname(pathname: string): PageTheme {
  return routeThemes.find(({ prefix }) => pathname.startsWith(prefix))?.theme ?? "home";
}
