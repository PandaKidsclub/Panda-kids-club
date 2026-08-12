"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";
import {
  isResumableWatchProgress,
  readWatchProgress,
  WATCH_PROGRESS_CHANGED_EVENT,
  WATCH_PROGRESS_STORAGE_KEY,
} from "@/features/watch-progress/watch-progress-storage";

interface ContinueWatchingActionProps {
  href: string;
  slug: string;
}

export function ContinueWatchingAction({ href, slug }: ContinueWatchingActionProps) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === WATCH_PROGRESS_STORAGE_KEY) {
        onStoreChange();
      }
    };

    window.addEventListener(WATCH_PROGRESS_CHANGED_EVENT, onStoreChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(WATCH_PROGRESS_CHANGED_EVENT, onStoreChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);
  const getSnapshot = useCallback(() => isResumableWatchProgress(readWatchProgress(slug)), [slug]);
  const canContinue = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const label = canContinue ? "Continue watching" : "Play";

  return (
    <Link aria-label={label} className="button button--primary" href={href}>
      <span className="control-icon control-icon--play" aria-hidden="true" />
      {label}
    </Link>
  );
}
