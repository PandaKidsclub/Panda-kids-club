"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getProgrammeBySlug } from "@/lib/content/fixtures";
import {
  MY_LIST_STORAGE_KEY,
  parseMyListStorage,
  readMyListStorage,
  writeMyListStorage,
} from "@/features/my-list/my-list-storage";

interface MyListContextValue {
  isHydrated: boolean;
  savedSlugs: string[];
  contains: (slug: string) => boolean;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  toggle: (slug: string) => void;
}

const MyListContext = createContext<MyListContextValue | null>(null);

function isKnownProgramme(slug: string): boolean {
  return Boolean(getProgrammeBySlug(slug));
}

function sanitizeSavedSlugs(slugs: string[]): string[] {
  const seen = new Set<string>();

  return slugs.flatMap((slug) => {
    if (seen.has(slug) || !isKnownProgramme(slug)) {
      return [];
    }

    seen.add(slug);
    return [slug];
  });
}

interface MyListProviderProps {
  children: ReactNode;
}

export function MyListProvider({ children }: MyListProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const savedSlugsRef = useRef<string[]>([]);
  const isHydratedRef = useRef(false);

  const commitSavedSlugs = useCallback((nextSlugs: string[], persist: boolean) => {
    const sanitizedSlugs = sanitizeSavedSlugs(nextSlugs);
    savedSlugsRef.current = sanitizedSlugs;
    setSavedSlugs(sanitizedSlugs);

    if (persist && isHydratedRef.current) {
      writeMyListStorage(sanitizedSlugs);
    }
  }, []);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      commitSavedSlugs(readMyListStorage(isKnownProgramme), false);
      isHydratedRef.current = true;
      setIsHydrated(true);
    }, 0);

    const synchronizeStorage = (event: StorageEvent) => {
      if (event.key !== MY_LIST_STORAGE_KEY && event.key !== null) {
        return;
      }

      commitSavedSlugs(parseMyListStorage(event.newValue, isKnownProgramme), false);
    };

    window.addEventListener("storage", synchronizeStorage);
    return () => {
      window.clearTimeout(hydrationTimer);
      window.removeEventListener("storage", synchronizeStorage);
    };
  }, [commitSavedSlugs]);

  const add = useCallback((slug: string) => {
    if (!isHydratedRef.current || !isKnownProgramme(slug)) {
      return;
    }

    commitSavedSlugs([slug, ...savedSlugsRef.current.filter((savedSlug) => savedSlug !== slug)], true);
  }, [commitSavedSlugs]);

  const remove = useCallback((slug: string) => {
    if (!isHydratedRef.current) {
      return;
    }

    commitSavedSlugs(savedSlugsRef.current.filter((savedSlug) => savedSlug !== slug), true);
  }, [commitSavedSlugs]);

  const toggle = useCallback((slug: string) => {
    if (savedSlugsRef.current.includes(slug)) {
      remove(slug);
      return;
    }

    add(slug);
  }, [add, remove]);

  const contains = useCallback((slug: string) => savedSlugs.includes(slug), [savedSlugs]);

  const value = useMemo<MyListContextValue>(() => ({
    isHydrated,
    savedSlugs,
    contains,
    add,
    remove,
    toggle,
  }), [add, contains, isHydrated, remove, savedSlugs, toggle]);

  return <MyListContext.Provider value={value}>{children}</MyListContext.Provider>;
}

export function useMyList(): MyListContextValue {
  const context = useContext(MyListContext);

  if (!context) {
    throw new Error("useMyList must be used within MyListProvider");
  }

  return context;
}
