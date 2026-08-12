export const MY_LIST_STORAGE_KEY = "panda-kids-club.my-list.v1";

const MY_LIST_STORAGE_VERSION = 1;

interface MyListStoragePayload {
  version: number;
  slugs: string[];
}

type IsKnownProgramme = (slug: string) => boolean;

function sanitizeSlugs(value: unknown, isKnownProgramme: IsKnownProgramme): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();

  return value.flatMap((item) => {
    if (typeof item !== "string" || seen.has(item) || !isKnownProgramme(item)) {
      return [];
    }

    seen.add(item);
    return [item];
  });
}

export function parseMyListStorage(value: string | null, isKnownProgramme: IsKnownProgramme): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!parsed || typeof parsed !== "object") {
      return [];
    }

    const payload = parsed as Record<string, unknown>;

    if (
      !Object.hasOwn(payload, "version")
      || !Object.hasOwn(payload, "slugs")
      || payload.version !== MY_LIST_STORAGE_VERSION
    ) {
      return [];
    }

    return sanitizeSlugs(payload.slugs, isKnownProgramme);
  } catch {
    return [];
  }
}

export function readMyListStorage(isKnownProgramme: IsKnownProgramme): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return parseMyListStorage(window.localStorage.getItem(MY_LIST_STORAGE_KEY), isKnownProgramme);
  } catch {
    return [];
  }
}

export function writeMyListStorage(slugs: string[]): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const payload: MyListStoragePayload = {
    version: MY_LIST_STORAGE_VERSION,
    slugs,
  };

  try {
    window.localStorage.setItem(MY_LIST_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}
