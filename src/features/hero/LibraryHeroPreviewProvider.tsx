"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { HeroStageModel } from "@/features/hero/hero-stage.types";
import { useHeroStage } from "@/features/hero/useHeroStage";
import type { HeroSelectionSource, Programme } from "@/lib/content/types";

export const PREVIEW_INTENT_DWELL_MS = 400;

type PreviewIntentSource = Extract<HeroSelectionSource, "hover" | "focus">;

interface LibraryHeroPreviewContextValue extends HeroStageModel {
  beginPreviewIntent: (programme: Programme, source: PreviewIntentSource) => void;
  cancelPreviewIntent: (programme: Programme, source: PreviewIntentSource) => void;
  selectProgrammeImmediately: (programme: Programme, source: HeroSelectionSource) => void;
}

interface LibraryHeroPreviewProviderProps {
  children: ReactNode;
  initialProgramme: Programme;
}

interface PreviewIntentTimer {
  programmeId: string;
  source: PreviewIntentSource;
  timeoutId: number;
}

interface NavigatorConnection extends Navigator {
  connection?: {
    saveData?: boolean;
    addEventListener?: (type: "change", listener: () => void) => void;
    removeEventListener?: (type: "change", listener: () => void) => void;
  };
}

const LibraryHeroPreviewContext = createContext<LibraryHeroPreviewContextValue | null>(null);

export function LibraryHeroPreviewProvider({ children, initialProgramme }: LibraryHeroPreviewProviderProps) {
  const model = useHeroStage({ initialProgramme });
  const intentTimerRef = useRef<PreviewIntentTimer | null>(null);

  const cancelPendingIntent = useCallback(() => {
    const pendingIntent = intentTimerRef.current;

    if (pendingIntent) {
      window.clearTimeout(pendingIntent.timeoutId);
      intentTimerRef.current = null;
    }
  }, []);

  useEffect(() => cancelPendingIntent, [cancelPendingIntent]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as NavigatorConnection).connection;

    const updatePreferences = () => {
      model.actions.setPlaybackPreferences({
        prefersReducedMotion: motionQuery.matches,
        saveData: connection?.saveData === true,
      });
    };

    updatePreferences();
    motionQuery.addEventListener("change", updatePreferences);
    connection?.addEventListener?.("change", updatePreferences);

    return () => {
      motionQuery.removeEventListener("change", updatePreferences);
      connection?.removeEventListener?.("change", updatePreferences);
    };
  }, [model.actions]);

  const beginPreviewIntent = useCallback(
    (programme: Programme, source: PreviewIntentSource) => {
      if (model.state.selectedProgramme?.id === programme.id) {
        return;
      }

      cancelPendingIntent();

      const timeoutId = window.setTimeout(() => {
        intentTimerRef.current = null;
        model.actions.selectProgramme(programme, source);
      }, PREVIEW_INTENT_DWELL_MS);

      intentTimerRef.current = { programmeId: programme.id, source, timeoutId };
    },
    [cancelPendingIntent, model.actions, model.state.selectedProgramme?.id],
  );

  const cancelPreviewIntent = useCallback(
    (programme: Programme, source: PreviewIntentSource) => {
      const pendingIntent = intentTimerRef.current;

      if (pendingIntent?.programmeId === programme.id && pendingIntent.source === source) {
        cancelPendingIntent();
      }
    },
    [cancelPendingIntent],
  );

  const selectProgrammeImmediately = useCallback(
    (programme: Programme, source: HeroSelectionSource) => {
      cancelPendingIntent();
      model.actions.selectProgramme(programme, source);
    },
    [cancelPendingIntent, model.actions],
  );

  const value = useMemo<LibraryHeroPreviewContextValue>(
    () => ({
      ...model,
      beginPreviewIntent,
      cancelPreviewIntent,
      selectProgrammeImmediately,
    }),
    [beginPreviewIntent, cancelPreviewIntent, model, selectProgrammeImmediately],
  );

  return <LibraryHeroPreviewContext.Provider value={value}>{children}</LibraryHeroPreviewContext.Provider>;
}

export function useLibraryHeroPreview() {
  return useContext(LibraryHeroPreviewContext);
}
