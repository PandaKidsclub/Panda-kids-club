import type { PageTheme } from "@/lib/theme/page-themes";

const libraryPaths = new Set(["/", "/stories", "/learn", "/heroes", "/specials"]);

export function getLibraryPathForTheme(theme: PageTheme): string | null {
  switch (theme) {
    case "home":
      return "/";
    case "stories":
      return "/stories";
    case "learn":
      return "/learn";
    case "heroes":
      return "/heroes";
    case "specials":
      return "/specials";
    default:
      return null;
  }
}

export function getWatchHref(slug: string, fromPath?: string | null): string {
  const watchPath = `/watch/${encodeURIComponent(slug)}`;

  return fromPath ? `${watchPath}?from=${encodeURIComponent(fromPath)}` : watchPath;
}

export function getSafeWatchReturnPath(fromPath: string | undefined, slug: string): string {
  const titlePath = `/title/${encodeURIComponent(slug)}`;

  if (fromPath && (fromPath === titlePath || libraryPaths.has(fromPath))) {
    return fromPath;
  }

  return titlePath;
}
