"use client";

import { useCallback, useMemo, useState } from "react";
import type { HeroSelectionSource, Programme } from "@/lib/content/types";
import type {
  HeroMediaStatus,
  HeroStageModel,
  HeroStageState,
  HeroTransitionState,
} from "@/features/hero/hero-stage.types";

interface UseHeroStageOptions {
  initialProgramme?: Programme | null;
  prefersReducedMotion?: boolean;
}

export function useHeroStage(options: UseHeroStageOptions = {}): HeroStageModel {
  const [state, setState] = useState<HeroStageState>({
    selectedProgramme: options.initialProgramme ?? null,
    selectionSource: options.initialProgramme ? "initial" : null,
    mediaStatus: options.initialProgramme?.heroPreviewVideo ? "loading" : "idle",
    muted: true,
    userPaused: false,
    explicitPlaybackRequested: false,
    playbackRequestVersion: 0,
    transitionState: "idle",
    prefersReducedMotion: options.prefersReducedMotion ?? false,
    saveData: false,
    heroVisible: true,
    documentVisible: true,
    failedVideoSrc: null,
  });

  const selectProgramme = useCallback((programme: Programme, source: HeroSelectionSource) => {
    setState((current) => ({
      ...current,
      selectedProgramme: programme,
      selectionSource: source,
      mediaStatus: programme.heroPreviewVideo ? "loading" : "idle",
      transitionState: "loading",
      explicitPlaybackRequested: false,
      failedVideoSrc: null,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((current) => ({
      ...current,
      selectedProgramme: null,
      selectionSource: null,
      mediaStatus: "idle",
      transitionState: "idle",
      explicitPlaybackRequested: false,
      failedVideoSrc: null,
    }));
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setState((current) => ({ ...current, muted }));
  }, []);

  const setUserPaused = useCallback((userPaused: boolean) => {
    setState((current) => ({
      ...current,
      userPaused,
      explicitPlaybackRequested: userPaused ? false : current.explicitPlaybackRequested,
    }));
  }, []);

  const requestPlayback = useCallback(() => {
    setState((current) => ({
      ...current,
      userPaused: false,
      explicitPlaybackRequested: true,
      playbackRequestVersion: current.playbackRequestVersion + 1,
    }));
  }, []);

  const setMediaStatus = useCallback((mediaStatus: HeroMediaStatus) => {
    setState((current) => ({ ...current, mediaStatus }));
  }, []);

  const setTransitionState = useCallback((transitionState: HeroTransitionState) => {
    setState((current) => ({ ...current, transitionState }));
  }, []);

  const setHeroVisible = useCallback((heroVisible: boolean) => {
    setState((current) => (current.heroVisible === heroVisible ? current : { ...current, heroVisible }));
  }, []);

  const setDocumentVisible = useCallback((documentVisible: boolean) => {
    setState((current) => (current.documentVisible === documentVisible ? current : { ...current, documentVisible }));
  }, []);

  const setPlaybackPreferences = useCallback(
    ({ prefersReducedMotion, saveData }: { prefersReducedMotion: boolean; saveData: boolean }) => {
      setState((current) => {
        if (current.prefersReducedMotion === prefersReducedMotion && current.saveData === saveData) {
          return current;
        }

        return { ...current, prefersReducedMotion, saveData };
      });
    },
    [],
  );

  const markVideoFailed = useCallback((failedVideoSrc: string | null) => {
    setState((current) => ({
      ...current,
      mediaStatus: "error",
      transitionState: "failed",
      failedVideoSrc,
      explicitPlaybackRequested: false,
    }));
  }, []);

  const actions = useMemo(
    () => ({
      clearSelection,
      markVideoFailed,
      requestPlayback,
      selectProgramme,
      setDocumentVisible,
      setHeroVisible,
      setMediaStatus,
      setMuted,
      setPlaybackPreferences,
      setTransitionState,
      setUserPaused,
    }),
    [
      clearSelection,
      markVideoFailed,
      requestPlayback,
      selectProgramme,
      setDocumentVisible,
      setHeroVisible,
      setMediaStatus,
      setMuted,
      setPlaybackPreferences,
      setTransitionState,
      setUserPaused,
    ],
  );

  return { state, actions };
}
